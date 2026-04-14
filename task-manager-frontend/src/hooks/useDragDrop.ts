import { useState, useCallback } from 'react';
import type { Task } from '../types/task';

interface DragDropState {
  activeTask: Task | null;
  overColumn: string | null;
  overIndex: number | null;
}

interface UseDragDropReturn {
  activeTask: Task | null;
  overColumn: string | null;
  onDragStart: (event: any, task: Task) => void;
  onDragEnter: (event: any, columnId: string, index?: number) => void;
  onDragLeave: (event: any) => void;
  onDragOver: (event: any) => void;
  onDrop: (event: any, toColumn: string) => void;
  reset: () => void;
}

export function useDragDrop(
  onTaskDrop: (taskId: string, fromColumn: string, toColumn: string) => void
): UseDragDropReturn {
  const [state, setState] = useState<DragDropState>({
    activeTask: null,
    overColumn: null,
    overIndex: null,
  });

  const onDragStart = useCallback((event: any, task: Task) => {
    setState(prev => ({ ...prev, activeTask: task }));
    event.dataTransfer.effectAllowed = 'move';
    // Set drag image if needed
    event.dataTransfer.setData('text/plain', task.id);
  }, []);

  const onDragEnter = useCallback((event: any, columnId: string, index: number = 0) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setState(prev => ({ ...prev, overColumn: columnId, overIndex: index }));
  }, []);

  const onDragLeave = useCallback((event: any) => {
    event.preventDefault();
    setState(prev => ({ ...prev, overColumn: null, overIndex: null }));
  }, []);

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: any, toColumn: string) => {
    event.preventDefault();
    
    if (state.activeTask) {
      const fromColumn = state.activeTask.status;
      onTaskDrop(state.activeTask.id, fromColumn, toColumn);
      
      // Reset state
      setState({
        activeTask: null,
        overColumn: null,
        overIndex: null,
      });
    }
  }, [state.activeTask, onTaskDrop]);

  const reset = useCallback(() => {
    setState({
      activeTask: null,
      overColumn: null,
      overIndex: null,
    });
  }, []);

  return {
    activeTask: state.activeTask,
    overColumn: state.overColumn,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    reset,
  };
}
