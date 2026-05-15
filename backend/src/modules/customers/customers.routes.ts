import { Router } from 'express';
import { customersController } from './customers.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware);

router.get('/', customersController.getAll);
router.post('/', customersController.create);
router.get('/:id', customersController.getById);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.delete);
router.get('/:id/history', customersController.getPurchaseHistory);

export default router;
