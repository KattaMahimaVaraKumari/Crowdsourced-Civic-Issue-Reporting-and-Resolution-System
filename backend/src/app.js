import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import issueRoutes from './routes/issue.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import path from 'path';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin is not allowed by CORS.')); }, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve('uploads')));
const apiRateLimit = Number(process.env.RATE_LIMIT) || (process.env.NODE_ENV === 'test' ? 50000 : 240);
app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: apiRateLimit, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ success: true, service: 'CivicTrack API', status: 'healthy', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
