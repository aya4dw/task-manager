import React, { useMemo } from 'react';
import { Task, TaskStatus, ColumnConfig } from '../../types/task';
import { KanbanColumn } from './KanbanColumn';
import { useDragDrop } from '../../hooks/useDragDrop';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

// Column configuration
const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    title: '待处理',
    status: 'todo',
    color: 'bg-gray-100',
    icon: 'Clock',
  },
  {
    id: 'in_progress',
    title: '进行中',
    status: 'in_progress',
    color: 'bg-blue-100',
    icon: 'Loader',
  },
  {
    id: 'review',
    title: '待审核',
    status: 'review',
    color: 'bg-yellow-100',
    icon: 'Eye',
  },
  {
    id: 'completed',
    title: '已完成',
    status: 'completed',
    color: 'bg-green-100',
    icon: 'CheckCircle',
  },
];

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, fromColumn: string, toColumn: string) => Promise<void>;
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  onTaskDelete?: (task: Task, event: React.MouseEvent) => void;
}

export function KanbanBoard({
  tasks,
  onTaskMove,
  onTaskClick,
  onCreateTask,
  onTaskDelete,
}: KanbanBoardProps) {
  // Use drag and drop hook
  const {
    activeTask,
    overColumn,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  } = useDragDrop(onTaskMove);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    for (const column of COLUMNS) {
      grouped[column.id] = tasks.filter(task => task.status === column.status);
    }
    return grouped;
  }, [tasks]);

  // Handle column click to create task
  const handleCreateTask = (columnId: string) => {
    onCreateTask();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold text-gray-900">任务看板</h2>
        <Button onClick={onCreateTask}>
          <Plus className="w-4 h-4 mr-1" />
          新建任务
        </Button>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-4 h-full">
          {COLUMNS.map(column => {
            const columnTasks = tasksByColumn[column.id] || [];
            
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                isOverDropZone={overColumn === column.id}
                onTaskClick={onTaskClick}
                onTaskDelete={onTaskDelete}
                onDragStart={onDragStart}
                onDragEnter={(e) => onDragEnter(e, column.id)}
                onDragLeave={onDragLeave}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, column.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
