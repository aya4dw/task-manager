// Task Status
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'archived';

// Task Priority
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Task Feedback Type
export type TaskFeedbackType = 'progress' | 'adjust' | 'help' | 'accepted' | 'info';

// Task Feedback Entry (论坛式楼层)
export interface TaskFeedback {
  id: string;
  type: TaskFeedbackType;
  author: string;
  content: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Task History Entry (保留用于向后兼容)
export interface TaskHistory {
  action: string;
  actor: string;
  timestamp: string;
  details?: Record<string, any>;
}

// Task Interface
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string; // Add for display purposes
  templateId?: string;
  dueDate?: string;
  metadata?: Record<string, any>;
  history: TaskHistory[]; // 保留用于向后兼容
  feedbacks?: TaskFeedback[]; // 新增：论坛式反馈
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Create Task Data
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  tags: string[];
  status?: TaskStatus;
  assigneeId?: string;
  templateId?: string;
  dueDate?: string;
  metadata?: Record<string, any>;
}



// Column Configuration
export interface ColumnConfig {
  id: string;
  title: string;
  status: TaskStatus;
  color?: string;
  icon?: string;
}
