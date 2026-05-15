import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware);

router.post('/', attendanceController.mark);
router.get('/', attendanceController.getMonthly);
router.get('/staff/:staffId', attendanceController.getByStaff);

export default router;
