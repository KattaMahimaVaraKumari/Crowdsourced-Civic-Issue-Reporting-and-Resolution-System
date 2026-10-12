import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listNotifications, markAllRead, markRead } from '../controllers/notification.controller.js';
const router = Router();
router.use(authenticate);
router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
export default router;
