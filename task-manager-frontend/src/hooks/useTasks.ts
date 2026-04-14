import { useState, useCallback } from 'react';
import {
  getTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  moveTask as apiMoveTask,
} from '../services/taskService';
import type { Task, CreateTaskData } from '../types/task';
import type { TaskFilters } from '../types/api';

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTasks(filters);
      if (result.success && result.data?.tasks) {
        setTasks(result.data.tasks);
      } else {
        setError(new Error(result.error?.message || 'Failed to fetch tasks'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create task
  const createTask = useCallback(async (data: CreateTaskData): Promise<Task | null> => {
    try {
      const result = await apiCreateTask(data);
      if (result.success && result.data) {
        setTasks(prev => [...prev, result.data!]);
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to create task');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (
    id: string,
    updates: Partial<Task>
  ): Promise<Task | null> => {
    try {
      const result = await apiUpdateTask(id, updates);
      if (result.success && result.data) {
        setTasks(prev => prev.map(t => t.id === id ? result.data! : t));
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Failed to update task');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      const result = await apiDeleteTask(id);
      if (result.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
      } else {
        throw new Error(result.error?.message || 'Failed to delete task');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  // Move task (for drag and drop)
  const moveTask = useCallback(async (
    taskId: string,
    fromColumn: string,
    toColumn: string
  ): Promise<void> => {
    try {
      const result = await apiMoveTask(taskId, fromColumn, toColumn);
      if (result.success && result.data) {
        setTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            return { ...t, status: result.data!.status as Task['status'] };
          }
          return t;
        }));
      } else {
        throw new Error(result.error?.message || 'Failed to move task');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
