import express from 'express';
import * as taskController from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { validate } from '../middleware/validation.js';
import {
    createTaskValidator,
    updateTaskValidator,
    statusUpdateValidator,
    taskListQueryValidator,
} from '../utils/validators.js';

const router = express.Router();

router.use(authMiddleware, tenantIsolation);

// Note: projectId is passed in body for creation
router.post('/', validate(createTaskValidator), taskController.createTask);

router.get('/:id', taskController.getTask);
router.put('/:id', validate(updateTaskValidator), taskController.updateTask);
router.patch('/:id/status', validate(statusUpdateValidator), taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

export default router;
