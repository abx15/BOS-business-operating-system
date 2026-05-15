import { Router } from 'express';
import { invoicesController } from './invoices.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';
import { planMiddleware } from '../../middlewares/plan.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createInvoiceSchema } from './invoices.schema';

const router = Router();

// All routes: JWT + COMPANY_ADMIN + tenant isolation + plan check
router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware, planMiddleware);

router.post('/', validate(createInvoiceSchema), invoicesController.create);
router.get('/', invoicesController.getAll);
router.get('/:id', invoicesController.getById);
router.get('/:id/pdf', invoicesController.downloadPDF);
router.patch('/:id/cancel', invoicesController.cancel);

export default router;
