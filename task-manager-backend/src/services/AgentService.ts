import { JSONStorage } from '../storage/JSONStorage';
import { Agent, AgentStatus, AgentType, TaskStatus, CurrentTask } from '../types';

export class AgentService {
  private storage: JSONStorage;

  constructor(storage: JSONStorage) {
    this.storage = storage;
  }

  async createAgent(agentData: {
    name: string;
    type: AgentType;
    description?: string;
    capabilities?: string[];
    config?: {
      heartbeatInterval?: number;
      maxConcurrentTasks?: number;
      autoAcceptTasks?: boolean;
      notificationChannels?: string[];
    };
  }): Promise<Agent> {
    const defaultConfig = {
      heartbeatInterval: 30,
      maxConcurrentTasks: 3,
      autoAcceptTasks: true,
      notificationChannels: ['ws']
    };

    return await this.storage.createAgent({
      name: agentData.name,
      type: agentData.type,
      description: agentData.description,
      capabilities: agentData.capabilities || [],
      config: {
        ...defaultConfig,
        ...agentData.config
      },
      status: 'online',
      currentTasks: []
    });
  }

  async getAgent(id: string): Promise<Agent | null> {
    return await this.storage.getAgent(id);
  }

  async getAgents(options?: {
    status?: AgentStatus;
    type?: AgentType;
    capability?: string;
  }): Promise<Agent[]> {
    return await this.storage.getAgents(options);
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    return await this.storage.updateAgent(id, updates);
  }

  async updateAgentStatus(id: string, status: AgentStatus, currentTasks?: string[]): Promise<Agent | null> {
    // Convert string array to CurrentTask array if needed
    const currentTaskObjects: CurrentTask[] = currentTasks?.map(tid => ({
      taskId: tid,
      status: 'in_progress' as TaskStatus,
      startTime: new Date().toISOString()
    })) || [];
    
    return await this.storage.updateAgent(id, {
      status,
      lastHeartbeat: new Date().toISOString(),
      currentTasks: currentTaskObjects
    });
  }

  async deleteAgent(id: string): Promise<boolean> {
    // First unassign all tasks from this agent
    const tasks = await this.getTasksByAgent(id);
    for (const task of tasks) {
      await this.storage.updateTask(task.id, {
        assigneeId: undefined,
        status: 'todo'
      }, 'system');
    }

    return await this.storage.deleteAgent(id);
  }

  async getTasksByAgent(agentId: string): Promise<any[]> {
    const { tasks } = await this.storage.getTasks({ assigneeId: agentId });
    return tasks;
  }

  async getAvailableAgents(): Promise<Agent[]> {
    const agents = await this.storage.getAgents({ status: 'online' });
    return agents.filter(a => {
      const taskCount = a.currentTasks ? a.currentTasks.length : 0;
      return taskCount < a.config.maxConcurrentTasks;
    });
  }

  async hasCapacity(agentId: string): Promise<boolean> {
    const agent = await this.storage.getAgent(agentId);
    if (!agent) return false;

    const taskCount = agent.currentTasks ? agent.currentTasks.length : 0;
    return taskCount < agent.config.maxConcurrentTasks;
  }

  async recordTaskCompletion(agentId: string, completionTime: number): Promise<void> {
    const agent = await this.storage.getAgent(agentId);
    if (!agent) return;

    const stats = agent.statistics || {
      totalAssigned: 0,
      totalCompleted: 0,
      totalInProgress: 0,
      averageCompletionTime: 0,
      successRate: 0,
      overdueCount: 0
    };

    const newTotalCompleted = stats.totalCompleted + 1;
    const newAvgTime = ((stats.averageCompletionTime * stats.totalCompleted) + completionTime) / newTotalCompleted;

    await this.storage.updateAgent(agentId, {
      statistics: {
        ...stats,
        totalCompleted: newTotalCompleted,
        averageCompletionTime: Math.round(newAvgTime),
        successRate: stats.totalAssigned > 0 ? Math.round((newTotalCompleted / stats.totalAssigned) * 100) / 100 : 0
      }
    });
  }
}
