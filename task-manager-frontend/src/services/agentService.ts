import apiClient from '../utils/api';
import type { Agent, CreateAgentData } from '../types/agent';
import type { ApiResponse } from '../types/api';

// Get all agents
export const getAgents = async (): Promise<ApiResponse<Agent[]>> => {
  const response = await apiClient.get<ApiResponse<Agent[]>>('/agents');
  return response.data;
};

// Get single agent by ID
export const getAgent = async (id: string): Promise<ApiResponse<Agent>> => {
  const response = await apiClient.get<ApiResponse<Agent>>(`/agents/${id}`);
  return response.data;
};

// Create new agent
export const createAgent = async (data: CreateAgentData): Promise<ApiResponse<Agent>> => {
  const response = await apiClient.post<ApiResponse<Agent>>('/agents', data);
  return response.data;
};

// Update agent
export const updateAgent = async (id: string, data: Partial<Agent>): Promise<ApiResponse<Agent>> => {
  const response = await apiClient.patch<ApiResponse<Agent>>(`/agents/${id}`, data);
  return response.data;
};

// Delete agent
export const deleteAgent = async (id: string): Promise<ApiResponse<{ deleted: boolean; agentId: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ deleted: boolean; agentId: string }>>(`/agents/${id}`);
  return response.data;
};

// Get pending tasks for agent
export const getPendingTasks = async (agentId: string): Promise<ApiResponse<Agent[]>> => {
  const response = await apiClient.get<ApiResponse<Agent[]>>(`/agents/${agentId}/pending-tasks`);
  return response.data;
};
