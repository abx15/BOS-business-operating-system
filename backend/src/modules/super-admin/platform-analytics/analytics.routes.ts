import { Router } from 'express';
import { platformAnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { requireRole } from '../../../middlewares/role.middleware';

const router = Router();

// Only super admin can access platform-wide analytics
router.use(authMiddleware, requireRole('SUPER_ADMIN'));

router.get('/stats', platformAnalyticsController.getGeneralStats);
router.get('/growth', platformAnalyticsController.getGrowthStats);
router.get('/plans', platformAnalyticsController.getPlanBreakdown);

export default router;
