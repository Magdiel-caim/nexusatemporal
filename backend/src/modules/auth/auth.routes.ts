import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout,
  getMe,
  getUsers,
} from './auth.controller';
import { authenticate } from '@/shared/middleware/auth.middleware';
import { authRateLimiter } from '@/shared/middleware/rate-limiter';

const router = Router();

// Public routes
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);
router.post('/request-password-reset', authRateLimiter, requestPasswordReset);
router.post('/reset-password/:token', authRateLimiter, resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, getUsers);

export default router;
