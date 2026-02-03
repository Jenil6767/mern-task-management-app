import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/projects/${project.id}/tasks`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer border border-gray-100 group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
          {project.name}
        </h3>
        {project.overdueCount > 0 && (
          <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100 animate-pulse">
            {project.overdueCount} overdue
          </span>
        )}
      </div>

      {project.description && (
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 md:line-clamp-3 font-medium flex-1">
          {project.description}
        </p>
      )}

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-700">{project.taskCount || 0} <span className="text-gray-400 font-medium">Tasks</span></span>
        </div>
        <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Board <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;

