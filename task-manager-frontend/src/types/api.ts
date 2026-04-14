// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination Response
export interface PaginatedResponse<T> {
  tasks: T[];
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Task Filters
export interface TaskFilters {
  status?: string;
  priority?: string;
  tag?: string;
  assigneeId?: string;
  page?: number;
  limit?: number;
}

// WebSocket Message Types
export type WSMessageType = 
  | 'auth'
  | 'auth_success'
  | 'auth_error'
  | 'subscribe'
  | 'unsubscribe'
  | 'subscribed'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_assigned'
  | 'task_completed'
  | 'notification'
  | 'agent_online'
  | 'agent_offline'
  | 'request_tasks'
  | 'update_task';

// WebSocket Message
export interface WSMessage {
  type: WSMessageType;
  channel?: string;
  payload: any;
}

// WebSocket Auth Payload
export interface WSAuthPayload {
  clientId: string;
  apiKey: string;
}

// Notification
export interface Notification {
  id: string;
  agentId?: string;
  title: string;
  message: string;
  type: 'task_assignment' | 'task_update' | 'system' | string;
  read: boolean;
  createdAt: string;
}

// Board Filters
export interface BoardFilters {
  showArchived?: boolean;
  searchQuery?: string;
}
