# 任务管理系统 - API 接口规范

> 版本：v1.0 | 创建日期：2026-04-12

---

## 一、接口概述

### 1.1 基础信息

| 项目 | 配置 |
|------|------|
| 基础路径 | `/api/v1` |
| 协议 | RESTful / WebSocket |
| 数据格式 | JSON |
| 字符编码 | UTF-8 |
| 认证方式 | API Key (Header: `X-API-Key`) |

### 1.2 统一响应格式

**成功响应：**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1704067200000
}
```

**错误响应：**
```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "任务不存在",
    "details": { ... }
  },
  "timestamp": 1704067200000
}
```

### 1.3 错误码规范

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| `SUCCESS` | 200 | 操作成功 |
| `BAD_REQUEST` | 400 | 请求参数错误 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 禁止访问 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 资源冲突 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

## 二、任务 (Tasks) API

### 2.1 创建任务

**请求：**
```http
POST /api/v1/tasks
Content-Type: application/json
X-API-Key: your-api-key

{
  "title": "开发用户登录功能",
  "description": "实现用户登录、注册、密码重置功能",
  "priority": "high",
  "tags": ["backend", "auth"],
  "assigneeId": null,
  "status": "todo",
  "templateId": "login-feature",
  "dueDate": "2026-04-20T00:00:00Z",
  "metadata": {
    "storyPoints": 5,
    "epicId": "user-management"
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "task-001",
    "title": "开发用户登录功能",
    "description": "实现用户登录、注册、密码重置功能",
    "priority": "high",
    "tags": ["backend", "auth"],
    "assigneeId": null,
    "status": "todo",
    "templateId": "login-feature",
    "dueDate": "2026-04-20T00:00:00Z",
    "metadata": {
      "storyPoints": 5,
      "epicId": "user-management"
    },
    "createdAt": "2026-04-12T14:00:00Z",
    "updatedAt": "2026-04-12T14:00:00Z",
    "createdBy": "user-001"
  },
  "timestamp": 1704067200000
}
```

### 2.2 获取任务列表

**请求：**
```http
GET /api/v1/tasks?status=todo&priority=high&tag=backend&page=1&limit=20
```

**查询参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `status` | string | 否 | 任务状态过滤 |
| `priority` | string | 否 | 优先级过滤 |
| `tag` | string | 否 | 标签过滤 |
| `assigneeId` | string | 否 | 负责人过滤 |
| `page` | number | 否 | 页码，默认 1 |
| `limit` | number | 否 | 每页数量，默认 20 |

**响应：**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-001",
        "title": "开发用户登录功能",
        "status": "todo",
        "priority": "high",
        "assigneeId": null,
        "createdAt": "2026-04-12T14:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  },
  "timestamp": 1704067200000
}
```

### 2.3 获取单个任务

**请求：**
```http
GET /api/v1/tasks/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "task-001",
    "title": "开发用户登录功能",
    "description": "实现用户登录、注册、密码重置功能",
    "priority": "high",
    "tags": ["backend", "auth"],
    "assigneeId": "agent-001",
    "status": "in_progress",
    "templateId": "login-feature",
    "dueDate": "2026-04-20T00:00:00Z",
    "metadata": {
      "storyPoints": 5,
      "epicId": "user-management"
    },
    "history": [
      {
        "action": "created",
        "actor": "user-001",
        "timestamp": "2026-04-12T14:00:00Z"
      },
      {
        "action": "assigned",
        "actor": "user-001",
        "target": "agent-001",
        "timestamp": "2026-04-12T15:00:00Z"
      }
    ],
    "createdAt": "2026-04-12T14:00:00Z",
    "updatedAt": "2026-04-12T15:00:00Z",
    "createdBy": "user-001"
  },
  "timestamp": 1704067200000
}
```

### 2.4 更新任务

**请求：**
```http
PATCH /api/v1/tasks/:id
Content-Type: application/json

{
  "title": "开发用户登录功能 (更新)",
  "status": "in_progress",
  "metadata": {
    "storyPoints": 8
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "task-001",
    "title": "开发用户登录功能 (更新)",
    "status": "in_progress",
    "metadata": {
      "storyPoints": 8
    },
    "updatedAt": "2026-04-12T16:00:00Z"
  },
  "timestamp": 1704067200000
}
```

