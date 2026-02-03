import { body, param, query } from 'express-validator';
import { TASK_PRIORITY, TASK_STATUS } from './constants.js';

export const registerValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const createProjectValidator = [
  body('name').notEmpty().withMessage('Project name is required'),
  body('description').optional().isString(),
];

export const assignProjectUsersValidator = [
  param('id').isInt().toInt(),
  body('userIds').isArray({ min: 1 }).withMessage('userIds must be a non-empty array'),
  body('userIds.*').isInt().withMessage('userIds must be integers'),
];

export const createTaskValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('projectId').isInt().withMessage('projectId is required'),
  body('assignedTo').optional().isInt(),
  body('priority').optional().isIn(Object.values(TASK_PRIORITY)),
  body('dueDate').optional().isISO8601().toDate(),
];

export const updateTaskValidator = [
  param('id').isInt().toInt(),
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('status').optional().isIn(Object.values(TASK_STATUS)),
  body('priority').optional().isIn(Object.values(TASK_PRIORITY)),
  body('assignedTo').optional().isInt(),
  body('dueDate').optional().isISO8601().toDate(),
];

export const statusUpdateValidator = [
  param('id').isInt().toInt(),
  body('status').isIn(Object.values(TASK_STATUS)),
  body('version').isInt().withMessage('version is required for optimistic locking'),
];

export const taskListQueryValidator = [
  param('projectId').isInt().toInt(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(Object.values(TASK_STATUS)),
  query('assignedTo').optional().isInt().toInt(),
  query('priority').optional().isIn(Object.values(TASK_PRIORITY)),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['createdAt', 'dueDate']),
  query('order').optional().isIn(['asc', 'desc']),
];



