import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, refreshSchema } from './auth.schema';
import rateLimit from 'express-rate-limit';

const router = Router();

// Strict rate limit on login — 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// POST /api/auth/refresh
router.post('/refresh', validate(refreshSchema), authController.refresh);

// POST /api/auth/logout  (requires valid access token)
router.post('/logout', authMiddleware, authController.logout);

export default router;
