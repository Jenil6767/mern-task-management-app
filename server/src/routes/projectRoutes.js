import express from 'express';
import * as projectController from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validate } from '../middleware/validation.js';
import { createProjectValidator, assignProjectUsersValidator } from '../utils/validators.js';

const router = express.Router();

router.use(authMiddleware, tenantIsolation);

router.post('/', requireAdmin, validate(createProjectValidator), projectController.createProjectController);
router.get('/', projectController.listProjectsController);
router.get('/:id', projectController.getProjectController);
router.put('/:id', requireAdmin, projectController.updateProjectController);
router.post('/:id/assign', requireAdmin, validate(assignProjectUsersValidator), projectController.assignProjectUsersController);
router.delete('/:id', requireAdmin, projectController.deleteProjectController);

// Task Listing for specific project
import * as taskController from '../controllers/taskController.js';
import { taskListQueryValidator } from '../utils/validators.js';
router.get('/:projectId/tasks', validate(taskListQueryValidator), taskController.listTasks);

export default router;
