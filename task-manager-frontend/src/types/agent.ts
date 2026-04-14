// Agent Status
export type AgentStatus = 'online' | 'busy' | 'offline';

// Agent Type
export type AgentType = 'developer' | 'designer' | 'tester' | 'manager' | 'other';

// Agent Config
export interface AgentConfig {
  heartbeatInterval: number;
  maxConcurrentTasks: number;
  preferences?: Record<string, any>;
}

// Current Task Reference
export interface CurrentTask {
  taskId: string;
  status: string;
  startTime: string;
}

// Agent Statistics
export interface AgentStatistics {
  totalCompleted: number;
  averageCompletionTime: number;
  successRate: number;
}

// Agent Interface
export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  capabilities: string[];
  config: AgentConfig;
  status: AgentStatus;
  currentTasks: CurrentTask[];
  statistics?: AgentStatistics;
  lastHeartbeat?: string;
  registeredAt: string;
}

// Create Agent Data
export interface CreateAgentData {
  name: string;
  type: AgentType;
  capabilities: string[];
  config?: AgentConfig;
}