### 2.5 删除任务

**请求：**
```http
DELETE /api/v1/tasks/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "taskId": "task-001"
  },
  "timestamp": 1704067200000
}
```

### 2.6 分配任务

**请求：**
```http
POST /api/v1/tasks/:id/assign
Content-Type: application/json

{
  "assigneeId": "agent-001"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "taskId": "task-001",
    "assigneeId": "agent-001",
    "previousAssigneeId": null,
    "status": "in_progress"
  },
  "timestamp": 1704067200000
}
```

### 2.7 移动任务（看板拖拽）

**请求：**
```http
POST /api/v1/tasks/:id/move
Content-Type: application/json

{
  "fromColumn": "todo",
  "toColumn": "in_progress",
  "position": 2
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "taskId": "task-001",
    "fromColumn": "todo",
    "toColumn": "in_progress",
    "status": "in_progress"
  },
  "timestamp": 1704067200000
}
```

### 2.8 批量操作

**请求：**
```http
POST /api/v1/tasks/batch
Content-Type: application/json

{
  "actions": [
    {
      "action": "update",
      "taskId": "task-001",
      "data": { "status": "completed" }
    },
    {
      "action": "delete",
      "taskId": "task-002"
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "results": [
      { "taskId": "task-001", "success": true },
      { "taskId": "task-002", "success": true }
    ],
    "summary": {
      "total": 2,
      "success": 2,
      "failed": 0
    }
  },
  "timestamp": 1704067200000
}
```

---

## 三、员工 (Agents) API

### 3.1 注册员工

**请求：**
```http
POST /api/v1/agents
Content-Type: application/json

{
  "name": "开发 Agent-A",
  "type": "developer",
  "capabilities": ["frontend", "backend"],
  "config": {
    "heartbeatInterval": 30,
    "maxConcurrentTasks": 3
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "agent-001",
    "name": "开发 Agent-A",
    "type": "developer",
    "capabilities": ["frontend", "backend"],
    "config": {
      "heartbeatInterval": 30,
      "maxConcurrentTasks": 3
    },
    "status": "online",
    "currentTasks": [],
    "registeredAt": "2026-04-12T14:00:00Z"
  },
  "timestamp": 1704067200000
}
```

### 3.2 获取员工列表

**请求：**
```http
GET /api/v1/agents?status=online&type=developer
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent-001",
      "name": "开发 Agent-A",
      "status": "online",
      "currentTasks": 2,
      "lastHeartbeat": "2026-04-12T16:00:00Z"
    }
  ],
  "timestamp": 1704067200000
}
```

### 3.3 获取员工详情

**请求：**
```http
GET /api/v1/agents/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "agent-001",
    "name": "开发 Agent-A",
    "type": "developer",
    "capabilities": ["frontend", "backend"],
    "config": {
      "heartbeatInterval": 30,
      "maxConcurrentTasks": 3
    },
    "status": "online",
    "currentTasks": [
      {
        "taskId": "task-001",
        "status": "in_progress",
        "startTime": "2026-04-12T15:00:00Z"
      }
    ],
    "statistics": {
      "totalCompleted": 45,
      "averageCompletionTime": 3600
    },
    "lastHeartbeat": "2026-04-12T16:00:00Z",
    "registeredAt": "2026-04-12T14:00:00Z"
  },
  "timestamp": 1704067200000
}
```

### 3.4 更新员工状态

**请求：**
```http
PATCH /api/v1/agents/:id
Content-Type: application/json

{
  "status": "busy",
  "currentTasks": ["task-001", "task-002"]
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "agent-001",
    "status": "busy",
    "updatedAt": "2026-04-12T16:00:00Z"
  },
  "timestamp": 1704067200000
}
```

### 3.5 删除员工

**请求：**
```http
DELETE /api/v1/agents/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "agentId": "agent-001"
  },
  "timestamp": 1704067200000
}
```

---

## 四、心跳轮询 API

### 4.1 员工心跳

