import { Router } from 'express';
import { leaderboard, login, logout, me, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const authLimitVal = Number(process.env.AUTH_RATE_LIMIT) || (process.env.NODE_ENV === 'test' ? 50000 : 30);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: authLimitVal, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Too many authentication attempts. Please try again later.' } });
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.get('/leaderboard', authenticate, leaderboard);
export default router;
