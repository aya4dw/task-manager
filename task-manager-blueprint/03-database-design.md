# 任务管理系统 - 数据库设计

> 版本：v1.0 | 创建日期：2026-04-12

---

## 一、存储方案概述

### 1.1 技术方案

本系统采用 **JSON 文件存储** 方案，适用于：
- 本地部署环境
- 快速原型开发
- 轻量级数据存储
- 便于调试和版本控制

### 1.2 文件目录结构

```
data/
├── tasks.json           # 任务数据
├── agents.json          # 员工 (Agent) 数据
├── templates.json       # 任务模板
├── notifications.json   # 通知消息
├── history.json         # 操作历史日志
└── config.json          # 系统配置
```

### 1.3 文件锁定机制

为防止并发写入冲突，实现文件锁机制：

```typescript
// 伪代码示例
class FileLock {
  private locks: Map<string, Promise<any>> = new Map();

  async withLock<T>(filename: string, operation: () => Promise<T>): Promise<T> {
    const lockKey = `lock:${filename}`;
    
    // 等待前一个操作完成
    if (this.locks.has(lockKey)) {
      await this.locks.get(lockKey);
    }
    
    // 执行操作
    const operationPromise = operation();
    this.locks.set(lockKey, operationPromise);
    
    try {
      return await operationPromise;
    } finally {
      this.locks.delete(lockKey);
    }
  }
}
```

---

## 二、数据表设计（JSON Schema）

### 2.1 tasks.json - 任务表

