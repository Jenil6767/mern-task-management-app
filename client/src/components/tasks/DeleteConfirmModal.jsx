import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const DeleteConfirmModal = ({ isOpen, onClose, task, onConfirm, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task" size="sm">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete the task <strong>"{task?.title}"</strong>?
        </p>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;

