import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { TASK_PRIORITY } from '../../utils/constants';

const TaskFilters = ({
  assignees = [],
  onFilterChange,
  currentFilters
}) => {
  const [search, setSearch] = useState(currentFilters.search || '');
  const [assignedTo, setAssignedTo] = useState(currentFilters.assignedTo || '');
  const [priority, setPriority] = useState(currentFilters.priority || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, assignedTo, priority });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, assignedTo, priority]);

  const handleClear = () => {
    setSearch('');
    setAssignedTo('');
    setPriority('');
    onFilterChange({ search: '', assignedTo: '', priority: '' });
  };

  const hasActiveFilters = search || assignedTo || priority;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            type="text"
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Assignees</option>
          {assignees.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {Object.values(TASK_PRIORITY).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              variant="secondary"
              onClick={handleClear}
              className="whitespace-nowrap"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;

