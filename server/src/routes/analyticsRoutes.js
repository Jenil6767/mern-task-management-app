import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { getAnalyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', getAnalyticsController);

export default router;



