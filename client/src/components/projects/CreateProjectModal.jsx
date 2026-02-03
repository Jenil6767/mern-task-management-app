import React, { useState } from 'react';
import api from '../../services/api';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { validateRequired } from '../../utils/validation';
import { toast } from 'react-hot-toast';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!validateRequired(formData.name)) {
      newErrors.name = 'Project name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/projects', formData);
      toast.success('Project created successfully');
      onSuccess(response.data);
      setFormData({ name: '', description: '' });
      setErrors({});
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Project Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Q4 Marketing Campaign"
            error={errors.name}
            className="input-field"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What is this project about?"
            rows="3"
            className="input-field min-h-[100px] resize-none"
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;

