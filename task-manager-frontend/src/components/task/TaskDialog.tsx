import React from 'react';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { CreateTaskData } from '../../types/task';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateTaskData) => Promise<void>;
}

export function TaskDialog({
  isOpen,
  onClose,
  onCreate,
}: TaskDialogProps) {
  const handleSubmit = async (data: CreateTaskData) => {
    try {
      await onCreate(data);
      onClose();
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="新建任务"
      size="lg"
    >
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
