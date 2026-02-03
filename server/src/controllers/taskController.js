import * as taskService from '../services/taskService.js';
import { asyncHandler } from '../utils/helpers.js';

export const createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.user, req.body);
    res.status(201).json(task);
});

export const listTasks = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const result = await taskService.listTasks(req.user.organizationId, projectId, req.query);
    res.json(result);
});

export const getTask = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id, req.user.organizationId);
    res.json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.user, req.params.id, req.body);
    res.json(task);
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
    const { status, version } = req.body;
    const task = await taskService.updateTaskStatusOptimistic(
        req.user,
        req.params.id,
        status,
        version,
    );
    res.json(task);
});

export const deleteTask = asyncHandler(async (req, res) => {
    await taskService.softDeleteTask(req.user, req.params.id);
    res.status(204).send();
});
