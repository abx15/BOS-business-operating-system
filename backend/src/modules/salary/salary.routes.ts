import { Router } from 'express';
import { salaryController } from './salary.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware);

router.get('/', salaryController.getMonthly);
router.post('/', salaryController.create);
router.post('/generate', salaryController.generateForMonth);
router.get('/staff/:staffId', salaryController.getByStaff);
router.patch('/:id/pay', salaryController.markPaid);

export default router;