**请求：**
```http
POST /api/v1/heartbeat
Content-Type: application/json

{
  "agentId": "agent-001",
  "status": "online",
  "currentTasks": ["task-001"],
  "timestamp": 1704067200000
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "agentId": "agent-001",
    "pendingTasks": [
      {
        "id": "task-002",
        "title": "修复登录 bug",
        "priority": "high",
        "tags": ["bug", "auth"],
        "assignedAt": "2026-04-12T16:30:00Z"
      }
    ],
    "serverTime": 1704067260000
  },
  "timestamp": 1704067260000
}
```

### 4.2 获取待处理任务

**请求：**
```http
GET /api/v1/agents/:id/pending-tasks
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-002",
      "title": "修复登录 bug",
      "description": "登录页面提交按钮无响应",
      "priority": "high",
      "tags": ["bug", "auth"],
      "status": "todo",
      "dueDate": "2026-04-13T00:00:00Z",
      "assignedAt": "2026-04-12T16:30:00Z"
    }
  ],
  "timestamp": 1704067260000
}
```

### 4.3 任务确认接收

**请求：**
```http
POST /api/v1/tasks/:id/receive
Content-Type: application/json

{
  "agentId": "agent-001"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "taskId": "task-001",
    "agentId": "agent-001",
    "receivedAt": "2026-04-12T17:00:00Z"
  },
  "timestamp": 1704067620000
}
```

---

## 五、任务模板 API

### 5.1 获取模板列表

**请求：**
```http
GET /api/v1/templates
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "login-feature",
      "name": "登录功能模板",
      "description": "用户登录、注册、密码重置的标准开发流程",
      "stages": ["设计", "开发", "测试", "验收"],
      "tags": ["auth", "feature"],
      "createdAt": "2026-04-01T00:00:00Z"
    }
  ],
  "timestamp": 1704067200000
}
```

### 5.2 创建模板

**请求：**
```http
POST /api/v1/templates
Content-Type: application/json

{
  "name": "Bug 修复模板",
  "description": "标准 Bug 修复流程",
  "stages": ["复现", "定位", "修复", "回归测试"],
  "tags": ["bug", "fix"],
  "defaultPriority": "high"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "bug-fix",
    "name": "Bug 修复模板",
    "description": "标准 Bug 修复流程",
    "stages": ["复现", "定位", "修复", "回归测试"],
    "tags": ["bug", "fix"],
    "defaultPriority": "high",
    "createdAt": "2026-04-12T17:00:00Z"
  },
  "timestamp": 1704067620000
}
```

### 5.3 更新模板

**请求：**
```http
PATCH /api/v1/templates/:id
Content-Type: application/json

{
  "name": "Bug 修复模板 (更新)",
  "stages": ["复现", "定位", "修复", "测试", "上线"]
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "bug-fix",
    "name": "Bug 修复模板 (更新)",
    "stages": ["复现", "定位", "修复", "测试", "上线"],
    "updatedAt": "2026-04-12T17:30:00Z"
  },
  "timestamp": 1704068400000
}
```

### 5.4 删除模板

**请求：**
```http
DELETE /api/v1/templates/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "templateId": "bug-fix"
  },
  "timestamp": 1704068400000
}
```

---

## 六、WebSocket 实时通信

### 6.1 连接建立

**连接：**
```
ws://localhost:3001/ws
```

**认证：**
```json
// 客户端发送
{
  "type": "auth",
  "payload": {
    "clientId": "client-001",
    "apiKey": "your-api-key"
  }
}

// 服务器响应
{
  "type": "auth_success",
  "payload": {
    "message": "认证成功",
    "clientId": "client-001"
  }
}
```

### 6.2 订阅频道

**订阅：**
```json
{
  "type": "subscribe",
  "payload": {
    "channels": ["tasks", "agents", "notifications"]
  }
}
```

**响应：**
```json
{
  "type": "subscribed",
  "payload": {
    "channels": ["tasks", "agents", "notifications"]
  }
}
```

### 6.3 取消订阅

**取消订阅：**
```json
{
  "type": "unsubscribe",
  "payload": {
    "channels": ["tasks"]
  }
}
```

### 6.4 服务端广播事件

**任务创建事件：**
```json
{
  "type": "task_created",
  "channel": "tasks",
  "payload": {
    "task": { ... },
    "createdAt": "2026-04-12T18:00:00Z"
  }
}
```

