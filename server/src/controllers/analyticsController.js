import { getAnalytics } from '../services/analyticsService.js';
import { ApiError } from '../utils/helpers.js';

export const getAnalyticsController = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const numericProjectId = projectId ? Number(projectId) : undefined;
    if (projectId && Number.isNaN(numericProjectId)) {
      throw new ApiError(400, 'Invalid projectId');
    }
    const data = await getAnalytics({
      organizationId: req.organizationId,
      projectId: numericProjectId,
    });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};



