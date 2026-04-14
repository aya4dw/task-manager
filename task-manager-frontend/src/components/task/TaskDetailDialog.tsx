import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Task, TaskStatus, TaskPriority, TaskFeedback } from '../../types/task';
import { Badge } from '../ui/Badge';
import { User, Calendar, MessageSquare, Square, CheckCircle, Send, Clock } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  skills: string[];
  status: string;
}

interface TaskDetailDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStopAgent: (taskId: string) => Promise<void>;
  onAdjustTask: (taskId: string, feedback: string, assigneeId?: string) => Promise<void>;
  onAcceptTask: (taskId: string) => Promise<void>;
}

const statusConfig = {
  todo: { label: '待处理', color: 'bg-gray-100 text-gray-800' },
  in_progress: { label: '进行中', color: 'bg-blue-100 text-blue-800' },
  review: { label: '审核中', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  archived: { label: '已归档', color: 'bg-gray-100 text-gray-800' },
};

const priorityConfig = {
  low: { label: '低优先级', color: 'bg-green-100 text-green-800' },
  medium: { label: '中优先级', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: '高优先级', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: '紧急', color: 'bg-red-100 text-red-800' },
};

export function TaskDetailDialog({ 
  task, 
  isOpen, 
  onClose,
  onStopAgent,
  onAdjustTask,
  onAcceptTask
}: TaskDetailDialogProps) {
  const [adjustTaskText, setAdjustTaskText] = useState('');
  const [adjustAssigneeId, setAdjustAssigneeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/company/employees`);
        if (response.data.success) {
          setEmployees(response.data.data.employees || []);
        }
      } catch (error) {
        console.error('Failed to load employees:', error);
      }
    };
    loadEmployees();
  }, []);

  if (!task) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 处理打断任务
  const handleStopAgent = async () => {
    if (!confirm('确定要打断该任务吗？这将停止当前正在执行任务的 agent。')) {
      return;
    }
    try {
      setIsSubmitting(true);
      await onStopAgent(task.id);
      alert('已发送停止命令');
    } catch (err) {
      console.error('Stop agent failed:', err);
      alert('停止命令发送失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理调整任务
  const handleAdjustTask = async () => {
    if (!adjustTaskText.trim()) {
      alert('请输入调整内容');
      return;
    }
    if (!adjustAssigneeId) {
      alert('请选择指派员工');
      return;
    }
    try {
      setIsSubmitting(true);
      await onAdjustTask(task.id, adjustTaskText, adjustAssigneeId);
      setAdjustTaskText('');
      setAdjustAssigneeId('');
      alert('任务调整已发送');
    } catch (err) {
      console.error('Adjust task failed:', err);
      alert('任务调整发送失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理验收任务
  const handleAcceptTask = async () => {
    if (!confirm('确定验收该任务吗？')) {
      return;
    }
    try {
      setIsSubmitting(true);
      await onAcceptTask(task.id);
      onClose();
      alert('任务已验收');
    } catch (err) {
      console.error('Accept task failed:', err);
      alert('验收失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create employee options
  const employeeOptions = [
    { value: '', label: '不变更指派' },
    ...employees.map(emp => ({
      value: emp.id,
      label: `${emp.name} (${emp.department} - ${emp.role})`
    }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="任务详情" size="lg">
      <div className="space-y-6 max-h-[80vh] flex flex-col">
        {/* 任务标题 - 只读 */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
        </div>

        {/* 状态和优先级 - 只读 */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">状态:</span>
            <Badge label={statusConfig[task.status].label} variant="default" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">优先级:</span>
            <Badge label={priorityConfig[task.priority].label} variant="default" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">指派:</span>
            <Badge label={task.assigneeName || '未指派'} variant="default" />
          </div>
        </div>

        {/* 任务信息区 - 只读 */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <User className="w-4 h-4" />
              <span>发布人</span>
            </div>
            <p className="font-medium text-gray-900">{task.createdBy}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span>创建时间</span>
            </div>
            <p className="font-medium text-gray-900">{formatDate(task.createdAt)}</p>
          </div>

          {task.dueDate && (
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span>截止日期</span>
              </div>
              <p className="font-medium text-gray-900">{formatDate(task.dueDate)}</p>
            </div>
          )}
        </div>

        {/* 任务目标 - 只读 */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">任务目标</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {task.description || '暂无描述'}
          </p>
        </div>

        {/* 标签 - 只读 */}
        {task.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">标签</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map(tag => (
                <Badge key={tag} label={tag} variant="default" />
              ))}
            </div>
          </div>
        )}

        {/* 任务反馈区 - 论坛式楼层 */}
        <div className="border-t pt-4 flex-grow overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            任务反馈 ({task.feedbacks?.length || 0}条)
          </h3>
          
          <div className="space-y-4">
            {/* 楼层 1: 任务发布 */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">发布任务</span>
                  <span className="text-xs text-blue-700">{task.createdBy}</span>
                </div>
                <span className="text-xs text-blue-700">{formatDate(task.createdAt)}</span>
              </div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {task.description || '暂无详细描述'}
              </div>
            </div>

            {/* 其他楼层 */}
            {task.feedbacks && task.feedbacks.length > 0 && (
              <div className="space-y-4">
                {task.feedbacks.map((feedback, index) => (
                  <div 
                    key={feedback.id} 
                    className={`border-l-4 p-4 rounded-r ${
                      feedback.type === 'progress' 
                        ? 'bg-green-50 border-green-500' 
                        : feedback.type === 'adjust'
                        ? 'bg-orange-50 border-orange-500'
                        : feedback.type === 'help'
                        ? 'bg-yellow-50 border-yellow-500'
                        : feedback.type === 'accepted'
                        ? 'bg-purple-50 border-purple-500'
                        : 'bg-gray-50 border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {feedback.type === 'progress' && '💬 进度汇报'}
                          {feedback.type === 'adjust' && '📝 调整任务'}
                          {feedback.type === 'help' && '🆘 协助需求'}
                          {feedback.type === 'accepted' && '✅ 任务验收'}
                          {feedback.type === 'info' && 'ℹ️ 系统消息'}
                        </span>
                        <span className="text-xs text-gray-600">{feedback.author}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        #{index + 2} • {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {feedback.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮区 */}
        <div className="border-t pt-4 sticky bottom-0 bg-white">
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={handleStopAgent} 
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-1" />
              打断任务
            </Button>
            <Button 
              onClick={handleAcceptTask}
              disabled={isSubmitting}
              variant="secondary"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              验收任务
            </Button>
          </div>

          {/* 调整任务输入框 */}
          <div className="space-y-2">
            <TextArea
              value={adjustTaskText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdjustTaskText(e.target.value)}
              placeholder="调整任务：补充要求或说明..."
              className="flex-grow resize-none"
              rows={2}
            />
            <div className="flex gap-2 items-center">
              <Select
                value={adjustAssigneeId}
                onChange={e => setAdjustAssigneeId(e.target.value)}
                options={employeeOptions}
                className="flex-1"
                placeholder="* 必须选择指派员工"
              />
              <Button 
                onClick={handleAdjustTask} 
                disabled={isSubmitting || !adjustTaskText.trim() || !adjustAssigneeId}
                className="h-auto px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
