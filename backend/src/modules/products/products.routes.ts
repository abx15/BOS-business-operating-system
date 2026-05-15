import { Router } from 'express';
import { productsController } from './products.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { planMiddleware } from '../../middlewares/plan.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
} from './products.schema';

const router = Router();

// All routes: JWT + COMPANY_ADMIN role + tenant isolation + plan check
router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware, planMiddleware);

// Special routes first (before /:id)
router.get('/low-stock', productsController.getLowStock);
router.get('/categories', productsController.getCategories);

// CRUD
router.get('/', productsController.getAll);
router.post('/', validate(createProductSchema), productsController.create);
router.get('/:id', productsController.getById);
router.put('/:id', validate(updateProductSchema), productsController.update);
router.delete('/:id', productsController.delete);

// Stock management
router.patch('/:id/stock', validate(updateStockSchema), productsController.updateStock);

export default router;
