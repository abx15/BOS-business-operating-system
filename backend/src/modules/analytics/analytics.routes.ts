import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { planMiddleware, requirePlan } from '../../middlewares/plan.middleware';

const router = Router();

router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware, planMiddleware);

// Available on both plans
router.get('/revenue/monthly', analyticsController.getMonthlyRevenue);
router.get('/revenue/comparison', analyticsController.getRevenueComparison);

// PRO plan only
router.get('/products/top', requirePlan('PRO'), analyticsController.getTopProducts);
router.get('/payments/breakdown', requirePlan('PRO'), analyticsController.getPaymentBreakdown);
router.get('/attendance/summary', requirePlan('PRO'), analyticsController.getAttendanceSummary);

export default router;
