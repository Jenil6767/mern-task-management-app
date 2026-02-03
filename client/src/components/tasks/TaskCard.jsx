import { PRIORITY_COLORS } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/dateFormat';

const TaskCard = ({ task, onEdit = () => {}, onDelete = () => {}, isPending = false }) => {
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 mb-3 border-l-4 ${
        overdue ? 'border-red-500' : 'border-blue-500'
      } ${isPending ? 'opacity-50' : ''} hover:shadow-md transition-shadow relative`}
    >
      {isPending && (
        <div className="absolute top-2 right-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-800 text-sm flex-1">{task.title}</h4>
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {task.assignedTo}
            </span>
          )}
          {task.priority && (
            <span className={`text-xs px-2 py-1 rounded ${PRIORITY_COLORS[task.priority] || 'bg-gray-100'}`}>
              {task.priority}
            </span>
          )}
        </div>
        {task.dueDate && (
          <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

