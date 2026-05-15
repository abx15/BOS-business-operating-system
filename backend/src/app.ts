import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './middlewares/error.middleware';
import { logger } from './utils/logger';
import { prisma } from './config/db';
import { env } from './config/env';
import { sendSuccess } from './utils/response';
import authRoutes from './modules/auth/auth.routes';
import superAdminCompanyRoutes from './modules/super-admin/company/company.routes';
import productRoutes from './modules/products/products.routes';
import invoiceRoutes from './modules/invoices/invoices.routes';
import customerRoutes from './modules/customers/customers.routes';
import staffRoutes from './modules/staff/staff.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import salaryRoutes from './modules/salary/salary.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationRoutes from './modules/notifications/notifications.routes';

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : '*',
  credentials: true,
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request');
  next();
});

// Health check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(res, { server: 'running', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super/companies', superAdminCompanyRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
