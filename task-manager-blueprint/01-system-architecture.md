# 任务管理系统 - 系统架构文档

> 版本：v1.0 | 创建日期：2026-04-12

---

## 一、系统概述

### 1.1 项目目标

构建一套用于多 Agent 协作的任务管理系统，支持任务的可视化看板、流转、心跳轮询和实时通知。

### 1.2 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 前端 | React 18 + TypeScript | 组件化开发，类型安全 |
| UI 框架 | TailwindCSS + shadcn/ui | 快速构建现代化界面 |
| 拖拽库 | dnd-kit | 轻量级拖拽解决方案 |
| 后端 | Node.js + Express | RESTful API 服务 |
| 实时通信 | ws (WebSocket) | 双向实时消息推送 |
| 数据存储 | JSON 文件 | 本地轻量存储，便于调试 |
| 开发服务器 | Vite | 快速开发和构建 |

### 1.3 端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端开发服务器 | 3000 | Vite dev server |
| 后端 API 服务 | 3001 | Express + WebSocket |

---

## 二、系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端层                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React 前端 (端口 3000)                    │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │  看板视图 │ │  任务详情 │ │  设置页面 │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  │           ↓  Axios + WebSocket                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                        网关层                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              后端服务 (端口 3001)                      │    │
│  │                                                     │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐  │    │
│  │  │   REST    │  │ WebSocket │  │  中间件层      │  │    │
│  │  │   Router  │  │  Handler  │  │ - 鉴权        │  │    │
│  │  └───────────┘  └───────────┘  │ - 日志        │  │    │
│  │             │                  │ - 错误处理    │  │    │
│  │             └──────────────────┘               │  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                      数据存储层                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              data/ 目录                              │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │  tasks.  │ │  agents. │ │  config. │           │    │
│  │  │  json    │ │  json    │ │  json    │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、核心模块设计

### 3.1 任务管理模块

**职责：** 任务的 CRUD、流转、状态管理

```
TaskManager
├── createTask(taskData) → taskId
├── getTask(id) → Task
├── updateTask(id, updates) → Task
├── deleteTask(id) → boolean
├── getTasksByAgent(agentId) → Task[]
├── getTasksByStatus(status) → Task[]
├── moveTask(id, fromColumn, toColumn) → Task
└── assignTask(taskId, agentId) → Task
```

### 3.2 实时通信模块

**职责：** WebSocket 连接管理、消息广播

```
WebSocketService
├── connect(clientId) → Connection
├── disconnect(clientId) → void
├── broadcast(event, data) → void
├── sendTo(clientId, event, data) → void
├── sendToChannel(channel, event, data) → void
└── on(event, callback) → void
```

### 3.3 心跳轮询模块

**职责：** 支持 Agents 主动获取任务

```
HeartbeatService
├── registerAgent(agentId, config) → void
├── unregisterAgent(agentId) → void
├── getPendingTasks(agentId) → Task[]
├── markTaskReceived(taskId, agentId) → void
└── getAgentStatus(agentId) → AgentStatus
```

### 3.4 存储模块

**职责：** JSON 文件的读写、事务管理

```
StorageService
├── read(filename) → Data
├── write(filename, data) → void
├── update(filename, updater) → Data  // 原子更新
├── getAtomic(filename) → DataPromise
└── watch(filename, callback) → Unsubscribe
```

---

## 四、目录结构

