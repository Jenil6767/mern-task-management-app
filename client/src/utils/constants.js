export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
};

export const TASK_PRIORITY = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITY.HIGH]: 'bg-red-100 text-red-800',
  [TASK_PRIORITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TASK_PRIORITY.LOW]: 'bg-green-100 text-green-800',
};

export const STATUS_COLORS = {
  [TASK_STATUS.TODO]: 'bg-gray-100',
  [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100',
  [TASK_STATUS.DONE]: 'bg-green-100',
};

export const TASKS_PER_PAGE = 20;

