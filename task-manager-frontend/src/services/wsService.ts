import { WS_URL_PATH } from '../utils/api';
import { getApiKey } from '../utils/api';
import type { WSMessage, WSAuthPayload } from '../types/api';

// WebSocket connection state
interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  clientId: string | null;
  subscriptions: string[];
}

// WebSocket handlers
type MessageHandler = (message: WSMessage) => void;

// Global WebSocket instance (singleton)
let ws: WebSocket | null = null;
let reconnectTimeout: number | null = null;
let messageHandlers: MessageHandler[] = [];

// Connection state
let state: WebSocketState = {
  connected: false,
  connecting: false,
  clientId: null,
  subscriptions: [],
};

// Generate unique client ID
const generateClientId = (): string => {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Reconnect with exponential backoff
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;

const reconnectWithBackoff = (): void => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached');
    return;
  }

  const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
  console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts + 1})`);

  reconnectTimeout = window.setTimeout(() => {
    connect();
  }, delay);
};

// Initialize WebSocket connection
export const connect = (): void => {
  if (state.connecting || state.connected) {
    return;
  }

  state.connecting = true;
  const clientId = generateClientId();
  
  // Determine protocol based on current origin
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Connect to backend WebSocket (same host as frontend, different port)
  const wsUrl = `${protocol}//${window.location.hostname}:3001${WS_URL_PATH}`;
  
  console.log('Connecting to WebSocket:', wsUrl);
  
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected');
    state.connected = true;
    state.connecting = false;
    state.clientId = clientId;
    reconnectAttempts = 0;

    // Send authentication
    const authPayload: WSAuthPayload = {
      clientId,
      apiKey: getApiKey(),
    };
    send({ type: 'auth', payload: authPayload });
  };

  ws.onmessage = (event) => {
    try {
      const message: WSMessage = JSON.parse(event.data);
      // Call all registered handlers
      messageHandlers.forEach(handler => handler(message));
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
    state.connected = false;
    state.connecting = false;
    state.subscriptions = [];

    // Attempt to reconnect
    if (event.code !== 1000) {
      reconnectAttempts++;
      reconnectWithBackoff();
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    state.connecting = false;
  };
};

// Send message through WebSocket
export const send = (message: WSMessage): void => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket not connected, message dropped:', message);
    return;
  }

  ws.send(JSON.stringify(message));
};

// Subscribe to channels
export const subscribe = (channels: string[]): void => {
  send({
    type: 'subscribe',
    payload: { channels },
  });
  state.subscriptions = [...state.subscriptions, ...channels];
};

// Unsubscribe from channels
export const unsubscribe = (channels: string[]): void => {
  send({
    type: 'unsubscribe',
    payload: { channels },
  });
  state.subscriptions = state.subscriptions.filter(c => !channels.includes(c));
};

// Register message handler
export const onMessage = (handler: MessageHandler): (() => void) => {
  messageHandlers.push(handler);
  // Return unsubscribe function
  return () => {
    messageHandlers = messageHandlers.filter(h => h !== handler);
  };
};

// Disconnect WebSocket
export const disconnect = (): void => {
  if (reconnectTimeout !== null) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  ws?.close(1000, 'Client disconnecting');
  ws = null;
  state = {
    connected: false,
    connecting: false,
    clientId: null,
    subscriptions: [],
  };
};

// Get current state
export const getState = (): WebSocketState => ({
  connected: state.connected,
  connecting: state.connecting,
  clientId: state.clientId,
  subscriptions: [...state.subscriptions],
});
