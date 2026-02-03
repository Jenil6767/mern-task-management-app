import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateRequired, validateFutureDate } from '../../utils/validation';
import { TASK_PRIORITY } from '../../utils/constants';
import { toast } from 'react-hot-toast';

const TaskFormModal = ({ isOpen, onClose, task, projectId, users = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: '',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        priority: task.priority || TASK_PRIORITY.MEDIUM,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: '',
        dueDate: '',
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateRequired(formData.title)) {
      newErrors.title = 'Title is required';
    }

    if (!validateRequired(formData.priority)) {
      newErrors.priority = 'Priority is required';
    }

    if (!validateRequired(formData.dueDate)) {
      newErrors.dueDate = 'Due date is required';
    } else if (!validateFutureDate(formData.dueDate)) {
      newErrors.dueDate = 'Due date must be today or in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        projectId,
      };

      if (task) {
        await api.put(`/tasks/${task.id}`, {
          ...payload,
          version: task.version
        });
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created successfully');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save task';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Title</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            error={errors.title}
            className="input-field"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add some details..."
            rows="3"
            className="input-field min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Assign To
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700 ml-1">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`input-field ${errors.priority ? 'border-red-500' : ''}`}
            >
              <option value="">Select Priority</option>
              {Object.values(TASK_PRIORITY).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-red-500 text-xs mt-1 font-bold">{errors.priority}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Due Date</label>
          <Input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            className="input-field"
          />
        </div>

        <div className="flex gap-3 justify-end pt-6 border-t border-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <Button
            type="submit"
            loading={loading}
            className="btn-primary px-8 shadow-blue-500/20"
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;

