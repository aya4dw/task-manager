// Task Manager Backend - Type Definitions

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'archived';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskFeedbackType = 'progress' | 'adjust' | 'help' | 'accepted' | 'info';
export type AgentStatus = 'online' | 'busy' | 'offline';
export type AgentType = 'developer' | 'designer' | 'tester' | 'manager' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string; // For display purposes
  templateId?: string;
  dueDate?: string;
  metadata?: Record<string, any>;
  history: TaskHistory[];
  feedbacks?: TaskFeedback[];
  position: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TaskFeedback {
  id: string;
  type: TaskFeedbackType;
  author: string;
  content: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface TaskHistory {
  action: string;
  actor: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description?: string;
  capabilities: string[];
  config: AgentConfig;
  status: AgentStatus;
  currentTasks: CurrentTask[];
  statistics?: AgentStatistics;
  lastHeartbeat?: string;
  registeredAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  heartbeatInterval: number;
  maxConcurrentTasks: number;
  autoAcceptTasks: boolean;
  notificationChannels: string[];
}

export interface CurrentTask {
  taskId: string;
  status: TaskStatus;
  startTime: string;
  estimatedCompletion?: string;
}

export interface AgentStatistics {
  totalAssigned: number;
  totalCompleted: number;
  totalInProgress: number;
  averageCompletionTime: number;
  successRate: number;
  overdueCount: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  stages: TemplateStage[];
  tags: string[];
  defaultPriority: Priority;
  metadata?: Record<string, any>;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TemplateStage {
  id: string;
  name: string;
  order: number;
  status: TaskStatus;
  estimatedTime: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetAgentId: string;
  relatedTaskId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  actions: NotificationAction[];
  createdAt: string;
  readAt?: string;
}

export type NotificationType = 
  | 'task_assignment'
  | 'task_completed'
  | 'status_changed'
  | 'new_message'
  | 'system_alert';

export interface NotificationAction {
  type: string;
  label: string;
  url?: string;
  api?: string;
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  actorType: 'user' | 'agent' | 'system';
  targetType: 'task' | 'agent' | 'template' | 'notification';
  targetId: string;
  details?: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
}

export interface SystemConfig {
  version: string;
  updatedAt: string;
  server: ServerConfig;
  features: FeatureConfig;
  limits: LimitConfig;
  storage: StorageConfig;
  auth: AuthConfig;
  websocket: WebSocketConfig;
}

export interface ServerConfig {
  port: number;
  host: string;
  baseUrl: string;
  allowedOrigins: string[];
}

export interface FeatureConfig {
  kanban: boolean;
  templates: boolean;
  notifications: boolean;
  analytics: boolean;
}

export interface LimitConfig {
  maxTasksPerAgent: number;
  maxTasksTotal: number;
  maxAgents: number;
  heartbeatInterval: number;
  sessionTimeout: number;
  maxHistoryLogs: number;
}

export interface StorageConfig {
  dataPath: string;
  backupPath: string;
  autoBackup: boolean;
  backupInterval: number;
}

export interface AuthConfig {
  apiKey: string;
  apiKeyExpiry: number;
  allowedIPs: string[];
}

export interface WebSocketConfig {
  pingInterval: number;
  pongTimeout: number;
  maxConnections: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// WebSocket Message Types
export interface WsMessage {
  type: string;
  payload: Record<string, any>;
  channel?: string;
}

export interface WsAuthMessage extends WsMessage {
  type: 'auth';
  payload: {
    clientId: string;
    apiKey: string;
  };
}

export interface WsSubscribeMessage extends WsMessage {
  type: 'subscribe';
  payload: {
    channels: string[];
  };
}

export interface WsUnsubscribeMessage extends WsMessage {
  type: 'unsubscribe';
  payload: {
    channels: string[];
  };
}
