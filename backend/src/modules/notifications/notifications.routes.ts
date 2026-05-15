import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { tenantMiddleware } from '../../middlewares/tenant.middleware';

const router = Router();

router.use(authMiddleware, requireRole('COMPANY_ADMIN'), tenantMiddleware);

router.get('/', notificationsController.getAll);
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markRead);
router.delete('/:id', notificationsController.delete);

export default router;
