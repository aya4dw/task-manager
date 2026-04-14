# 任务管理系统 - 前端组件设计

> 版本：v1.0 | 创建日期：2026-04-12

---

## 一、组件架构概览

### 1.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + TypeScript | 类型安全的组件开发 |
| 构建工具 | Vite | 快速开发和热更新 |
| CSS 框架 | TailwindCSS | 原子化 CSS，快速样式开发 |
| 组件库 | shadcn/ui | 基于 Radix UI 的可定制组件 |
| 拖拽库 | @dnd-kit/core | 轻量级拖拽解决方案 |
| 状态管理 | Zustand | 轻量级全局状态 |
| HTTP 客户端 | Axios | REST API 调用 |
| WebSocket | native WebSocket | 实时通信 |
| 路由 | React Router v6 | 客户端路由 |
| 图标 | Lucide React | 轻量级图标库 |

### 1.2 项目结构

```
frontend/src/
├── components/
│   ├── common/           # 通用组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   ├── layout/           # 布局组件
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── kanban/           # 看板组件
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskDropZone.tsx
│   ├── task/             # 任务相关组件
│   │   ├── TaskForm.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── TaskDialog.tsx
│   │   └── TaskHistory.tsx
│   ├── agent/            # 员工相关组件
│   │   ├── AgentCard.tsx
│   │   ├── AgentList.tsx
│   │   └── AgentStats.tsx
│   ├── template/         # 模板相关组件
│   │   ├── TemplateCard.tsx
│   │   └── TemplateSelector.tsx
│   └── notification/     # 通知组件
│       ├── NotificationBell.tsx
│       ├── NotificationList.tsx
│       └── Toast.tsx
│
├── hooks/                # 自定义 Hooks
│   ├── useTasks.ts
│   ├── useAgents.ts
│   ├── useWebSocket.ts
│   ├── useDragDrop.ts
│   └── useNotifications.ts
│
├── store/                # 全局状态
│   ├── taskStore.ts
│   ├── agentStore.ts
│   ├── notificationStore.ts
│   └── uiStore.ts
│
├── services/             # API 服务
│   ├── api.ts
│   ├── taskService.ts
│   ├── agentService.ts
│   └── wsService.ts
│
├── types/                # TypeScript 类型
│   ├── task.ts
│   ├── agent.ts
│   ├── template.ts
│   └── api.ts
│
├── utils/                # 工具函数
│   ├── formatDate.ts
│   ├── generateId.ts
│   └── validators.ts
│
├── pages/                # 页面组件
│   ├── Dashboard.tsx
│   ├── Kanban.tsx
│   ├── Agents.tsx
│   ├── Templates.tsx
│   └── Settings.tsx
│
├── App.tsx
└── main.tsx
```

---

## 二、核心组件设计

### 2.1 KanbanBoard - 看板主组件

**职责：** 渲染整个任务看板，包含多个列

**Props:**
```typescript
interface KanbanBoardProps {
  tasks: Task[];
  columns: ColumnConfig[];
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => void;
  onTaskClick: (task: Task) => void;
  onColumnClick: (columnId: string) => void;
  filters?: BoardFilters;
}
```

**内部状态:**
```typescript
interface KanbanBoardState {
  isDragging: boolean;
  draggedTaskId: string | null;
  draggedOverColumn: string | null;
  draggedOverIndex: number;
}
```

**组件结构:**
```tsx
<KanbanBoard>
  {columns.map(column => (
    <KanbanColumn
      key={column.id}
      column={column}
      tasks={tasks.filter(t => t.status === column.status)}
      onDrop={handleTaskDrop}
    />
  ))}
  <TaskCreateModal />
</KanbanBoard>
```

### 2.2 KanbanColumn - 看板列组件

**职责：** 渲染单个任务列，支持拖放

**Props:**
```typescript
interface KanbanColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  onDrop: (columnId: string, index: number) => void;
  onTaskClick: (task: Task) => void;
}
```

**ColumnConfig 类型:**
```typescript
interface ColumnConfig {
  id: string;
  title: string;
  status: TaskStatus;
  color?: string;
  icon?: React.ReactNode;
}
```

