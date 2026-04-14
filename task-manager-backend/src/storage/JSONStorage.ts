import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Task, Agent, Template, Notification, HistoryLog, SystemConfig, TaskStatus, Priority, AgentStatus, AgentType
} from '../types';

interface TasksData {
  version: string;
  updatedAt: string;
  tasks: Task[];
}

interface AgentsData {
  version: string;
  updatedAt: string;
  agents: Agent[];
}

interface TemplatesData {
  version: string;
  updatedAt: string;
  templates: Template[];
}

interface NotificationsData {
  version: string;
  updatedAt: string;
  notifications: Notification[];
}

interface HistoryData {
  version: string;
  updatedAt: string;
  logs: HistoryLog[];
}

interface ConfigData {
  version: string;
  updatedAt: string;
  config: SystemConfig;
}

export class JSONStorage {
  private dataPath: string;
  private backupPath: string;
  private config: SystemConfig;

  // In-memory index for fast lookups
  private taskIndex = new Map<string, Task>();
  private agentIndex = new Map<string, Agent>();
  private templateIndex = new Map<string, Template>();

  // File locks to prevent concurrent writes
  private locks = new Map<string, Promise<any>>();

  constructor(dataPath?: string, backupPath?: string) {
    this.dataPath = dataPath || './data';
    this.backupPath = backupPath || './backups';
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): SystemConfig {
    return {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      server: {
        port: 3001,
        host: '0.0.0.0',
        baseUrl: 'http://localhost:3001',
        allowedOrigins: ['http://localhost:3000', 'http://192.168.1.*']
      },
      features: {
        kanban: true,
        templates: true,
        notifications: true,
        analytics: false
      },
      limits: {
        maxTasksPerAgent: 10,
        maxTasksTotal: 1000,
        maxAgents: 100,
        heartbeatInterval: 30,
        sessionTimeout: 3600,
        maxHistoryLogs: 10000
      },
      storage: {
        dataPath: './data',
        backupPath: './backups',
        autoBackup: true,
        backupInterval: 86400
      },
      auth: {
        apiKey: 'default-api-key-change-me',
        apiKeyExpiry: 2592000,
        allowedIPs: []
      },
      websocket: {
        pingInterval: 30000,
        pongTimeout: 5000,
        maxConnections: 100
      }
    };
  }

  // ==================== Initialization ====================

