import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../services/api';
import { TASK_STATUS, TASKS_PER_PAGE } from '../../utils/constants';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskFormModal from './TaskFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import TaskFilters from './TaskFilters';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ErrorMessage from '../common/ErrorMessage';
import { toast } from 'react-hot-toast';

// Draggable Task Card Component
const DraggableTaskCard = ({ task, isPending, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      status: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        isPending={isPending}
      />
    </div>
  );
};

const TaskBoard = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState({
    [TASK_STATUS.TODO]: [],
    [TASK_STATUS.IN_PROGRESS]: [],
    [TASK_STATUS.DONE]: [],
  });
  const [pendingTasks, setPendingTasks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    assignee: '',
    priority: '',
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [projectId, page, filters.search, filters.assignee, filters.priority]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (e) {
      // Not fatal for board; assignee dropdown will be empty
      setUsers([]);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: TASKS_PER_PAGE,
        ...filters,
      };

      const response = await api.get(`/projects/${projectId}/tasks`, { params });
      const fetchedTasks = response.data.tasks || response.data || [];
      const total = response.data.total || fetchedTasks.length;

      // Group tasks by status
      const grouped = {
        [TASK_STATUS.TODO]: [],
        [TASK_STATUS.IN_PROGRESS]: [],
        [TASK_STATUS.DONE]: [],
      };

      fetchedTasks.forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });

      if (page === 1) {
        setTasks(grouped);
      } else {
        // Append for pagination
        setTasks((prev) => ({
          [TASK_STATUS.TODO]: [...prev[TASK_STATUS.TODO], ...grouped[TASK_STATUS.TODO]],
          [TASK_STATUS.IN_PROGRESS]: [...prev[TASK_STATUS.IN_PROGRESS], ...grouped[TASK_STATUS.IN_PROGRESS]],
          [TASK_STATUS.DONE]: [...prev[TASK_STATUS.DONE], ...grouped[TASK_STATUS.DONE]],
        }));
      }

      setHasMore(page * TASKS_PER_PAGE < total);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load tasks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const oldStatus = active.data.current.status;
    const overType = over.data.current?.type;
    const newStatus = overType === 'column' ? over.id : over.data.current?.status;

    // Moving between columns
    if (newStatus && oldStatus !== newStatus) {

      // Find the task
      const taskToMove = tasks[oldStatus].find((t) => t.id === taskId);
      if (!taskToMove) return;

      // OPTIMISTIC UPDATE - Immediate UI change
      const backup = {
        [TASK_STATUS.TODO]: [...tasks[TASK_STATUS.TODO]],
        [TASK_STATUS.IN_PROGRESS]: [...tasks[TASK_STATUS.IN_PROGRESS]],
        [TASK_STATUS.DONE]: [...tasks[TASK_STATUS.DONE]],
      };

      setTasks({
        ...tasks,
        [oldStatus]: tasks[oldStatus].filter((t) => t.id !== taskId),
        [newStatus]: [...tasks[newStatus], { ...taskToMove, status: newStatus }],
      });
      setPendingTasks((prev) => new Set(prev).add(taskId));

      try {
        // API call in background
        await api.patch(`/tasks/${taskId}`, { status: newStatus });
        setPendingTasks((prev) => {
          const s = new Set(prev);
          s.delete(taskId);
          return s;
        });
        toast.success('Task updated successfully');
      } catch (error) {
        // ROLLBACK on failure
        setTasks(backup);
        setPendingTasks((prev) => {
          const s = new Set(prev);
          s.delete(taskId);
          return s;
        });
        const errorMessage = error.response?.data?.message || 'Update failed. Please try again.';
        toast.error(errorMessage);
      }
      return;
    }

    // Reordering within same column (optional)
    if (overType === 'task' && oldStatus === newStatus) {
      const oldIndex = tasks[oldStatus].findIndex((t) => t.id === taskId);
      const newIndex = tasks[oldStatus].findIndex((t) => t.id === over.id);
      if (oldIndex !== newIndex) {
        setTasks({
          ...tasks,
          [oldStatus]: arrayMove(tasks[oldStatus], oldIndex, newIndex),
        });
      }
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = (task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask?.id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/tasks/${selectedTask.id}`);
      setTasks({
        [TASK_STATUS.TODO]: tasks[TASK_STATUS.TODO].filter((t) => t.id !== selectedTask.id),
        [TASK_STATUS.IN_PROGRESS]: tasks[TASK_STATUS.IN_PROGRESS].filter((t) => t.id !== selectedTask.id),
        [TASK_STATUS.DONE]: tasks[TASK_STATUS.DONE].filter((t) => t.id !== selectedTask.id),
      });
      toast.success('Task deleted successfully');
      setShowDeleteModal(false);
      setSelectedTask(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTaskSaved = () => {
    setPage(1);
    fetchTasks();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    const allTasks = [
      ...tasks[TASK_STATUS.TODO],
      ...tasks[TASK_STATUS.IN_PROGRESS],
      ...tasks[TASK_STATUS.DONE],
    ];
    return allTasks.find((t) => t.id === activeId);
  }, [activeId, tasks]);

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Task Board</h1>
        <Button variant="primary" onClick={handleCreateTask}>
          Create Task
        </Button>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <TaskFilters
        assignees={users}
        onFilterChange={handleFilterChange}
        currentFilters={filters}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.values(TASK_STATUS).map((status) => (
            <SortableContext
              key={status}
              id={status}
              items={tasks[status].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <TaskColumn
                status={status}
                tasks={tasks[status]}
              >
                {tasks[status].map((task) => (
                  <DraggableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task)}
                    isPending={pendingTasks.has(task.id)}
                  />
                ))}
              </TaskColumn>
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      <TaskFormModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        projectId={projectId}
        users={users}
        onSuccess={handleTaskSaved}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default TaskBoard;

