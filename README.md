# 任务管理系统

> **Task Management System** - 基于 AI Agent 协作的可视化任务管理平台

**版本**: 1.0.0  
**开发日期**: 2026-04-12 至 2026-04-13  
**开发周期**: 2 天  
**团队成员**: Andrew (CEO/项目经理), 蓝图 (架构师), 零点 (后端), 基石 (前端), 极客哨兵 (QA)

---

## 📖 项目简介

这是一个专为 AI Agent 协作设计的任务管理系统，灵感来源于游戏中的任务系统。系统提供可视化看板、实时通信、任务流转等功能，支持多个 Agent 之间的高效协作。

### 核心特性

- ✅ **可视化看板** - 类似 Kanban 的拖拽式任务管理
- ✅ **实时通信** - WebSocket 实时推送任务状态变化
- ✅ **Agent 协作** - 支持多个 AI Agent 注册、任务分配、状态汇报
- ✅ **心跳轮询** - Agent 主动获取待处理任务
- ✅ **任务模板** - 预定义任务流程，提高开发效率
- ✅ **无数据库** - 使用 JSON 文件存储，部署简单
- ✅ **TypeScript 全栈** - 前后端均使用 TypeScript，类型安全

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Dashboard│  │  Kanban  │  │  Agents  │  │Settings  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│       React 18 + TypeScript + TailwindCSS + Vite        │
└─────────────────────────────────────────────────────────┘
                          ↕️ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                      后端层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Tasks   │  │  Agents  │  │  Heart   │  │ Templates│ │
│  │  Router  │  │  Router  │  │  Router  │  │  Router  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│       Node.js + Express + TypeScript + WebSocket         │
└─────────────────────────────────────────────────────────┘
                          ↕️
┌─────────────────────────────────────────────────────────┐
│                      存储层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ tasks    │  │ agents   │  │ history  │  │ config   │ │
│  │  .json   │  │  .json   │  │  .json   │  │  .json   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│              JSON 文件存储（自动备份）                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 项目结构

```
task-manager/
├── task-manager-blueprint/      # 架构设计文档
│   ├── README.md
│   ├── 01-system-architecture.md
│   ├── 02-api-specification.md
│   ├── 03-database-design.md
│   └── 04-frontend-components.md
│
├── task-manager-backend/        # 后端服务
│   ├── src/
│   │   ├── app.ts              # 主入口
│   │   ├── types/              # 类型定义
│   │   ├── storage/            # JSON 存储层
│   │   ├── services/           # 业务逻辑服务
│   │   ├── routes/             # API 路由
│   │   └── middleware/         # 中间件
│   ├── test/
│   │   └── api-test.js         # API 测试脚本
│   ├── data/                   # 数据文件
│   ├── backups/                # 备份文件
│   └── README.md
│
├── task-manager-frontend/       # 前端应用
│   ├── src/
│   │   ├── components/         # React 组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── pages/              # 页面
│   │   ├── services/           # API 服务
│   │   └── types/              # 类型定义
│   └── README.md
│
└── README.md                    # 本文档
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **端口**: 3001 (后端), 3000/3002 (前端)

### 1. 启动后端服务

```bash
# 进入后端目录
cd task-manager-backend

# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 启动服务
npm start
```

后端服务将在 `http://localhost:3001` 启动。

### 2. 启动前端应用

```bash
# 进入前端目录
cd task-manager-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:3000` (或 3002) 启动。

### 3. 验证系统

```bash
# 测试后端健康检查
curl http://localhost:3001/api/health

# 应该返回：
# {"status":"ok","version":"1.0.0","timestamp":...}
```

---

## 📚 功能特性

### 1. 任务管理

#### 创建任务
```bash
curl -X POST http://localhost:3001/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "开发用户登录功能",
    "description": "实现用户登录、注册功能",
    "priority": "high",
    "tags": ["backend", "auth"],
    "status": "todo",
    "dueDate": "2026-04-20"
  }'
```

#### 获取任务列表
```bash
# 获取所有任务
curl http://localhost:3001/api/v1/tasks

# 按状态筛选
curl http://localhost:3001/api/v1/tasks?status=todo

# 分页查询
curl http://localhost:3001/api/v1/tasks?page=1&limit=10
```

#### 更新任务
```bash
curl -X PATCH http://localhost:3001/api/v1/tasks/{taskId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "progress": 50
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

### 2. Agent（员工）管理

#### 注册 Agent
```bash
curl -X POST http://localhost:3001/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "开发 Agent-A",
    "type": "developer",
    "description": "负责前端开发",
    "capabilities": ["frontend", "react"],
    "config": {
      "heartbeatInterval": 30,
      "maxConcurrentTasks": 3,
      "autoAcceptTasks": true
    }
  }'