```
task-manager/
├── frontend/                      # 前端项目
│   ├── src/
│   │   ├── components/            # React 组件
│   │   │   ├── kanban/           # 看板组件
│   │   │   ├── task/             # 任务卡片组件
│   │   │   ├── dialog/           # 对话框组件
│   │   │   └── layout/           # 布局组件
│   │   ├── hooks/                # 自定义 Hooks
│   │   ├── services/             # API 服务
│   │   ├── store/                # 状态管理
│   │   ├── types/                # TypeScript 类型
│   │   └── utils/                # 工具函数
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                       # 后端项目
│   ├── src/
│   │   ├── routes/               # API 路由
│   │   │   ├── tasks.ts
│   │   │   ├── agents.ts
│   │   │   ├── heartbeat.ts
│   │   │   └── ws.ts
│   │   ├── services/             # 业务逻辑
│   │   │   ├── TaskService.ts
│   │   │   ├── AgentService.ts
│   │   │   └── NotificationService.ts
│   │   ├── storage/              # 数据存储
│   │   │   └── JSONStorage.ts
│   │   ├── middleware/           # 中间件
│   │   │   ├── auth.ts
│   │   │   ├── logging.ts
│   │   │   └── errorHandler.ts
│   │   ├── types/                # TypeScript 类型
│   │   └── app.ts
│   ├── data/                     # 数据文件
│   │   ├── tasks.json
│   │   ├── agents.json
│   │   └── config.json
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                          # 项目文档
│   ├── 01-system-architecture.md
│   ├── 02-api-specification.md
│   ├── 03-database-design.md
│   └── 04-frontend-components.md
│
└── README.md
```

---

## 五、安全性设计

### 5.1 认证机制

```typescript
interface AuthConfig {
  apiKey: string;           // API 密钥
  token: string;            // JWT Token (可选)
  clientId: string;         // 客户端标识
  allowedOrigins: string[]; // 允许的源
}
```

### 5.2 数据隔离

- 每个任务关联 `ownerId`（创建者）和 `assignedTo`（当前负责人）
- 权限检查：只有 owner 和管理员可以修改任务状态流转
- Agents 只能读取分配给自己的任务

### 5.3 输入验证

- 使用 Zod 进行请求参数验证
- 防止 SQL 注入（虽然使用 JSON，但保持安全意识）
- XSS 防护：前端组件输出转义

---

## 六、性能优化

### 6.1 前端优化

- 代码分割：按路由懒加载组件
- 虚拟列表：大量任务时使用 virtual-scroll
- WebSocket 重连：指数退避策略
- 离线缓存：关键数据本地缓存

### 6.2 后端优化

- JSON 文件读写缓存
- 任务列表分页加载
- WebSocket 消息压缩
- 请求限流：防止心跳轮询频率过高

---

## 七、可扩展性

### 7.1 水平扩展

- 后端支持集群部署（需要共享存储）
- WebSocket 支持水平扩展（Redis Pub/Sub）

### 7.2 功能扩展

- 插件系统：支持自定义任务处理器
- 事件钩子：任务状态变化时触发
- 国际化：i18n 支持多语言

---

## 八、部署方案

### 8.1 开发环境

```bash
# 前端开发
cd frontend && npm run dev  # http://localhost:3000

# 后端开发
cd backend && npm run dev   # http://localhost:3001
```

### 8.2 生产环境

```bash
# 构建前端
npm run build  # 输出到 dist/

# 启动后端（含静态文件服务）
npm start -- --serve-static
```

### 8.3 局域网访问

- 后端绑定 `0.0.0.0:3001`
- 前端配置 `server.host = "0.0.0.0"`
- 防火墙开放端口

---

## 九、监控与日志

### 9.1 日志级别

- `error`: 系统错误，需要立即关注
- `warn`: 警告信息
- `info`: 正常业务流程
- `debug`: 调试信息（开发环境开启）

### 9.2 监控指标

- API 响应时间
- WebSocket 连接数
- 任务处理延迟
- 系统资源占用

---

## 十、未来规划

1. **数据库升级**：从 JSON 迁移到 SQLite/PostgreSQL
2. **用户系统**：完整的用户注册、登录、权限管理
3. **任务依赖**：支持任务间的依赖关系
4. **时间追踪**：记录任务处理时长
5. **报表分析**：任务统计、效率分析

---

*文档版本：v1.0*
*最后更新：2026-04-12*
