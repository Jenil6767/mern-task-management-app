import { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { TASK_PRIORITY } from '../../utils/constants';

const TaskFilters = ({ 
  assignees = [], 
  onFilterChange, 
  currentFilters 
}) => {
  const [search, setSearch] = useState(currentFilters.search || '');
  const [assignee, setAssignee] = useState(currentFilters.assignee || '');
  const [priority, setPriority] = useState(currentFilters.priority || '');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, assignee, priority });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, assignee, priority]);

  const handleClear = () => {
    setSearch('');
    setAssignee('');
    setPriority('');
    onFilterChange({ search: '', assignee: '', priority: '' });
  };

  const hasActiveFilters = search || assignee || priority;

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
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Assignees</option>
          {assignees.map((user) => (
            <option key={user.id || user._id || user.email || user.name} value={user.name || user.email}>
              {user.name || user.email}
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

