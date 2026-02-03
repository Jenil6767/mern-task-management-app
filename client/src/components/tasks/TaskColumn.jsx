import { useDroppable } from '@dnd-kit/core';
import { TASK_STATUS } from '../../utils/constants';

const TaskColumn = ({ status, tasks, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  const statusLabels = {
    [TASK_STATUS.TODO]: 'To Do',
    [TASK_STATUS.IN_PROGRESS]: 'In Progress',
    [TASK_STATUS.DONE]: 'Done',
  };

  const statusColors = {
    [TASK_STATUS.TODO]: 'bg-gray-100',
    [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100',
    [TASK_STATUS.DONE]: 'bg-green-100',
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] rounded-lg p-2 transition-colors ${
        isOver ? 'bg-blue-50' : ''
      }`}
    >
      <div
        className={`${statusColors[status]} rounded-lg p-4 mb-4`}
      >
        <h3 className="font-semibold text-gray-800 mb-2">
          {statusLabels[status]} ({tasks.length})
        </h3>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {children}
        {tasks.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8 bg-gray-50 rounded-lg">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;

