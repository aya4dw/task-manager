import { JSONStorage } from '../storage/JSONStorage';
import { Task, TaskStatus, Priority, TaskFeedback, TaskFeedbackType } from '../types';

export class TaskService {
  private storage: JSONStorage;

  constructor(storage: JSONStorage) {
    this.storage = storage;
  }

  async createTask(taskData: {
    title: string;
    description?: string;
    priority: Priority;
    tags?: string[];
    status?: TaskStatus;
    templateId?: string;
    dueDate?: string;
    metadata?: Record<string, any>;
    assigneeId?: string;
    createdBy: string;
  }): Promise<Task> {
    const { createdBy, ...restData } = taskData;
    return await this.storage.createTask({
      ...restData,
      priority: restData.priority || 'medium',
      tags: restData.tags || [],
      status: restData.status || 'todo',
      assigneeId: restData.assigneeId || undefined  // 正确保存 assigneeId
    }, createdBy);
  }

  async getTask(id: string): Promise<Task | null> {
    return await this.storage.getTask(id);
  }

  async getTasks(options?: {
    status?: TaskStatus;
    priority?: Priority;
    assigneeId?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    return await this.storage.getTasks(options);
  }

  async updateTask(id: string, updates: Partial<Task>, actor: string): Promise<Task | null> {
    return await this.storage.updateTask(id, updates, actor);
  }

  async deleteTask(id: string): Promise<boolean> {
    return await this.storage.deleteTask(id);
  }

  async assignTask(taskId: string, agentId: string, actor: string): Promise<Task | null> {
    const task = await this.storage.getTask(taskId);
    if (!task) return null;

    // Update assignee and status
    return await this.storage.updateTask(taskId, {
      assigneeId: agentId,
      status: 'in_progress'
    }, actor);
  }

  async unassignTask(taskId: string, actor: string): Promise<Task | null> {
    const task = await this.storage.getTask(taskId);
    if (!task || !task.assigneeId) return null;

    return await this.storage.updateTask(taskId, {
      assigneeId: undefined,
      status: 'todo'
    }, actor);
  }

  async moveTask(taskId: string, toColumn: TaskStatus, position: number, actor: string): Promise<Task | null> {
    return await this.storage.updateTask(taskId, {
      status: toColumn,
      position
    }, actor);
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    const result = await this.storage.getTasks({ status });
    return result.tasks;
  }

  async getTasksByAssignee(agentId: string): Promise<Task[]> {
    const result = await this.storage.getTasks({ assigneeId: agentId });
    return result.tasks;
  }

  async getPendingTasks(agentId: string): Promise<Task[]> {
    // Get tasks that are assigned to agent and in_progress, or todo tasks that match agent capabilities
    const { tasks } = await this.storage.getTasks({ assigneeId: agentId });
    return tasks.filter(t => t.status === 'in_progress' || t.status === 'todo');
  }

  async receiveTask(taskId: string, agentId: string): Promise<Task | null> {
    const task = await this.storage.getTask(taskId);
    if (!task) return null;

    const assigneeId = task.assigneeId || undefined;
    // If task is not assigned or in todo status, assign it
    if (!assigneeId || task.status === 'todo') {
      return await this.storage.updateTask(taskId, {
        assigneeId,
        status: 'in_progress'
      }, agentId);
    }

    return task;
  }

  async completeTask(taskId: string, actor: string): Promise<Task | null> {
    return await this.storage.updateTask(taskId, {
      status: 'completed'
    }, actor);
  }

  // Stop agent working on task
  async stopAgent(taskId: string, actor: string): Promise<Task | null> {
    const task = await this.storage.getTask(taskId);
    if (!task) return null;

    // Add feedback about stopping
    const feedback: TaskFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'info',
      author: actor,
      content: '任务已被打断',
      createdAt: new Date().toISOString()
    };

    const currentFeedbacks = task.feedbacks || [];
    
    return await this.storage.updateTask(taskId, {
      feedbacks: [...currentFeedbacks, feedback]
    }, actor);
  }

  // Add feedback to task (forum-style)
  async addFeedback(
    taskId: string,
    content: string,
    type: TaskFeedbackType,
    author: string,
    assigneeId?: string
  ): Promise<Task | null> {
    const task = await this.storage.getTask(taskId);
    if (!task) return null;

    // Get employee name from company structure
    let employeeName = assigneeId || '';
    if (assigneeId) {
      try {
        const companyPath = require('path').join(process.cwd(), 'data', 'company-structure.json');
        if (require('fs').existsSync(companyPath)) {
          const companyData = JSON.parse(require('fs').readFileSync(companyPath, 'utf-8'));
          for (const dept of companyData.company.departments) {
            for (const emp of dept.employees) {
              if (emp.id === assigneeId) {
                employeeName = emp.name;
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error reading company structure:', error);
      }
    }

    // Add assignee info to feedback content if provided
    const feedbackContent = assigneeId 
      ? `指派:${employeeName}\n\n${content}`
      : content;

    const feedback: TaskFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      author,
      content: feedbackContent,
      createdAt: new Date().toISOString()
    };

    const currentFeedbacks = task.feedbacks || [];
    
    // Prepare updates
    const updates: any = {
      feedbacks: [...currentFeedbacks, feedback]
    };

    // Update assignee if provided
    if (assigneeId) {
      updates.assigneeId = assigneeId;
    }
    
    return await this.storage.updateTask(taskId, updates, author);
  }

  // Accept and complete task
  async acceptTask(taskId: string, actor: string): Promise<Task | null> {
    const task = await this.storage.getTask(taskId);
    if (!task) return null;

    // Add acceptance feedback
    const feedback: TaskFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'accepted',
      author: actor,
      content: `任务已被${actor}验收通过`,
      createdAt: new Date().toISOString()
    };

    const currentFeedbacks = task.feedbacks || [];
    
    return await this.storage.updateTask(taskId, {
      status: 'completed',
      feedbacks: [...currentFeedbacks, feedback]
    }, actor);
  }
}
