import React from 'react';
import { clsx } from 'clsx';
import { Task } from '../../types/task';
import { Badge } from '../ui/Badge';
import { Clock, AlertCircle, AlertTriangle, AlertOctagon, Calendar, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick: (task: Task) => void;
  onDragStart: (event: React.DragEvent, task: Task) => void;
  onDelete?: (task: Task, event: React.MouseEvent) => void;
}

const priorityConfig = {
  low: { color: 'border-green-400', label: '低', icon: Clock },
  medium: { color: 'border-yellow-400', label: '中', icon: AlertTriangle },
  high: { color: 'border-orange-400', label: '高', icon: AlertCircle },
  urgent: { color: 'border-red-400', label: '紧急', icon: AlertOctagon },
};

const priorityBadgeVariant = {
  low: 'priority-low',
  medium: 'priority-medium',
  high: 'priority-high',
  urgent: 'priority-urgent',
} as const;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const isPast = date < today;

  if (isToday) return '今天';
  if (isTomorrow) return '明天';
  if (isPast) return '已过期';

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export function TaskCard({ task, isDragging, onClick, onDragStart, onDelete }: TaskCardProps) {
  const priorityInfo = priorityConfig[task.priority];
  const PriorityIcon = priorityInfo.icon;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // 防止触发卡片点击
    if (confirm(`确定要删除任务 "${task.title}" 吗？`)) {
      onDelete?.(task, event);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick(task)}
      className={clsx(
        'bg-white p-3 rounded-lg shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-shadow',
        priorityInfo.color,
        isDragging && 'opacity-50 rotate-2'
      )}
    >
      {/* Header: Priority + Title */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 flex-1 pr-2">
          {task.title}
        </h4>
        <Badge 
          label={priorityInfo.label} 
          variant={priorityBadgeVariant[task.priority]}
        />
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map(tag => (
            <Badge key={tag} label={tag} variant="default" />
          ))}
        </div>
      )}

      {/* Footer: Assignee + Delete Button */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <div className="flex items-center gap-2">
          {task.assigneeName && (
            <span className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-medium">
                {task.assigneeName.charAt(0)}
              </div>
              {task.assigneeName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
          {/* Delete Button - in corner, requires confirmation */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded p-1 transition-colors"
              title="删除任务 (需确认)"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