**示例列配置:**
```typescript
const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    title: '待处理',
    status: 'todo',
    color: 'bg-gray-100',
    icon: <Clock />
  },
  {
    id: 'in_progress',
    title: '进行中',
    status: 'in_progress',
    color: 'bg-blue-100',
    icon: <Loader />
  },
  {
    id: 'review',
    title: '待审核',
    status: 'review',
    color: 'bg-yellow-100',
    icon: <Eye />
  },
  {
    id: 'completed',
    title: '已完成',
    status: 'completed',
    color: 'bg-green-100',
    icon: <CheckCircle />
  }
];
```

### 2.3 TaskCard - 任务卡片组件

**职责：** 显示单个任务的摘要信息，支持拖拽

**Props:**
```typescript
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick: (task: Task) => void;
  onDragStart: (event: DragEvent, task: Task) => void;
}
```

**显示内容:**
```tsx
<div className="task-card">
  {/* 优先级标签 */}
  <PriorityBadge priority={task.priority} />
  
  {/* 标题 */}
  <h3 className="task-title">{task.title}</h3>
  
  {/* 标签 */}
  <div className="task-tags">
    {task.tags.map(tag => (
      <Tag key={tag} label={tag} />
    ))}
  </div>
  
  {/* 底部信息 */}
  <div className="task-footer">
    {/* 负责人头像 */}
    {task.assigneeId && <Avatar agent={agent} size="small" />}
    
    {/* 截止日期 */}
    {task.dueDate && <DueDate date={task.dueDate} />}
    
    {/* 任务编号 */}
    <TaskId id={task.id} />
  </div>
</div>
```

### 2.4 TaskDialog - 任务详情对话框

**职责：** 显示任务完整信息，支持编辑

**Props:**
```typescript
interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}
```

**Tabs 结构:**
```tsx
<TaskDialog>
  <Tabs>
    <Tab id="details" label="详情">
      <TaskDetail task={task} />
    </Tab>
    <Tab id="edit" label="编辑">
      <TaskForm task={task} onSave={handleSave} />
    </Tab>
    <Tab id="history" label="历史">
      <TaskHistory history={task.history} />
    </Tab>
    <Tab id="assign" label="分配">
      <TaskAssigner 
        currentAssignee={task.assigneeId} 
        onAssign={handleAssign} 
      />
    </Tab>
  </Tabs>
</TaskDialog>
```

### 2.5 TaskForm - 任务表单组件

**职责：** 创建或编辑任务的表单

**Props:**
```typescript
interface TaskFormProps {
  task?: Task;  // 编辑时传入
  onSubmit: (data: CreateTaskData) => Promise<void>;
  onCancel: () => void;
}
```

**表单字段:**
```tsx
<TaskForm>
  <Form.Group label="标题" required>
    <Input name="title" placeholder="输入任务标题" maxLength={200} />
  </Form.Group>
  
  <Form.Group label="描述">
    <TextArea 
      name="description" 
      placeholder="输入任务描述"
      supportsMarkdown
    />
  </Form.Group>
  
  <Form.Group label="优先级">
    <Select name="priority" options={PRIORITY_OPTIONS} />
  </Form.Group>
  
  <Form.Group label="标签">
    <MultiSelect 
      name="tags" 
      options={TAG_OPTIONS}
      allowCustom
    />
  </Form.Group>
  
  <Form.Group label="模板">
    <TemplateSelector name="templateId" />
  </Form.Group>
  
  <Form.Group label="负责人">
    <AgentSelector name="assigneeId" allowEmpty />
  </Form.Group>
  
  <Form.Group label="截止日期">
    <DatePicker name="dueDate" />
  </Form.Group>
  
  <Form.Actions>
    <Button variant="secondary" onClick={onCancel}>取消</Button>
    <Button variant="primary" type="submit">保存</Button>
  </Form.Actions>
</TaskForm>
```

---

## 三、自定义 Hooks 设计

### 3.1 useTasks - 任务数据管理

```typescript
function useTasks(filters?: TaskFilters) {
  // 状态
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // 获取任务列表
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await taskService.getTasks(filters);
      setTasks(result.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  // 创建任务
  const createTask = useCallback(async (data: CreateTaskData) => {
    const task = await taskService.createTask(data);
    setTasks(prev => [...prev, task]);
    return task;
  }, []);
  
  // 更新任务
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = await taskService.updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, []);
  
  // 删除任务
  const deleteTask = useCallback(async (id: string) => {
    await taskService.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);
  
  // 移动任务
  const moveTask = useCallback(async (
    taskId: string, 
    fromColumn: string, 
    toColumn: string
  ) => {
    await taskService.moveTask(taskId, fromColumn, toColumn);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: toColumn as TaskStatus };
      }
      return t;
    }));
  }, []);
  
  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  };
}
```

