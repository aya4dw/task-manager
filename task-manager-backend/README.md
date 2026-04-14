# Task Manager Backend

基于 Node.js + Express + WebSocket 的任务管理系统后端，采用 JSON 文件存储，支持多 Agent 协作。

## 📋 功能特性

- ✅ RESTful API 接口
- ✅ WebSocket 实时通信
- ✅ 任务 CRUD 操作
- ✅ Agent（员工）管理
- ✅ 心跳轮询机制
- ✅ 任务模板系统
- ✅ 通知系统
- ✅ JSON 文件存储（无需数据库）
- ✅ 自动备份
- ✅ TypeScript 类型安全

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 编译项目

```bash
npm run build
```

### 启动服务

```bash
npm start
```

服务将在 `http://localhost:3001` 启动。

### 开发模式

```bash
npm run dev
```

## 📁 项目结构

```
task-manager-backend/
├── src/
│   ├── app.ts                 # 主入口
│   ├── types/                # TypeScript 类型定义
│   │   └── index.ts
│   ├── storage/              # 数据持久化
│   │   └── JSONStorage.ts
│   ├── services/             # 业务逻辑
│   │   ├── TaskService.ts
│   │   ├── AgentService.ts
│   │   ├── NotificationService.ts
│   │   ├── WebSocketService.ts
│   │   └── AuthService.ts
│   ├── routes/               # API 路由
│   │   ├── tasks.ts
│   │   ├── agents.ts
│   │   ├── heartbeat.ts
│   │   ├── templates.ts
│   │   └── config.ts
│   └── middleware/           # 中间件
│       ├── errorHandler.ts
│       ├── logging.ts
│       └── cors.ts
├── test/
│   └── api-test.js          # API 测试脚本
├── data/                    # 数据文件（自动创建）
│   ├── tasks.json
│   ├── agents.json
│   ├── templates.json
│   ├── notifications.json
│   ├── history.json
│   └── config.json
├── backups/                 # 备份文件
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API 文档

### 健康检查

```bash
curl http://localhost:3001/api/health
```

响应：
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": 1704067200000,
  "websocketConnections": 0
}
```

### 任务管理

#### 创建任务

```bash
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "开发用户登录功能",
    "description": "实现用户登录、注册功能",
    "priority": "high",
    "tags": ["backend", "auth"],
    "status": "todo"
  }'
```

#### 获取任务列表

```bash
curl http://localhost:3001/api/v1/tasks?status=todo&priority=high
```

#### 获取单个任务

```bash
curl http://localhost:3001/api/v1/tasks/{taskId}
```

#### 更新任务

```bash
curl -X PATCH http://localhost:3001/api/v1/tasks/{taskId} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新后的标题",
    "status": "in_progress"
  }'
```

#### 分配任务

```bash
curl -X POST http://localhost:3001/api/v1/tasks/{taskId}/assign \
  -H "Content-Type: application/json" \
  -d '{
    "assigneeId": "agent-001"
  }'
```

#### 移动任务（看板拖拽）

```bash
curl -X POST http://localhost:3001/api/v1/tasks/{taskId}/move \
  -H "Content-Type: application/json" \
  -d '{
    "toColumn": "in_progress",
    "position": 1
  }'
```

#### 删除任务

```bash
curl -X DELETE http://localhost:3001/api/v1/tasks/{taskId}
```

### Agent（员工）管理

#### 创建 Agent

```bash
curl -X POST http://localhost:3001/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "开发 Agent-A",
    "type": "developer",
    "capabilities": ["frontend", "backend"],
    "config": {
      "heartbeatInterval": 30,
      "maxConcurrentTasks": 3
    }
  }'
```

#### 获取 Agent 列表

```bash
curl http://localhost:3001/api/v1/agents?status=online
```

#### 获取 Agent 详情

```bash
curl http://localhost:3001/api/v1/agents/{agentId}
```

#### 获取待处理任务

```bash
curl http://localhost:3001/api/v1/agents/{agentId}/pending-tasks
```

#### 删除 Agent

```bash
curl -X DELETE http://localhost:3001/api/v1/agents/{agentId}
```

### 心跳轮询

```bash
curl -X POST http://localhost:3001/api/v1/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-001",
    "status": "online",
    "currentTasks": ["task-001"]
  }'
```

响应中包含该 Agent 的待处理任务列表。

### 模板管理

#### 创建模板

```bash
curl -X POST http://localhost:3001/api/v1/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bug 修复模板",
    "description": "标准 Bug 修复流程",
    "stages": [
      {"id": "s1", "name": "复现", "order": 1, "status": "todo", "estimatedTime": 30},
      {"id": "s2", "name": "修复", "order": 2, "status": "todo", "estimatedTime": 120}
    ],
    "tags": ["bug", "fix"]
  }'
```

#### 获取模板列表

```bash
curl http://localhost:3001/api/v1/templates
```

### 系统配置

#### 获取配置

```bash
curl http://localhost:3001/api/v1/config
```

#### 更新配置

```bash
curl -X PATCH http://localhost:3001/api/v1/config \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "notifications": false
    }
  }'
```

## 🔌 WebSocket 协议

### 连接

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.on('open', () => {
  // 认证
  ws.send(JSON.stringify({
    type: 'auth',
    payload: {
      clientId: 'client-001',
      apiKey: 'default-api-key-change-me'
    }
  }));
});

ws.on('message', (data) => {
  console.log('Received:', JSON.parse(data));
});
```

### 订阅频道

```javascript
// 认证后订阅频道
ws.send(JSON.stringify({
  type: 'subscribe',
  payload: {
    channels: ['tasks', 'agents', 'notifications']
  }
}));
```

### 服务端事件

- `task_created` - 任务创建
- `task_updated` - 任务更新
- `task_assigned` - 任务分配
- `task_completed` - 任务完成
- `notification` - 通知消息

## 🧪 运行测试

```bash
npm test
```

测试脚本会验证所有 API 端点的功能。

## 📊 数据持久化

系统使用 JSON 文件存储数据：

- `data/tasks.json` - 任务数据
- `data/agents.json` - Agent 数据
- `data/templates.json` - 模板数据
- `data/notifications.json` - 通知数据
- `data/history.json` - 操作日志
- `data/config.json` - 系统配置

### 备份

系统会在关机时自动创建备份到 `backups/` 目录。

## 🔐 安全

默认 API Key: `default-api-key-change-me`

生产环境请修改 `data/config.json` 中的 `auth.apiKey`。

## 🛠️ 技术栈

- **运行时**: Node.js 20+
- **框架**: Express.js 4
- **WebSocket**: ws 8
- **语言**: TypeScript 5
- **存储**: JSON 文件

## 📝 许可证

MIT

## 👨‍💻 作者

Andrew - Task Manager 架构设计师

---

*版本：1.0.0*
*最后更新：2026-04-12*
