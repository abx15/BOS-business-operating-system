import { Router } from 'express';
import { companyController } from './company.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { requireRole } from '../../../middlewares/role.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import {
  createCompanySchema,
  updateCompanySchema,
  setPlanSchema,
  createAdminSchema,
} from './company.schema';

const router = Router();

// All routes require: valid JWT + SUPER_ADMIN role
router.use(authMiddleware, requireRole('SUPER_ADMIN'));

// Company CRUD
router.get('/', companyController.getAll);
router.post('/', validate(createCompanySchema), companyController.create);
router.get('/analytics', companyController.getPlatformAnalytics);
router.get('/:id', companyController.getById);
router.put('/:id', validate(updateCompanySchema), companyController.update);
router.delete('/:id', companyController.delete);

// Company actions
router.patch('/:id/suspend', companyController.suspend);
router.patch('/:id/activate', companyController.activate);
router.patch('/:id/verify', companyController.toggleVerify);
router.patch('/:id/plan', validate(setPlanSchema), companyController.setPlan);

// Create Company Admin login
router.post('/:id/admin', validate(createAdminSchema), companyController.createAdmin);

export default router;
