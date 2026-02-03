import express from 'express';
import * as activityController from '../controllers/activityController.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';

const router = express.Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', activityController.getActivityLogs);

export default router;
