import React from 'react';
import { PRIORITY_COLORS } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/dateFormat';

const TaskCard = ({ task, onEdit = () => { }, onDelete = () => { }, isPending = false }) => {
  const overdue = isOverdue(task.dueDate);

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-3 border-t-2 ${overdue ? 'border-red-500' : 'border-blue-500'
        } ${isPending ? 'opacity-50' : ''} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative shadow-sm border-x border-b border-gray-100 group`}
    >
      {isPending && (
        <div className="absolute top-2 right-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-bold text-gray-900 text-[15px] flex-1 leading-snug group-hover:text-blue-600 transition-colors">{task.title}</h4>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 font-medium leading-relaxed">{task.description}</p>
      )}

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.assigneeName && (
              <div className="flex items-center gap-1 bg-blue-50 p-1 pr-2 rounded-full border border-blue-100">
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold uppercase">
                  {task.assigneeName.charAt(0)}
                </div>
                <span className="text-[10px] font-bold text-blue-700">
                  {task.assigneeName}
                </span>
              </div>
            )}
            {task.priority && (
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>

        {task.dueDate && (
          <div className="flex items-center justify-between py-2 border-t border-gray-50">
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span className={`text-[11px] font-bold ${overdue ? 'text-red-500' : 'text-gray-500'}`}>
                {formatDate(task.dueDate)}
              </span>
            </div>
            {overdue && (
              <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Overdue</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

