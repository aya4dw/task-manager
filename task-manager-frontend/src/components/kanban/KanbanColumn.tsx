import React from 'react';
import { clsx } from 'clsx';
import { Task } from '../../types/task';
import { ColumnConfig } from '../../types/task';
import { TaskCard } from './TaskCard';
import { Clock, Loader, Eye, CheckCircle, Archive } from 'lucide-react';

interface KanbanColumnProps {
  column: ColumnConfig;
  tasks: Task[];
  isOverDropZone?: boolean;
  onTaskClick: (task: Task) => void;
  onTaskDelete?: (task: Task, event: React.MouseEvent) => void;
  onDragStart: (event: React.DragEvent, task: Task) => void;
  onDragEnter: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

const iconMap = {
  Clock,
  Loader,
  Eye,
  CheckCircle,
  Archive,
};

export function KanbanColumn({
  column,
  tasks,
  isOverDropZone,
  onTaskClick,
  onTaskDelete,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: KanbanColumnProps) {
  const ColumnIcon = iconMap[column.icon as keyof typeof iconMap] || Clock;

  return (
    <div
      className={clsx(
        'flex flex-col bg-gray-50 rounded-lg min-w-[280px] max-w-[320px]',
        isOverDropZone && 'ring-2 ring-primary-500 bg-primary-50'
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Column Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ColumnIcon className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无任务
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onDragStart={onDragStart}
              onDelete={onTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
