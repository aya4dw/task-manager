# 任务管理系统 - 前端

基于 Vite + React + TypeScript 的任务管理系统前端应用。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **CSS 框架**: TailwindCSS
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **图标**: Lucide React
- **拖拽**: 原生 HTML5 Drag and Drop API

## 项目结构

```
src/
├── components/          # React 组件
│   ├── ui/            # UI 基础组件 (Button, Input, Modal, etc.)
│   ├── kanban/        # 看板组件 (KanbanBoard, KanbanColumn, TaskCard)
│   ├── task/          # 任务相关组件 (TaskForm, TaskDialog)
│   └── layout/        # 布局组件 (MainLayout)
├── hooks/             # 自定义 Hooks
│   ├── useTasks.ts    # 任务数据管理
│   ├── useWebSocket.ts # WebSocket 连接管理
│   └── useDragDrop.ts # 拖拽逻辑
├── services/          # API 服务
│   ├── taskService.ts # 任务 API
│   ├── agentService.ts # 员工 API
│   └── wsService.ts   # WebSocket 服务
├── types/             # TypeScript 类型定义
│   ├── task.ts        # 任务类型
│   ├── agent.ts       # 员工类型
│   ├── template.ts    # 模板类型
│   └── api.ts         # API 相关类型
├── pages/             # 页面组件
│   ├── Dashboard.tsx  # 仪表盘
│   ├── Kanban.tsx     # 看板页面
│   ├── Agents.tsx     # 员工管理
│   ├── Templates.tsx  # 模板管理
│   └── Settings.tsx   # 设置页面
├── utils/             # 工具函数
├── App.tsx            # 应用入口
├── main.tsx           # 应用启动
└── index.css          # 全局样式
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录

### 类型检查

```bash
npm run type-check
```

## 配置说明

### API 配置

在浏览器本地存储中设置 API Key:

1. 打开设置页面 (`/settings`)
2. 输入 API Key
3. 点击保存

### 后端地址配置

- 默认后端地址：`http://localhost:3001`
- 开发环境通过 Vite 代理转发 `/api` 和 `/ws` 请求
- 生产环境可通过环境变量 `VITE_API_URL` 和 `VITE_WS_URL` 配置

## 功能特性

### 看板功能

- ✅ 拖拽任务卡片切换状态
- ✅ 任务卡片显示优先级、标签、截止日期
- ✅ 列视图：待处理、进行中、待审核、已完成
- ✅ 响应式设计，支持移动端

### 任务管理

- ✅ 创建/编辑/删除任务
- ✅ 任务详情查看
- ✅ 任务标签管理
- ✅ 优先级设置
- ✅ 截止日期设置

### 实时通信

- ✅ WebSocket 实时推送
- ✅ 任务创建/更新/删除事件
- ✅ 自动重连机制

### 设置

- ✅ API Key 配置
- ✅ 系统信息查看

## 组件说明

### KanbanBoard

看板主组件，渲染所有任务列。

```tsx
<KanbanBoard
  tasks={tasks}
  onTaskMove={handleTaskMove}
  onTaskClick={handleTaskClick}
  onCreateTask={handleCreateTask}
/>
```

### TaskCard

任务卡片组件，支持拖拽。

```tsx
<TaskCard
  task={task}
  onClick={onTaskClick}
  onDragStart={onDragStart}
/>
```

### TaskDialog

任务详情对话框，支持查看和编辑。

```tsx
<TaskDialog
  task={selectedTask}
  isOpen={isDialogOpen}
  onClose={handleClose}
  onSave={handleSave}
  onDelete={handleDelete}
/>
```

## 开发规范

- 使用 TypeScript 严格模式
- 组件采用函数式组件 + Hooks
- 样式使用 TailwindCSS 原子类
- 遵循 React 最佳实践

## 性能优化

- 路由懒加载（待实现）
- 组件 Memo 优化
- 虚拟滚动（大量任务时使用）
- WebSocket 消息去重

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**版本**: 1.0.0  
**最后更新**: 2026-04-12
