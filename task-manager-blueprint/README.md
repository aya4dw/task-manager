# 任务管理系统 - 架构设计文档

> 项目名称：Task Manager  
> 版本：v1.0  
> 创建日期：2026-04-12  
> 作者：Andrew (架构设计师)

---

## 📋 目录概览

| 文件 | 说明 |
|------|------|
| [`01-system-architecture.md`](./01-system-architecture.md) | 系统架构设计 |
| [`02-api-specification.md`](./02-api-specification.md) | API 接口规范 |
| [`03-database-design.md`](./03-database-design.md) | 数据库设计 |
| [`04-frontend-components.md`](./04-frontend-components.md) | 前端组件设计 |

---

## 🎯 项目目标

构建一套用于多 Agent 协作的任务管理系统，支持：

- ✅ 可视化任务看板（Kanban 白板）
- ✅ 任务块拖拽、编辑、分配
- ✅ 任务流转：发布者→员工→验收
- ✅ 心跳轮询获取任务
- ✅ 状态更新和实时通知
- ✅ RESTful API + WebSocket
- ✅ 任务模板、优先级、标签

---

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + TailwindCSS |
| 后端 | Node.js + Express |
| 实时通信 | WebSocket (ws) |
| 存储 | JSON 文件 |
| 端口 | 前端 3000 / 后端 3001 |

---

## 📁 项目结构

```
task-manager/
├── frontend/           # 前端项目
├── backend/            # 后端项目
├── docs/               # 文档目录
└── README.md          # 项目说明
```

---

## 🚀 快速开始

### 前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### 后端

```bash
cd backend
npm install
npm run dev
```

访问 http://localhost:3001

---

## 📊 核心功能

### 1. 任务管理

- CRUD 操作
- 拖拽移动（看板列之间）
- 分配给 Agent
- 状态流转

### 2. 员工管理

- 注册/注销
- 能力标签
- 心跳上报
- 任务统计

### 3. 实时通信

- WebSocket 连接
- 频道订阅
- 事件广播
- 离线重连

### 4. 模板系统

- 模板创建
- 模板应用
- 阶段定义
- 使用统计

---

## 🔐 安全设计

- API Key 认证
- 请求限流
- 输入验证
- 数据隔离

---

## 📈 性能优化

- 内存索引
- 读写缓存
- 虚拟列表
- 懒加载

---

## 🔮 未来规划

1. 数据库迁移（SQLite/PostgreSQL）
2. 用户系统（登录/权限）
3. 任务依赖关系
4. 时间追踪统计
5. 报表分析

---

## 📝 文档说明

| 文档 | 内容 |
|------|------|
| 系统架构 | 整体设计、模块划分、目录结构 |
| API 规范 | RESTful 接口、WebSocket 协议 |
| 数据库设计 | JSON Schema、索引、备份策略 |
| 前端组件 | 组件设计、Hooks、页面布局 |

---

## 📞 联系方式

如有疑问，请联系架构设计师 Andrew。

---

*文档版本：v1.0*  
*最后更新：2026-04-12*