**任务更新事件：**
```json
{
  "type": "task_updated",
  "channel": "tasks",
  "payload": {
    "task": { ... },
    "changes": ["status", "priority"],
    "updatedAt": "2026-04-12T18:30:00Z"
  }
}
```

**任务分配事件：**
```json
{
  "type": "task_assigned",
  "channel": "agents",
  "payload": {
    "taskId": "task-001",
    "agentId": "agent-001",
    "assignedAt": "2026-04-12T19:00:00Z"
  }
}
```

**通知事件：**
```json
{
  "type": "notification",
  "channel": "notifications",
  "payload": {
    "id": "notif-001",
    "agentId": "agent-001",
    "title": "新任务分配",
    "message": "任务「修复登录 bug」已分配给您",
    "type": "task_assignment",
    "read": false,
    "createdAt": "2026-04-12T19:00:00Z"
  }
}
```

**任务完成事件：**
```json
{
  "type": "task_completed",
  "channel": "tasks",
  "payload": {
    "task": { ... },
    "completedBy": "agent-001",
    "completedAt": "2026-04-12T20:00:00Z"
  }
}
```

### 6.5 客户端发送事件

**请求任务列表：**
```json
{
  "type": "request_tasks",
  "channel": "tasks",
  "payload": {
    "filters": {
      "status": "todo",
      "priority": "high"
    }
  }
}
```

**更新任务状态：**
```json
{
  "type": "update_task",
  "channel": "tasks",
  "payload": {
    "taskId": "task-001",
    "data": {
      "status": "in_progress"
    }
  }
}
```

---

## 七、鉴权 API

### 7.1 获取 API Key

**请求：**
```http
POST /api/v1/auth/generate-key
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "apiKey": "sk_live_abc123...",
    "expiresAt": "2026-07-12T00:00:00Z",
    "permissions": ["read", "write", "admin"]
  },
  "timestamp": 1704067200000
}
```

### 7.2 验证 API Key

**请求：**
```http
GET /api/v1/auth/verify
X-API-Key: sk_live_abc123...
```

**响应：**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "permissions": ["read", "write", "admin"],
    "expiresAt": "2026-07-12T00:00:00Z"
  },
  "timestamp": 1704067200000
}
```

---

## 八、系统配置 API

### 8.1 获取系统配置

**请求：**
```http
GET /api/v1/config
```

**响应：**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "serverTime": 1704067200000,
    "features": {
      "kanban": true,
      "templates": true,
      "notifications": true
    },
    "limits": {
      "maxTasksPerAgent": 10,
      "maxTasksTotal": 1000,
      "heartbeatInterval": 30
    }
  },
  "timestamp": 1704067200000
}
```

### 8.2 更新系统配置

**请求：**
```http
PATCH /api/v1/config
Content-Type: application/json

{
  "features": {
    "notifications": false
  }
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "features": {
      "kanban": true,
      "templates": true,
      "notifications": false
    },
    "updatedAt": "2026-04-12T19:30:00Z"
  },
  "timestamp": 1704068400000
}
```

---

## 附录 A：类型定义

### A.1 Task 类型

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  status: TaskStatus;
  assigneeId?: string;
  templateId?: string;
  dueDate?: string;
  metadata?: Record<string, any>;
  history: TaskHistory[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'archived';

interface TaskHistory {
  action: string;
  actor: string;
  timestamp: string;
  details?: Record<string, any>;
}
```

### A.2 Agent 类型

```typescript
interface Agent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  config: AgentConfig;
  status: 'online' | 'busy' | 'offline';
  currentTasks: CurrentTask[];
  statistics?: AgentStatistics;
  lastHeartbeat?: string;
  registeredAt: string;
}

interface AgentConfig {
  heartbeatInterval: number;
  maxConcurrentTasks: number;
  preferences?: Record<string, any>;
}

interface CurrentTask {
  taskId: string;
  status: TaskStatus;
  startTime: string;
}

interface AgentStatistics {
  totalCompleted: number;
  averageCompletionTime: number;
  successRate: number;
}
```

---

*文档版本：v1.0*
*最后更新：2026-04-12*
