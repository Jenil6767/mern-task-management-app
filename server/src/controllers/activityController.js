import * as activityService from '../services/activityService.js';
import { asyncHandler } from '../utils/helpers.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
    const { taskId, userId, projectId } = req.query;
    const logs = await activityService.getActivityLogs({
        organizationId: req.user.organizationId,
        taskId,
        userId,
        projectId,
    });
    res.json(logs);
});
