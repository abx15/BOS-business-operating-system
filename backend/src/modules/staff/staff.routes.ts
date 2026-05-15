import { Router } from 'express';
import { staffController } from './staff.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { planMiddleware } from '../../middlewares/plan.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createStaffSchema, updateStaffSchema } from './staff.schema';

const router = Router();

// Secure all routes
router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware, planMiddleware);

router.get('/', staffController.getAll);
router.post('/', validate(createStaffSchema), staffController.create);
router.get('/:id', staffController.getById);
router.put('/:id', validate(updateStaffSchema), staffController.update);
router.delete('/:id', staffController.delete);
router.patch('/:id/verify', staffController.toggleVerify);

export default router;
