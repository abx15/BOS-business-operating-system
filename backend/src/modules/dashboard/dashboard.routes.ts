import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware);

router.get('/stats', dashboardController.getStats);
router.get('/graph', dashboardController.getSalesGraph);

export default router;
