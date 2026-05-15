import { Router } from 'express';
import companyRoutes from './company/company.routes';
import analyticsRoutes from './platform-analytics/analytics.routes';

const router = Router();

// Aggregate all super-admin modules
router.use('/companies', companyRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