**文件结构：**
```json
{
  "version": "1.0",
  "updatedAt": "2026-04-12T20:00:00Z",
  "tasks": [
    {
      "id": "task-001",
      "title": "开发用户登录功能",
      "description": "实现用户登录、注册、密码重置功能",
      "priority": "high",
      "tags": ["backend", "auth"],
      "status": "in_progress",
      "assigneeId": "agent-001",
      "templateId": "login-feature",
      "dueDate": "2026-04-20T00:00:00Z",
      "metadata": {
        "storyPoints": 5,
        "epicId": "user-management",
        "branch": "feature/login"
      },
      "history": [
        {
          "action": "created",
          "actor": "user-001",
          "timestamp": "2026-04-12T14:00:00Z",
          "details": { "initialStatus": "todo" }
        },
        {
          "action": "assigned",
          "actor": "user-001",
          "target": "agent-001",
          "timestamp": "2026-04-12T15:00:00Z"
        },
        {
          "action": "status_changed",
          "actor": "agent-001",
          "from": "todo",
          "to": "in_progress",
          "timestamp": "2026-04-12T15:30:00Z"
        }
      ],
      "position": 2,
      "createdAt": "2026-04-12T14:00:00Z",
      "updatedAt": "2026-04-12T15:30:00Z",
      "createdBy": "user-001"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 任务唯一标识，格式：task-{timestamp}-{random} |
| `title` | string | 是 | 任务标题，最大 200 字符 |
| `description` | string | 否 | 任务详细描述，支持 Markdown |
| `priority` | enum | 是 | 优先级：low, medium, high, urgent |
| `tags` | string[] | 否 | 标签列表 |
| `status` | enum | 是 | 任务状态：todo, in_progress, review, completed, archived |
| `assigneeId` | string | 否 | 分配给的 Agent ID |
| `templateId` | string | 否 | 使用的模板 ID |
| `dueDate` | string | 否 | 截止日期，ISO 8601 格式 |
| `metadata` | object | 否 | 扩展元数据，JSON 格式 |
| `history` | array | 是 | 操作历史，初始为空数组 |
| `position` | number | 是 | 在看板中的位置，用于排序 |
| `createdAt` | string | 是 | 创建时间，ISO 8601 格式 |
| `updatedAt` | string | 是 | 更新时间，ISO 8601 格式 |
| `createdBy` | string | 是 | 创建者 ID |

### 2.2 agents.json - 员工表

**文件结构：**
```json
{
  "version": "1.0",
  "updatedAt": "2026-04-12T20:00:00Z",
  "agents": [
    {
      "id": "agent-001",
      "name": "开发 Agent-A",
      "type": "developer",
      "description": "负责后端开发工作",
      "capabilities": ["backend", "api", "database"],
      "config": {
        "heartbeatInterval": 30,
        "maxConcurrentTasks": 3,
        "autoAcceptTasks": true,
        "notificationChannels": ["ws", "email"]
      },
      "status": "online",
      "currentTasks": [
        {
          "taskId": "task-001",
          "status": "in_progress",
          "startTime": "2026-04-12T15:00:00Z",
          "estimatedCompletion": "2026-04-12T18:00:00Z"
        }
      ],
      "statistics": {
        "totalAssigned": 50,
        "totalCompleted": 45,
        "totalInProgress": 3,
        "averageCompletionTime": 3600,
        "successRate": 0.9,
        "overdueCount": 2
      },
      "lastHeartbeat": "2026-04-12T20:00:00Z",
      "registeredAt": "2026-04-12T14:00:00Z",
      "updatedAt": "2026-04-12T20:00:00Z"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | Agent 唯一标识，格式：agent-{timestamp}-{random} |
| `name` | string | 是 | Agent 名称 |
| `type` | string | 是 | Agent 类型：developer, designer, tester, etc. |
| `description` | string | 否 | Agent 描述 |
| `capabilities` | string[] | 否 | 技能标签 |
| `config` | object | 否 | 配置项 |
| `status` | enum | 是 | 状态：online, busy, offline |
| `currentTasks` | array | 是 | 当前任务列表 |
| `statistics` | object | 否 | 统计数据 |
| `lastHeartbeat` | string | 否 | 最后心跳时间 |
| `registeredAt` | string | 是 | 注册时间 |
| `updatedAt` | string | 是 | 更新时间 |

### 2.3 templates.json - 模板表

**文件结构：**
```json
{
  "version": "1.0",
  "updatedAt": "2026-04-12T20:00:00Z",
  "templates": [
    {
      "id": "login-feature",
      "name": "登录功能模板",
      "description": "用户登录、注册、密码重置的标准开发流程",
      "stages": [
        {
          "id": "stage-1",
          "name": "需求分析",
          "order": 1,
          "status": "todo",
          "estimatedTime": 60
        },
        {
          "id": "stage-2",
          "name": "接口设计",
          "order": 2,
          "status": "todo",
          "estimatedTime": 120
        },
        {
          "id": "stage-3",
          "name": "开发实现",
          "order": 3,
          "status": "todo",
          "estimatedTime": 480
        },
        {
          "id": "stage-4",
          "name": "测试验收",
          "order": 4,
          "status": "todo",
          "estimatedTime": 180
        }
      ],
      "tags": ["auth", "feature", "backend"],
      "defaultPriority": "medium",
      "metadata": {
        "complexity": "high",
        "requiresCodeReview": true
      },
      "usageCount": 15,
      "createdAt": "2026-04-01T00:00:00Z",
      "updatedAt": "2026-04-10T00:00:00Z",
      "createdBy": "admin"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 模板唯一标识 |
| `name` | string | 是 | 模板名称 |
| `description` | string | 否 | 模板描述 |
| `stages` | array | 是 | 阶段定义 |
| `tags` | string[] | 否 | 标签列表 |
| `defaultPriority` | string | 否 | 默认优先级 |
| `metadata` | object | 否 | 扩展元数据 |
| `usageCount` | number | 是 | 使用次数，初始为 0 |
| `createdAt` | string | 是 | 创建时间 |
| `updatedAt` | string | 是 | 更新时间 |
| `createdBy` | string | 是 | 创建者 ID |

### 2.4 notifications.json - 通知表

**文件结构：**
```json
{
  "version": "1.0",
  "updatedAt": "2026-04-12T20:00:00Z",
  "notifications": [
    {
      "id": "notif-001",
      "type": "task_assignment",
      "title": "新任务分配",
      "message": "任务「修复登录 bug」已分配给您",
      "targetAgentId": "agent-001",
      "relatedTaskId": "task-001",
      "priority": "normal",
      "read": false,
      "actions": [
        {
          "type": "view_task",
          "label": "查看任务",
          "url": "/tasks/task-001"
        },
        {
          "type": "accept_task",
          "label": "接受任务",
          "api": "/api/v1/tasks/task-001/receive"
        }
      ],
      "createdAt": "2026-04-12T19:00:00Z",
      "readAt": null
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 通知唯一标识 |
| `type` | enum | 是 | 通知类型：task_assignment, task_completed, status_changed, etc. |
| `title` | string | 是 | 通知标题 |
| `message` | string | 是 | 通知内容 |
| `targetAgentId` | string | 是 | 目标 Agent ID |
| `relatedTaskId` | string | 否 | 相关任务 ID |
| `priority` | enum | 是 | 优先级：low, normal, high, urgent |
| `read` | boolean | 是 | 是否已读，初始为 false |
| `actions` | array | 否 | 可执行的操作 |
| `createdAt` | string | 是 | 创建时间 |
| `readAt` | string | 否 | 阅读时间 |

### 2.5 history.json - 历史日志表

**文件结构：**
```json
{
  "version": "1.0",
  "updatedAt": "2026-04-12T20:00:00Z",
  "logs": [
    {
      "id": "log-001",
      "timestamp": "2026-04-12T15:00:00Z",
      "action": "task_assigned",
      "actor": "user-001",
      "actorType": "user",
      "targetType": "task",
      "targetId": "task-001",
      "details": {
        "previousAssignee": null,
        "newAssignee": "agent-001"
      },
      "sessionId": "session-abc123",
      "ipAddress": "192.168.1.100"
    }
  ]
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 日志唯一标识 |
| `timestamp` | string | 是 | 操作时间 |
| `action` | string | 是 | 操作类型 |
| `actor` | string | 是 | 操作者 ID |
| `actorType` | enum | 是 | 操作者类型：user, agent, system |
| `targetType` | enum | 是 | 目标类型：task, agent, template |
| `targetId` | string | 是 | 目标 ID |
| `details` | object | 否 | 详细数据 |
| `sessionId` | string | 否 | 会话 ID |
| `ipAddress` | string | 否 | IP 地址 |

### 2.6 config.json - 系统配置表

**文件结构：**
```json
{
  "version": "1.0.0",
  "updatedAt": "2026-04-12T20:00:00Z",
  "config": {
    "server": {
      "port": 3001,
      "host": "0.0.0.0",
      "baseUrl": "http://localhost:3001",
      "allowedOrigins": ["http://localhost:3000", "http://192.168.1.*"]
    },
    "features": {
      "kanban": true,
      "templates": true,
      "notifications": true,
      "analytics": false
    },
    "limits": {
      "maxTasksPerAgent": 10,
      "maxTasksTotal": 1000,
      "maxAgents": 100,
      "heartbeatInterval": 30,
      "sessionTimeout": 3600,
      "maxHistoryLogs": 10000
    },
    "storage": {
      "dataPath": "./data",
      "backupPath": "./backups",
      "autoBackup": true,
      "backupInterval": 86400
    },
    "auth": {
      "apiKey": "your-secret-api-key",
      "apiKeyExpiry": 2592000,
      "allowedIPs": []
    },
    "websocket": {
      "pingInterval": 30000,
      "pongTimeout": 5000,
      "maxConnections": 100
    }
  }
}
```

---

## 三、索引设计

### 3.1 内存索引

为加速查询，在内存中维护索引：

```typescript
interface TaskIndex {
  byId: Map<string, Task>;
  byStatus: Map<TaskStatus, Set<string>>;
  byAssignee: Map<string, Set<string>>;
  byTag: Map<string, Set<string>>;
  byPriority: Map<Priority, Set<string>>;
  byCreatedDate: Map<string, Set<string>>; // 按日期分组
}

interface AgentIndex {
  byId: Map<string, Agent>;
  byStatus: Map<AgentStatus, Set<string>>;
  byType: Map<string, Set<string>>;
  byCapability: Map<string, Set<string>>;
}
```

### 3.2 索引更新策略

- **启动时加载**：从 JSON 文件构建完整索引
- **增量更新**：每次数据变更后更新相关索引
- **持久化**：索引仅存在于内存，重启后重建

---

## 四、数据访问接口

### 4.1 StorageService 接口

```typescript
interface StorageService {
  // 任务操作
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  getTask(id: string): Promise<Task | null>;
  getTasks(options?: GetTasksOptions): Promise<Task[]>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
  
  // 员工操作
  createAgent(agent: Omit<Agent, 'id' | 'registeredAt' | 'updatedAt'>): Promise<Agent>;
  getAgent(id: string): Promise<Agent | null>;
  getAgents(options?: GetAgentsOptions): Promise<Agent[]>;
  updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null>;
  deleteAgent(id: string): Promise<boolean>;
  
  // 模板操作
  createTemplate(template: Omit<Template, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<Template>;
  getTemplate(id: string): Promise<Template | null>;
  getTemplates(): Promise<Template[]>;
  updateTemplate(id: string, updates: Partial<Template>): Promise<Template | null>;
  deleteTemplate(id: string): Promise<boolean>;
  
  // 通知操作
  createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  getNotifications(agentId: string, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<boolean>;
  
  // 批量操作
  bulkCreateTasks(tasks: Array<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task[]>;
  bulkUpdateTasks(updates: Array<{id: string, data: Partial<Task>}>): Promise<Task[]>;
  
  // 数据导出/导入
  exportData(): Promise<Buffer>;
  importData(data: Buffer): Promise<void>;
}
```

### 4.2 查询选项

```typescript
interface GetTasksOptions {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

interface GetAgentsOptions {
  status?: AgentStatus;
  type?: string;
  capability?: string;
  hasCapacity?: boolean; // 是否有空闲容量
  sortBy?: 'name' | 'status' | 'lastHeartbeat';
  sortOrder?: 'asc' | 'desc';
}
```

---

## 五、备份与恢复

### 5.1 自动备份策略

```typescript
interface BackupConfig {
  enabled: true;
  interval: 86400;        // 每天备份
  retentionDays: 7;       // 保留 7 天
  destination: "./backups";
  format: "tar.gz";
  compression: true;
}
```

### 5.2 备份文件格式

```
backups/
├── backup-2026-04-12.tar.gz
├── backup-2026-04-11.tar.gz
└── ...
```

### 5.3 恢复流程

1. 停止服务
2. 清空当前 data/ 目录
3. 解压备份文件到 data/
4. 启动服务，重建索引

---

## 六、性能优化

### 6.1 读写缓存

```typescript
class CachedStorage {
  private taskCache: Map<string, Task> = new Map();
  private cacheTTL: number = 60000; // 1 分钟
  
  async getTask(id: string): Promise<Task | null> {
    const cached = this.getFromCache(id);
    if (cached && !this.isExpired(cached)) {
      return cached;
    }
    
    const task = await this.loadFromFile(id);
    this.setInCache(id, task);
    return task;
  }
}
```

### 6.2 懒加载

- 任务详情仅在请求时加载完整数据
- 列表视图仅加载必要字段
- 历史记录按需分页加载

### 6.3 文件分片

当数据量增长时，考虑按时间分片：

```
data/
├── tasks/
│   ├── 2026-04/
│   │   ├── 12.json
│   │   └── 13.json
│   └── 2026-03/
│       └── ...
└── index.json  # 全局索引
```

---

## 七、迁移至数据库

### 7.1 未来迁移方案

当业务增长时，可平滑迁移至 SQLite 或 PostgreSQL：

```sql
-- 示例：SQLite 迁移
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'archived')),
  assignee_id TEXT REFERENCES agents(id),
  template_id TEXT REFERENCES templates(id),
  due_date DATETIME,
  metadata JSON,
  history JSON,
  position INTEGER DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  created_by TEXT NOT NULL
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

---

*文档版本：v1.0*
*最后更新：2026-04-12*