### 3.2 useWebSocket - WebSocket 连接管理

```typescript
function useWebSocket(url: string, options?: WebSocketOptions) {
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  
  // 连接建立
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnected(true);
      // 自动认证
      ws.send(JSON.stringify({
        type: 'auth',
        payload: { apiKey: getApiKey() }
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };
    
    ws.onclose = () => {
      setConnected(false);
      // 自动重连
      if (options?.reconnect) {
        reconnectWithBackoff();
      }
    };
    
    setConnection(ws);
    
    return () => {
      ws.close();
    };
  }, [url]);
  
  // 订阅频道
  const subscribe = useCallback((channels: string[]) => {
    connection?.send(JSON.stringify({
      type: 'subscribe',
      payload: { channels }
    }));
    setSubscriptions(prev => [...prev, ...channels]);
  }, [connection]);
  
  // 取消订阅
  const unsubscribe = useCallback((channels: string[]) => {
    connection?.send(JSON.stringify({
      type: 'unsubscribe',
      payload: { channels }
    }));
    setSubscriptions(prev => prev.filter(c => !channels.includes(c)));
  }, [connection]);
  
  // 发送消息
  const send = useCallback((type: string, payload: any) => {
    connection?.send(JSON.stringify({ type, payload }));
  }, [connection]);
  
  return {
    connected,
    subscriptions,
    subscribe,
    unsubscribe,
    send
  };
}
```

### 3.3 useDragDrop - 拖拽功能封装

```typescript
function useDragDrop(onDrop: (taskId: string, toColumn: string) => void) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  
  const onDragStart = useCallback((event: DragEvent, task: Task) => {
    setActiveTask(task);
    event.dataTransfer.effectAllowed = 'move';
  }, []);
  
  const onDragEnter = useCallback((event: DragEvent, columnId: string) => {
    event.preventDefault();
    setOverColumn(columnId);
  }, []);
  
  const onDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    setOverColumn(null);
  }, []);
  
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback((event: DragEvent, toColumn: string) => {
    event.preventDefault();
    
    if (activeTask) {
      // 调用父组件的 onDrop
      onDrop(activeTask.id, toColumn);
      
      // 重置状态
      setActiveTask(null);
      setOverColumn(null);
    }
  }, [activeTask, onDrop]);
  
  return {
    activeTask,
    overColumn,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop
  };
}
```

### 3.4 useNotifications - 通知管理

```typescript
function useNotifications(agentId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // 通过 WebSocket 接收通知
  useEffect(() => {
    const ws = getWebSocket();
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'notification') {
        const notification = message.payload;
        
        // 只接收当前 Agent 的通知
        if (!agentId || notification.targetAgentId === agentId) {
          setNotifications(prev => [notification, ...prev]);
          
          if (!notification.read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      }
    };
    
    return () => {
      ws.off('message');
    };
  }, [agentId]);
  
  // 标记为已读
  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);
  
  // 标记全部已读
  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);
  
  // 删除通知
  const dismiss = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismiss
  };
}
```

---

## 四、页面路由设计

### 4.1 路由配置

```tsx
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import Agents from './pages/Agents';
import Templates from './pages/Templates';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
```

### 4.2 Dashboard - 仪表盘页面

**功能:**
- 任务统计概览（按状态、优先级、负责人）
- 待处理任务列表
- 最近活动
- 快速创建任务

### 4.3 Kanban - 看板页面

**功能:**
- 完整拖拽看板
- 任务过滤和搜索
- 批量操作
- 列自定义

### 4.4 Agents - 员工管理页面

**功能:**
- 员工列表
- 员工详情（当前任务、统计）
- 创建/编辑员工
- 能力标签管理

### 4.5 Templates - 模板管理页面

**功能:**
- 模板列表
- 模板预览
- 创建/编辑模板
- 从任务创建模板

### 4.6 Settings - 设置页面

**功能:**
- API 密钥配置
- 系统参数设置
- 数据备份/恢复
- 日志查看

---

## 五、UI 设计规范

