import React, { useState, useEffect } from 'react';
import { Task, CreateTaskData, TaskPriority } from '../../types/task';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/api';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskData) => Promise<void>;
  onCancel: () => void;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  skills: string[];
  status: string;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
];

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    status: 'todo',
    assigneeId: undefined,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Load employees from API
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/company/employees`);
        if (response.data.success) {
          setEmployees(response.data.data.employees || []);
        }
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, []);

  // Load task data for edit mode
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        tags: task.tags,
        status: task.status,
        assigneeId: task.assigneeId,
        templateId: task.templateId,
        metadata: task.metadata,
      });
    }
  }, [task]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入任务标题';
    } else if (formData.title.length > 200) {
      newErrors.title = '标题不能超过 200 个字符';
    }

    if (!formData.assigneeId) {
      newErrors.assigneeId = '请指派员工';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Create employee options for select
  const employeeOptions = [
    { value: '', label: '未指派' },
    ...employees.map(emp => ({
      value: emp.id,
      label: `${emp.name} (${emp.department} - ${emp.role})`
    }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <Input
        label="标题 *"
        value={formData.title}
        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder="输入任务标题"
        maxLength={200}
        error={errors.title}
        autoFocus
      />

      {/* Description */}
      <TextArea
        label="描述"
        value={formData.description}
        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
        placeholder="输入任务描述（支持 Markdown）"
        rows={4}
      />

      {/* Priority */}
      <Select
        label="优先级"
        value={formData.priority}
        onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
        options={PRIORITY_OPTIONS}
      />

      {/* Assignee */}
      <Select
        label="指派员工 *"
        value={formData.assigneeId || ''}
        onChange={e => setFormData(prev => ({ ...prev, assigneeId: e.target.value || undefined }))}
        options={employeeOptions}
        placeholder="选择指派员工"
        error={errors.assigneeId}
      />

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入标签后按回车"
          />
          <Button type="button" variant="secondary" onClick={handleAddTag}>
            添加
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" loading={submitting}>
          {task ? '更新' : '创建'}
        </Button>
      </div>
    </form>
  );
}
