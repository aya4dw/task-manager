import apiClient from '../utils/api';
import type { Task, CreateTaskData } from '../types/task';
import type { ApiResponse, PaginatedResponse, TaskFilters } from '../types/api';

// Get all tasks with filters
export const getTasks = async (filters?: TaskFilters): Promise<ApiResponse<PaginatedResponse<Task>>> => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.tag) params.append('tag', filters.tag);
  if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  
  const response = await apiClient.get<ApiResponse<PaginatedResponse<Task>>>('/tasks');
  return response.data;
};

// Get single task by ID
export const getTask = async (id: string): Promise<ApiResponse<Task>> => {
  const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
  return response.data;
};

// Create new task
export const createTask = async (data: CreateTaskData): Promise<ApiResponse<Task>> => {
  const response = await apiClient.post<ApiResponse<Task>>('/tasks', data);
  return response.data;
};

// Update task
export const updateTask = async (id: string, data: Partial<Task>): Promise<ApiResponse<Task>> => {
  const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
  return response.data;
};

// Delete task
export const deleteTask = async (id: string): Promise<ApiResponse<{ deleted: boolean; taskId: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ deleted: boolean; taskId: string }>>(`/tasks/${id}`);
  return response.data;
};

// Assign task to agent
export const assignTask = async (
  taskId: string,
  assigneeId: string
): Promise<ApiResponse<{ taskId: string; assigneeId: string; previousAssigneeId: string; status: string }>> => {
  const response = await apiClient.post<ApiResponse<{
    taskId: string;
    assigneeId: string;
    previousAssigneeId: string;
    status: string;
  }>>(`/tasks/${taskId}/assign`, { assigneeId });
  return response.data;
};

// Move task (for drag and drop)
export const moveTask = async (
  taskId: string,
  fromColumn: string,
  toColumn: string,
  position?: number
): Promise<ApiResponse<{ taskId: string; fromColumn: string; toColumn: string; status: string }>> => {
  const response = await apiClient.post<ApiResponse<{
    taskId: string;
    fromColumn: string;
    toColumn: string;
    status: string;
  }>>(`/tasks/${taskId}/move`, { fromColumn, toColumn, position });
  return response.data;
};

// Batch task operations
export const batchTaskOperations = async (
  actions: Array<{ action: string; taskId: string; data?: any }>
): Promise<ApiResponse<{
  results: Array<{ taskId: string; success: boolean }>;
  summary: { total: number; success: number; failed: number };
}>> => {
  const response = await apiClient.post<ApiResponse<{
    results: Array<{ taskId: string; success: boolean }>;
    summary: { total: number; success: number; failed: number };
  }>>('/tasks/batch', { actions });
  return response.data;
};