### 5.1 颜色方案

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        priority: {
          low: '#10b981',    // green
          medium: '#f59e0b', // amber
          high: '#f97316',   // orange
          urgent: '#ef4444', // red
        }
      }
    }
  }
}
```

### 5.2 间距规范

```typescript
// 使用 Tailwind 的间距系统
// xs: 0.25rem (4px)
// sm: 0.5rem (8px)
// md: 0.75rem (12px)
// lg: 1rem (16px)
// xl: 1.5rem (24px)
// 2xl: 2rem (32px)
```

### 5.3 字体规范

```typescript
// 标题
// h1: text-3xl font-bold
// h2: text-2xl font-bold
// h3: text-xl font-semibold
// h4: text-lg font-semibold

// 正文
// body: text-base
// small: text-sm
// tiny: text-xs
```

---

## 六、响应式设计

### 6.1 断点设计

```typescript
// Tailwind 默认断点
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### 6.2 移动端适配

```tsx
// 看板在移动端的响应式
<div className="kanban-board">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {columns.map(column => (
      <KanbanColumn key={column.id} column={column} />
    ))}
  </div>
</div>

// 任务卡片在移动端的布局
<div className="task-card">
  <div className="flex flex-col sm:flex-row sm:justify-between">
    <div className="task-info">
      <h3 className="task-title">{task.title}</h3>
      <div className="task-tags">{/* tags */}</div>
    </div>
    <div className="task-meta">
      <PriorityBadge priority={task.priority} />
    </div>
  </div>
</div>
```

---

## 七、性能优化

### 7.1 组件懒加载

```tsx
const Kanban = lazy(() => import('./pages/Kanban'));
const Agents = lazy(() => import('./pages/Agents'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/kanban" element={<Kanban />} />
        <Route path="/agents" element={<Agents />} />
      </Routes>
    </Suspense>
  );
}
```

### 7.2 虚拟滚动

```tsx
import { FixedSizeList } from 'react-window';

function TaskList({ tasks }: { tasks: Task[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={tasks.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 7.3 缓存策略

```typescript
// 使用 React Query 或 SWR 进行数据缓存
import useSWR from 'swr';

function useCachedTasks(filters?: TaskFilters) {
  const { data, error, mutate } = useSWR(
    filters ? `tasks?${new URLSearchParams(filters)}` : 'tasks',
    fetcher
  );
  
  return {
    tasks: data?.tasks || [],
    loading: !data && !error,
    error,
    refresh: mutate
  };
}
```

---

## 八、可访问性 (a11y)

### 8.1 键盘导航

```tsx
// 支持键盘操作任务卡片
<TaskCard
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      openTaskDetail(task);
    } else if (e.key === 'Delete') {
      confirmDelete(task);
    }
  }}
>
  {/* content */}
</TaskCard>
```

### 8.2 ARIA 标签

```tsx
// 看板列添加 ARIA 标签
<KanbanColumn
  role="list"
  aria-label={`${column.title} 列，包含${tasks.length}个任务`}
  aria-describedby={`column-${column.id}-description`}
>
  {tasks.map(task => (
    <TaskCard
      key={task.id}
      role="listitem"
      aria-grabbed={isDragging}
      aria-label={`${task.title}, 优先级${task.priority}`}
    />
  ))}
</KanbanColumn>
```

---

## 九、错误处理

### 9.1 全局错误边界

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage 
          error={this.state.error} 
          onRetry={() => this.setState({ hasError: false })} 
        />
      );
    }
    
    return this.props.children;
  }
}
```

### 9.2 API 错误处理

```typescript
async function handleTaskUpdate(taskId: string, updates: Partial<Task>) {
  try {
    const result = await taskService.updateTask(taskId, updates);
    showToast('任务更新成功', 'success');
    return result;
  } catch (error) {
    if (error.response?.status === 404) {
      showToast('任务不存在', 'error');
    } else if (error.response?.status === 409) {
      showToast('任务状态冲突', 'error');
    } else {
      showToast('更新失败，请重试', 'error');
    }
    throw error;
  }
}
```

---

## 十、测试策略

### 10.1 单元测试

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = { id: '1', title: 'Test Task', /* ... */ };
    render(<TaskCard task={task} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    const task = { id: '1', title: 'Test Task', /* ... */ };
    render(<TaskCard task={task} onClick={onClick} />);
    
    fireEvent.click(screen.getByRole('button', { name: /test task/i }));
    expect(onClick).toHaveBeenCalledWith(task);
  });
});
```

---

*文档版本：v1.0*
*最后更新：2026-04-12*
