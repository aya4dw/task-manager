import { useState } from 'react';
import { Task, TaskStatus } from '../types/task';

// Mock tasks for demo
const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    title: '实现用户登录功能',
    description: '实现用户登录、注册、密码重置功能，使用 JWT 进行认证',
    priority: 'high',
    tags: ['auth', 'backend'],
    status: 'in_progress',
    assigneeId: 'agent-001',
    assigneeName: 'Agent-A',
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-04-11T10:00:00Z',
    createdBy: 'user-001',
    history: [],
  },
  {
    id: 'task-002',
    title: '设计首页 UI',
    description: '设计任务管理系统首页，包括看板、统计图表等',
    priority: 'medium',
    tags: ['ui', 'design'],
    status: 'todo',
    assigneeName: 'Agent-B',
    dueDate: '2026-04-15T00:00:00Z',
    createdAt: '2026-04-11T09:00:00Z',
    updatedAt: '2026-04-11T09:00:00Z',
    createdBy: 'user-001',
    history: [],
  },
  {
    id: 'task-003',
    title: '修复登录页面 Bug',
    description: '修复登录页面在移动端显示异常的问题',
    priority: 'urgent',
    tags: ['bug', 'fix'],
    status: 'review',
    assigneeName: 'Agent-C',
    createdAt: '2026-04-09T14:00:00Z',
    updatedAt: '2026-04-12T08:00:00Z',
    createdBy: 'user-001',
    history: [],
  },
  {
    id: 'task-004',
    title: '编写单元测试',
    description: '为核心业务逻辑编写单元测试，覆盖率达到 80%',
    priority: 'low',
    tags: ['test', 'qa'],
    status: 'completed',
    assigneeName: 'Agent-D',
    dueDate: '2026-04-08T00:00:00Z',
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-04-08T16:00:00Z',
    createdBy: 'user-001',
    history: [],
  },
];

// Statistics component
function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

export function Dashboard() {
  const tasks = MOCK_TASKS;

  // Calculate statistics
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">任务管理系统 - 仪表盘</h1>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="总任务数" value={stats.total} color="text-gray-900" />
        <StatCard title="待处理" value={stats.todo} color="text-gray-600" />
        <StatCard title="进行中" value={stats.inProgress} color="text-blue-600" />
        <StatCard title="已完成" value={stats.completed} color="text-green-600" />
      </div>

      {/* Urgent Tasks */}
      {stats.urgent > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">紧急任务</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            {tasks.filter(t => t.priority === 'urgent').map(task => (
              <div key={task.id} className="flex justify-between items-center mb-2 last:mb-0">
                <span className="text-red-800">{task.title}</span>
                <span className="text-xs text-red-600">{task.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">最近任务</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">优先级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">负责人</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.slice(0, 5).map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.assigneeName || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
