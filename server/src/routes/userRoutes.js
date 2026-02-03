import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';

const router = express.Router();

router.use(authMiddleware, tenantIsolation);

router.get('/', userController.listUsers);

export default router;
