import express from 'express';
import rateLimit from 'express-rate-limit';
import { registerController, loginController, meController } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { registerValidator, loginValidator } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});

router.post('/register', validate(registerValidator), registerController);
router.post('/login', loginLimiter, validate(loginValidator), loginController);
router.get('/me', authMiddleware, meController);

export default router;