```

#### 获取待处理任务
```bash
curl http://localhost:3001/api/v1/agents/{agentId}/pending-tasks
```

#### Agent 心跳上报
```bash
curl -X POST http://localhost:3001/api/v1/heartbeat \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-001",
    "status": "online",
    "currentTasks": ["task-001", "task-002"]
  }'
```

### 3. 任务模板

#### 创建模板
```bash
curl -X POST http://localhost:3001/api/v1/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bug 修复流程",
    "description": "标准 Bug 修复流程",
    "stages": [
      {"id": "s1", "name": "复现问题", "status": "todo", "order": 1},
      {"id": "s2", "name": "定位原因", "status": "todo", "order": 2},
      {"id": "s3", "name": "编写修复", "status": "todo", "order": 3},
      {"id": "s4", "name": "测试验证", "status": "todo", "order": 4}
    ],
    "tags": ["bug", "fix"],
    "defaultPriority": "high"
  }'
```

### 4. WebSocket 实时通信

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

// 订阅频道
ws.send(JSON.stringify({
  type: 'subscribe',
  payload: {
    channels: ['tasks', 'agents', 'notifications']
  }
}));

// 接收实时消息
ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('实时消息:', msg);
});
```

**支持的事件类型：**
- `task_created` - 任务创建
- `task_updated` - 任务更新
- `task_assigned` - 任务分配
- `task_completed` - 任务完成
- `notification` - 系统通知

---

## 📊 数据持久化

系统使用 JSON 文件存储所有数据，无需数据库：

| 文件 | 说明 |
|------|------|
| `data/tasks.json` | 任务数据 |
| `data/agents.json` | Agent 信息 |
| `data/templates.json` | 任务模板 |
| `data/notifications.json` | 通知消息 |
| `data/history.json` | 操作日志 |
| `data/config.json` | 系统配置 |

**自动备份：** 系统会在关机时自动创建备份到 `backups/` 目录。

---

## 🔐 安全配置

### 默认凭证

- **API Key**: `default-api-key-change-me`
- **监听地址**: `0.0.0.0`（允许局域网访问）

### 生产环境配置

编辑 `data/config.json`：

```json
{
  "auth": {
    "apiKey": "your-secure-api-key-here"
  },
  "server": {
    "host": "127.0.0.1",
    "port": 3001
  }
}
```

---

## 🧪 运行测试

### 后端测试
```bash
cd task-manager-backend
npm test
```

### 测试覆盖率
- 后端 API 测试：22 个测试用例，100% 通过
- 前端功能测试：3 个测试用例，100% 通过
- 联调测试：4 个测试用例，100% 通过

---

## 📖 API 文档

完整的 API 文档请参考：
- 后端 API：`task-manager-backend/README.md`
- 前端文档：`task-manager-frontend/README.md`
- 架构设计：`task-manager-blueprint/02-api-specification.md`

---

## 🛠️ 技术栈

### 后端
- **运行时**: Node.js 20+
- **框架**: Express.js 4
- **语言**: TypeScript 5
- **WebSocket**: ws 8
- **存储**: JSON 文件

### 前端
- **框架**: React 18
- **语言**: TypeScript 5
- **构建**: Vite 8
- **样式**: TailwindCSS 3
- **路由**: React Router 6
- **图标**: Lucide React

---

## 👥 开发团队

| 角色 | 成员 | 职责 | 状态 |
|------|------|------|------|
| **项目经理** | Andrew | 任务发布、验收、协调 | ✅ |
| **架构师** | 蓝图 | 系统设计、技术选型 | ✅ |
| **后端工程师** | 零点 | API 开发、WebSocket、存储 | ✅ |
| **前端工程师** | 基石 | 可视化看板、实时交互 | ✅ |
| **测试工程师** | 极客哨兵 | 系统测试、质量验收 | ✅ |

---

## 📅 项目里程碑

| 里程碑 | 日期 | 状态 | 描述 |
|--------|------|------|------|
| **M1** | 2026-04-12 | ✅ | 项目启动、团队组建 |
| **M2** | 2026-04-12 | ✅ | 架构设计完成 |
| **M3** | 2026-04-13 | ✅ | 后端开发完成 |
| **M4** | 2026-04-12 | ✅ | 前端开发完成 |
| **M5** | 2026-04-13 | ✅ | 测试验收通过 |

---

## 📝 许可证

MIT License

---

## 📮 联系方式

**项目 Owner**: Andrew  
**邮箱**: weidng1982@outlook.com

---

**版本**: 1.0.0  
**最后更新**: 2026-04-13  
**开发周期**: 2 天  
**代码行数**: 6000+ 行
