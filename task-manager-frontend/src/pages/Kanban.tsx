import { useState, useEffect, useCallback } from 'react';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskDialog } from '../components/task/TaskDialog';
import { TaskDetailDialog } from '../components/task/TaskDetailDialog';
import { useTasks } from '../hooks/useTasks';
import { useWebSocket } from '../hooks/useWebSocket';
import { Task, CreateTaskData } from '../types/task';
import { API_BASE_URL } from '../utils/api';

export function Kanban() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // WebSocket real-time updates
  useWebSocket((type, payload) => {
    if (type === 'task_created' || type === 'task_updated' || type === 'task_deleted') {
      fetchTasks();
    }
  });

  // Handle task move
  const handleTaskMove = useCallback(async (
    taskId: string,
    fromColumn: string,
    toColumn: string
  ) => {
    try {
      await moveTask(taskId, fromColumn, toColumn);
    } catch (err) {
      console.error('Move failed:', err);
      alert('移动任务失败');
    }
  }, [moveTask]);

  // Handle task delete
  const handleDeleteTask = useCallback(async (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await deleteTask(task.id);
      alert('任务已删除');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('删除任务失败');
    }
  }, [deleteTask]);

  // Handle task click - open detail dialog
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  // Handle task update
  const handleTaskUpdate = useCallback(async (task: Task, updates: Partial<Task>) => {
    try {
      await updateTask(task.id, updates);
    } catch (err) {
      console.error('Update failed:', err);
      alert('更新任务失败');
    }
  }, [updateTask]);

  // Handle create task
  const handleCreateTask = useCallback(async (data: CreateTaskData) => {
    try {
      await createTask(data);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Create failed:', err);
      alert('创建任务失败');
    }
  }, [createTask]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">加载失败：{error.message}</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <KanbanBoard
        tasks={tasks}
        onTaskMove={handleTaskMove}
        onTaskClick={handleTaskClick}
        onCreateTask={() => setIsDialogOpen(true)}
        onTaskDelete={handleDeleteTask}  // ← Add delete handler
      />

      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreate={handleCreateTask}
      />

      <TaskDetailDialog
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onStopAgent={async (taskId: string) => {
          try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/stop`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to stop agent');
            await fetchTasks(); // Refresh tasks
            alert('已发送停止命令');
          } catch (err) {
            console.error('Stop agent failed:', err);
            alert('停止任务失败');
          }
        }}
        onAdjustTask={async (taskId: string, feedback: string) => {
          try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/feedback`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ feedback, type: 'adjust' })
            });
            if (!response.ok) throw new Error('Failed to add feedback');
            await fetchTasks(); // Refresh to get updated feedbacks
            alert('任务调整已发送');
          } catch (err) {
            console.error('Add feedback failed:', err);
            alert('发送反馈失败');
          }
        }}
        onAcceptTask={async (taskId: string) => {
          try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/accept`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to accept task');
            await fetchTasks(); // Refresh after accept
            setSelectedTask(null);
            alert('任务已验收');
          } catch (err) {
            console.error('Accept task failed:', err);
            alert('验收任务失败');
          }
        }}
      />
    </div>
  );
}
