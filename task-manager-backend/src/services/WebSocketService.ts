import WebSocket, { WebSocketServer } from 'ws';
import { WsMessage } from '../types';

interface ClientConnection {
  ws: WebSocket;
  clientId: string;
  channels: Set<string>;
  authenticated: boolean;
  lastPing: number;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients = new Map<string, ClientConnection>();
  private apiKey: string = 'default-api-key-change-me';

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketHandler();
  }

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  private setupWebSocketHandler(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      
      const client: ClientConnection = {
        ws,
        clientId,
        channels: new Set(),
        authenticated: false,
        lastPing: Date.now()
      };

      this.clients.set(clientId, client);

      console.log(`WebSocket client connected: ${clientId}`);

      // Handle incoming messages
      ws.on('message', (data: Buffer) => {
        try {
          const message: WsMessage = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(client, 'INVALID_MESSAGE', '无法解析消息');
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Send welcome message
      this.send(clientId, {
        type: 'connected',
        payload: {
          clientId,
          message: 'WebSocket 连接成功，请先进行认证'
        }
      });
    });
  }

  private handleMessage(client: ClientConnection, message: WsMessage): void {
    switch (message.type) {
      case 'auth':
        this.handleAuth(client, message);
        break;
      case 'subscribe':
        this.handleSubscribe(client, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(client, message);
        break;
      case 'ping':
        this.handlePing(client, message);
        break;
      default:
        // Forward unknown messages to appropriate channel
        if (message.channel && client.authenticated) {
          this.sendToChannel(message.channel, message);
        }
    }
  }

  private handleAuth(client: ClientConnection, message: WsMessage): void {
    const { clientId, apiKey } = message.payload as { clientId: string; apiKey: string };

    if (apiKey === this.apiKey) {
      client.authenticated = true;
      client.clientId = clientId;

      this.send(client.clientId, {
        type: 'auth_success',
        payload: {
          message: '认证成功',
          clientId: client.clientId
        }
      });
    } else {
      this.sendError(client, 'AUTH_FAILED', 'API Key 无效');
    }
  }

  private handleSubscribe(client: ClientConnection, message: WsMessage): void {
    if (!client.authenticated) {
      this.sendError(client, 'NOT_AUTHENTICATED', '请先认证');
      return;
    }

    const { channels } = message.payload as { channels: string[] };
    
    for (const channel of channels) {
      client.channels.add(channel);
    }

    this.send(client.clientId, {
      type: 'subscribed',
      payload: {
        channels: Array.from(client.channels)
      }
    });

    console.log(`Client ${client.clientId} subscribed to: ${channels.join(', ')}`);
  }

  private handleUnsubscribe(client: ClientConnection, message: WsMessage): void {
    if (!client.authenticated) {
      this.sendError(client, 'NOT_AUTHENTICATED', '请先认证');
      return;
    }

    const { channels } = message.payload as { channels: string[] };
    
    for (const channel of channels) {
      client.channels.delete(channel);
    }

    this.send(client.clientId, {
      type: 'unsubscribed',
      payload: {
        channels: Array.from(client.channels)
      }
    });
  }

  private handlePing(client: ClientConnection, _message: WsMessage): void {
    client.lastPing = Date.now();
    this.send(client.clientId, {
      type: 'pong',
      payload: {
        serverTime: Date.now()
      }
    });
  }

  private sendError(client: ClientConnection, code: string, message: string): void {
    this.send(client.clientId, {
      type: 'error',
      payload: {
        code,
        message
      }
    });
  }

  // Public methods

  send(clientId: string, message: WsMessage): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  broadcast(message: WsMessage): void {
    for (const client of this.clients.values()) {
      if (client.authenticated) {
        this.send(client.clientId, message);
      }
    }
  }

  sendToChannel(channel: string, message: WsMessage): void {
    for (const client of this.clients.values()) {
      if (client.channels.has(channel) && client.authenticated) {
        this.send(client.clientId, message);
      }
    }
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  getAuthenticatedCount(): number {
    return Array.from(this.clients.values()).filter(c => c.authenticated).length;
  }

  // Event broadcasting for task/agent changes

  broadcastTaskCreated(task: any): void {
    this.sendToChannel('tasks', {
      type: 'task_created',
      channel: 'tasks',
      payload: {
        task,
        createdAt: new Date().toISOString()
      }
    });
  }

  broadcastTaskUpdated(task: any, changes: string[]): void {
    this.sendToChannel('tasks', {
      type: 'task_updated',
      channel: 'tasks',
      payload: {
        task,
        changes,
        updatedAt: new Date().toISOString()
      }
    });
  }

  broadcastTaskAssigned(taskId: string, agentId: string): void {
    this.sendToChannel('agents', {
      type: 'task_assigned',
      channel: 'agents',
      payload: {
        taskId,
        agentId,
        assignedAt: new Date().toISOString()
      }
    });
  }

  broadcastTaskCompleted(task: any, completedBy: string): void {
    this.sendToChannel('tasks', {
      type: 'task_completed',
      channel: 'tasks',
      payload: {
        task,
        completedBy,
        completedAt: new Date().toISOString()
      }
    });
  }

  broadcastNotification(notification: any): void {
    this.sendToChannel('notifications', {
      type: 'notification',
      channel: 'notifications',
      payload: notification
    });
  }
}
