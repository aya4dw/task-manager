import { JSONStorage } from '../storage/JSONStorage';
import { Notification, NotificationType } from '../types';
import { WebSocketService } from '../services/WebSocketService';

export class NotificationService {
  private storage: JSONStorage;
  private wsService?: WebSocketService;

  constructor(storage: JSONStorage, wsService?: WebSocketService) {
    this.storage = storage;
    this.wsService = wsService;
  }

  setWebSocketService(wsService: WebSocketService): void {
    this.wsService = wsService;
  }

  async createNotification(notificationData: {
    type: NotificationType;
    title: string;
    message: string;
    targetAgentId: string;
    relatedTaskId?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    actions?: {
      type: string;
      label: string;
      url?: string;
      api?: string;
    }[];
  }): Promise<Notification> {
    const notification = await this.storage.createNotification({
      ...notificationData,
      priority: notificationData.priority || 'normal',
      actions: notificationData.actions || [],
      read: false
    });

    // Broadcast via WebSocket if available
    if (this.wsService) {
      this.wsService.sendToChannel('notifications', {
        type: 'notification',
        payload: notification
      });
    }

    return notification;
  }

  async notifyTaskAssigned(taskId: string, agentId: string, taskTitle: string): Promise<Notification> {
    return await this.createNotification({
      type: 'task_assignment',
      title: '新任务分配',
      message: `任务「${taskTitle}」已分配给您`,
      targetAgentId: agentId,
      relatedTaskId: taskId,
      priority: 'high',
      actions: [
        {
          type: 'view_task',
          label: '查看任务',
          url: `/tasks/${taskId}`
        },
        {
          type: 'accept_task',
          label: '接受任务',
          api: `/api/v1/tasks/${taskId}/receive`
        }
      ]
    });
  }

  async notifyTaskCompleted(taskId: string, agentId: string, taskTitle: string): Promise<Notification> {
    return await this.createNotification({
      type: 'task_completed',
      title: '任务已完成',
      message: `任务「${taskTitle}」已完成`,
      targetAgentId: agentId,
      relatedTaskId: taskId,
      priority: 'normal'
    });
  }

  async notifyStatusChanged(taskId: string, agentId: string, taskTitle: string, newStatus: string): Promise<Notification> {
    return await this.createNotification({
      type: 'status_changed',
      title: '任务状态变更',
      message: `任务「${taskTitle}」状态已更新为 ${newStatus}`,
      targetAgentId: agentId,
      relatedTaskId: taskId,
      priority: 'normal',
      actions: [
        {
          type: 'view_task',
          label: '查看任务',
          url: `/tasks/${taskId}`
        }
      ]
    });
  }

  async getNotifications(agentId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    return await this.storage.getNotifications(agentId, unreadOnly);
  }

  async markAsRead(id: string): Promise<boolean> {
    return await this.storage.markNotificationRead(id);
  }

  async getUnreadCount(agentId: string): Promise<number> {
    const notifications = await this.storage.getNotifications(agentId, true);
    return notifications.length;
  }
}