  async initialize(): Promise<void> {
    // Create directories
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true });
    }
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }

    // Initialize data files if they don't exist
    await this.initializeFile('tasks', { version: '1.0', updatedAt: new Date().toISOString(), tasks: [] });
    await this.initializeFile('agents', { version: '1.0', updatedAt: new Date().toISOString(), agents: [] });
    await this.initializeFile('templates', { version: '1.0', updatedAt: new Date().toISOString(), templates: [] });
    await this.initializeFile('notifications', { version: '1.0', updatedAt: new Date().toISOString(), notifications: [] });
    await this.initializeFile('history', { version: '1.0', updatedAt: new Date().toISOString(), logs: [] });
    await this.initializeFile('config', { version: '1.0.0', updatedAt: new Date().toISOString(), config: this.config });

    // Load data into memory index
    await this.loadIndex();
  }

  private async initializeFile<T>(name: string, defaultData: T): Promise<void> {
    const filePath = path.join(this.dataPath, `${name}.json`);
    if (!fs.existsSync(filePath)) {
      await this.writeJSON(filePath, defaultData);
    }
  }

  private async loadIndex(): Promise<void> {
    // Load tasks
    const tasksData = await this.readJSON<TasksData>('tasks');
    this.taskIndex.clear();
    for (const task of tasksData.tasks) {
      this.taskIndex.set(task.id, task);
    }

    // Load agents
    const agentsData = await this.readJSON<AgentsData>('agents');
    this.agentIndex.clear();
    for (const agent of agentsData.agents) {
      this.agentIndex.set(agent.id, agent);
    }

    // Load templates
    const templatesData = await this.readJSON<TemplatesData>('templates');
    this.templateIndex.clear();
    for (const template of templatesData.templates) {
      this.templateIndex.set(template.id, template);
    }
  }

  // ==================== File Operations ====================

  private async withLock<T>(filename: string, operation: () => Promise<T>): Promise<T> {
    const lockKey = `lock:${filename}`;

    // Wait for previous operation to complete
    if (this.locks.has(lockKey)) {
      await this.locks.get(lockKey);
    }

    // Execute operation
    const operationPromise = operation();
    this.locks.set(lockKey, operationPromise);

    try {
      return await operationPromise;
    } finally {
      this.locks.delete(lockKey);
    }
  }

  private async readJSON<T>(filename: string): Promise<T> {
    const filePath = path.join(this.dataPath, `${filename}.json`);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  private async writeJSON<T>(filePath: string, data: T): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  // ==================== Config Operations ====================

  async getConfig(): Promise<SystemConfig> {
    const data = await this.readJSON<ConfigData>('config');
    return data.config;
  }

  async updateConfig(updates: Partial<SystemConfig>): Promise<SystemConfig> {
    return await this.withLock('config', async () => {
      const data = await this.readJSON<ConfigData>('config');
      data.config = { ...data.config, ...updates };
      data.updatedAt = new Date().toISOString();
      await this.writeJSON(path.join(this.dataPath, 'config.json'), data);
      this.config = data.config;
      return this.config;
    });
  }

  // ==================== Task Operations ====================

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'position' | 'createdBy'>, createdBy: string): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: `task-${Date.now()}-${uuidv4().slice(0, 8)}`,
      history: [{
        action: 'created',
        actor: createdBy,
        timestamp: now,
        details: { initialStatus: taskData.status }
      }],
      position: 0,
      createdAt: now,
      updatedAt: now,
      createdBy
    };

    return await this.withLock('tasks', async () => {
      const data = await this.readJSON<TasksData>('tasks');
      data.tasks.push(task);
      data.updatedAt = now;
      await this.writeJSON(path.join(this.dataPath, 'tasks.json'), data);
      this.taskIndex.set(task.id, task);
      return task;
    });
  }

  async getTask(id: string): Promise<Task | null> {
    const task = this.taskIndex.get(id);
    if (!task) return null;

    // Enrich with assignee name
    return await this.enrichTaskWithAssigneeName(task);
  }

  private async enrichTaskWithAssigneeName(task: Task): Promise<Task> {
    try {
      const companyFilePath = path.join(this.dataPath, 'company-structure.json');
      if (!fs.existsSync(companyFilePath)) {
        return task;
      }

      const companyData = JSON.parse(fs.readFileSync(companyFilePath, 'utf-8'));
      const employeeMap = new Map<string, string>();

      companyData.company.departments.forEach((dept: any) => {
        dept.employees.forEach((emp: any) => {
          employeeMap.set(emp.id, emp.name);
        });
      });

      if (task.assigneeId && employeeMap.has(task.assigneeId)) {
        return {
          ...task,
          assigneeName: employeeMap.get(task.assigneeId)
        };
      }
      return task;
    } catch (error) {
      console.error('Error enriching task with assignee name:', error);
      return task;
    }
  }

  async getTasks(options?: {
    status?: TaskStatus;
    priority?: Priority;
    assigneeId?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    const {
      status,
      priority,
      assigneeId,
      tag,
      page = 1,
      limit = 20
    } = options || {};

    let tasks = Array.from(this.taskIndex.values());

    // Apply filters
    if (status) tasks = tasks.filter(t => t.status === status);
    if (priority) tasks = tasks.filter(t => t.priority === priority);
    if (assigneeId) tasks = tasks.filter(t => t.assigneeId === assigneeId);
    if (tag) tasks = tasks.filter(t => t.tags.includes(tag));

    // Sort by position, then by createdAt
    tasks.sort((a, b) => a.position - b.position || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const total = tasks.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    // Enrich tasks with assignee name from company structure
    const enrichedTasks = await this.enrichTasksWithAssigneeNames(paginatedTasks);

    return { tasks: enrichedTasks, total };
  }

  private async enrichTasksWithAssigneeNames(tasks: Task[]): Promise<Task[]> {
    try {
      const companyFilePath = path.join(this.dataPath, 'company-structure.json');
      if (!fs.existsSync(companyFilePath)) {
        return tasks;
      }

      const companyData = JSON.parse(fs.readFileSync(companyFilePath, 'utf-8'));
      const employeeMap = new Map<string, string>();

      // Build employee ID -> name map
      companyData.company.departments.forEach((dept: any) => {
        dept.employees.forEach((emp: any) => {
          employeeMap.set(emp.id, emp.name);
        });
      });

      // Enrich tasks with assignee names
      return tasks.map(task => {
        if (task.assigneeId && employeeMap.has(task.assigneeId)) {
          return {
            ...task,
            assigneeName: employeeMap.get(task.assigneeId)
          };
        }
        return task;
      });
    } catch (error) {
      console.error('Error enriching tasks with assignee names:', error);
      return tasks;
    }
  }

  async updateTask(id: string, updates: Partial<Task>, actor: string): Promise<Task | null> {
    return await this.withLock('tasks', async () => {
      const task = this.taskIndex.get(id);
      if (!task) return null;

      const now = new Date().toISOString();
      const previousStatus = task.status;
      const previousAssignee = task.assigneeId;

      // Merge updates
      const updatedTask: Task = {
        ...task,
        ...updates,
        updatedAt: now
      };

      // Update metadata fields
      if (updates.status && updates.status !== previousStatus) {
        updatedTask.history = [...(task.history || []), {
          action: 'status_changed',
          actor,
          timestamp: now,
          details: { from: previousStatus, to: updates.status }
        }];
      }

      if (updates.assigneeId && updates.assigneeId !== previousAssignee) {
        updatedTask.history = [...(task.history || []), {
          action: 'assigned',
          actor,
          timestamp: now,
          details: { from: previousAssignee, to: updates.assigneeId }
        }];
      }

      // Update in-memory index
      this.taskIndex.set(id, updatedTask);

      // Persist to file
      const data = await this.readJSON<TasksData>('tasks');
      const index = data.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        data.tasks[index] = updatedTask;
        data.updatedAt = now;
        await this.writeJSON(path.join(this.dataPath, 'tasks.json'), data);
      }

      return updatedTask;
    });
  }

  async deleteTask(id: string): Promise<boolean> {
    return await this.withLock('tasks', async () => {
      const task = this.taskIndex.get(id);
      if (!task) return false;

      this.taskIndex.delete(id);

      const data = await this.readJSON<TasksData>('tasks');
      data.tasks = data.tasks.filter(t => t.id !== id);
      data.updatedAt = new Date().toISOString();
      await this.writeJSON(path.join(this.dataPath, 'tasks.json'), data);

      return true;
    });
  }

  // ==================== Agent Operations ====================

  async createAgent(agentData: Omit<Agent, 'id' | 'registeredAt' | 'updatedAt'>): Promise<Agent> {
    const now = new Date().toISOString();
    const agent: Agent = {
      ...agentData,
      id: `agent-${Date.now()}-${uuidv4().slice(0, 8)}`,
      registeredAt: now,
      updatedAt: now,
      currentTasks: [],
      statistics: {
        totalAssigned: 0,
        totalCompleted: 0,
        totalInProgress: 0,
        averageCompletionTime: 0,
        successRate: 0,
        overdueCount: 0
      }
    };

    return await this.withLock('agents', async () => {
      const data = await this.readJSON<AgentsData>('agents');
      data.agents.push(agent);
      data.updatedAt = now;
      await this.writeJSON(path.join(this.dataPath, 'agents.json'), data);
      this.agentIndex.set(agent.id, agent);
      return agent;
    });
  }

  async getAgent(id: string): Promise<Agent | null> {
    return this.agentIndex.get(id) || null;
  }

  async getAgents(options?: {
    status?: AgentStatus;
    type?: AgentType;
    capability?: string;
  }): Promise<Agent[]> {
    let agents = Array.from(this.agentIndex.values());

    if (options?.status) agents = agents.filter(a => a.status === options.status);
    if (options?.type) agents = agents.filter(a => a.type === options.type);
    if (options?.capability) agents = agents.filter(a => a.capabilities.includes(options.capability!));

    return agents;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    return await this.withLock('agents', async () => {
      const agent = this.agentIndex.get(id);
      if (!agent) return null;

      const now = new Date().toISOString();
      const updatedAgent: Agent = {
        ...agent,
        ...updates,
        updatedAt: now
      };

      this.agentIndex.set(id, updatedAgent);

      const data = await this.readJSON<AgentsData>('agents');
      const index = data.agents.findIndex(a => a.id === id);
      if (index !== -1) {
        data.agents[index] = updatedAgent;
        data.updatedAt = now;
        await this.writeJSON(path.join(this.dataPath, 'agents.json'), data);
      }

      return updatedAgent;
    });
  }

  async deleteAgent(id: string): Promise<boolean> {
    return await this.withLock('agents', async () => {
      const agent = this.agentIndex.get(id);
      if (!agent) return false;

      this.agentIndex.delete(id);

      const data = await this.readJSON<AgentsData>('agents');
      data.agents = data.agents.filter(a => a.id !== id);
      data.updatedAt = new Date().toISOString();
      await this.writeJSON(path.join(this.dataPath, 'agents.json'), data);

      return true;
    });
  }

  // ==================== Template Operations ====================

  async createTemplate(templateData: Omit<Template, 'id' | 'usageCount' | 'createdAt' | 'updatedAt' | 'createdBy'>, createdBy: string): Promise<Template> {
    const now = new Date().toISOString();
    const template: Template = {
      ...templateData,
      id: `template-${Date.now()}-${uuidv4().slice(0, 8)}`,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
      createdBy
    };

    return await this.withLock('templates', async () => {
      const data = await this.readJSON<TemplatesData>('templates');
      data.templates.push(template);
      data.updatedAt = now;
      await this.writeJSON(path.join(this.dataPath, 'templates.json'), data);
      this.templateIndex.set(template.id, template);
      return template;
    });
  }

  async getTemplate(id: string): Promise<Template | null> {
    return this.templateIndex.get(id) || null;
  }

  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templateIndex.values());
  }

  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null> {
    return await this.withLock('templates', async () => {
      const template = this.templateIndex.get(id);
      if (!template) return null;

      const now = new Date().toISOString();
      const updatedTemplate: Template = {
        ...template,
        ...updates,
        updatedAt: now
      };

      this.templateIndex.set(id, updatedTemplate);

      const data = await this.readJSON<TemplatesData>('templates');
      const index = data.templates.findIndex(t => t.id === id);
      if (index !== -1) {
        data.templates[index] = updatedTemplate;
        data.updatedAt = now;
        await this.writeJSON(path.join(this.dataPath, 'templates.json'), data);
      }

      return updatedTemplate;
    });
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return await this.withLock('templates', async () => {
      const template = this.templateIndex.get(id);
      if (!template) return false;

      this.templateIndex.delete(id);

      const data = await this.readJSON<TemplatesData>('templates');
      data.templates = data.templates.filter(t => t.id !== id);
      data.updatedAt = new Date().toISOString();
      await this.writeJSON(path.join(this.dataPath, 'templates.json'), data);

      return true;
    });
  }

  // ==================== Notification Operations ====================

  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const now = new Date().toISOString();
    const notification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${uuidv4().slice(0, 8)}`,
      createdAt: now
    };

    return await this.withLock('notifications', async () => {
      const data = await this.readJSON<NotificationsData>('notifications');
      data.notifications.push(notification);
      data.updatedAt = now;
      await this.writeJSON(path.join(this.dataPath, 'notifications.json'), data);
      return notification;
    });
  }

  async getNotifications(agentId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const data = await this.readJSON<NotificationsData>('notifications');
    let notifications = data.notifications.filter(n => n.targetAgentId === agentId);

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationRead(id: string): Promise<boolean> {
    return await this.withLock('notifications', async () => {
      const data = await this.readJSON<NotificationsData>('notifications');
      const index = data.notifications.findIndex(n => n.id === id);

      if (index === -1) return false;

      data.notifications[index].read = true;
      data.notifications[index].readAt = new Date().toISOString();
      data.updatedAt = new Date().toISOString();

      await this.writeJSON(path.join(this.dataPath, 'notifications.json'), data);
      return true;
    });
  }

  // ==================== History Operations ====================

  async addHistoryLog(logData: Omit<HistoryLog, 'id'>): Promise<HistoryLog> {
    const log: HistoryLog = {
      ...logData,
      id: `log-${Date.now()}-${uuidv4().slice(0, 8)}`
    };

    return await this.withLock('history', async () => {
      const data = await this.readJSON<HistoryData>('history');
      data.logs.push(log);
      data.updatedAt = new Date().toISOString();

      // Limit history size
      const config = await this.getConfig();
      const maxLogs = config.limits.maxHistoryLogs;
      if (data.logs.length > maxLogs) {
        data.logs = data.logs.slice(-maxLogs);
      }

      await this.writeJSON(path.join(this.dataPath, 'history.json'), data);
      return log;
    });
  }

  // ==================== Backup Operations ====================

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().slice(0, 10);
    const backupFileName = `backup-${timestamp}.tar.gz`;
    const backupFilePath = path.join(this.backupPath, backupFileName);

    // Simple backup: copy all JSON files
    const files = ['tasks', 'agents', 'templates', 'notifications', 'history', 'config'];

    for (const file of files) {
      const sourcePath = path.join(this.dataPath, `${file}.json`);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(this.backupPath, `${file}.${timestamp}.json`);
        fs.copyFileSync(sourcePath, destPath);
      }
    }

    return backupFilePath;
  }

  async restoreBackup(date: string): Promise<void> {
    const files = ['tasks', 'agents', 'templates', 'notifications', 'history', 'config'];

    for (const file of files) {
      const sourcePath = path.join(this.backupPath, `${file}.${date}.json`);
      const destPath = path.join(this.dataPath, `${file}.json`);

      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
      }
    }

    // Reload index
    await this.loadIndex();
  }
}
