import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import Spinner from '../common/Spinner';
import ErrorMessage from '../common/ErrorMessage';
import Button from '../common/Button';
import { toast } from 'react-hot-toast';

const ProjectList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Organization <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage all your organizational initiatives here.</p>
        </div>

        {user?.role === 'Admin' && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary shadow-blue-500/20"
          >
            + Create New Project
          </Button>
        )}
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No projects found</p>
          {user?.role === 'Admin' && (
            <p className="text-gray-400 text-sm mt-2">Create your first project to get started</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectList;

