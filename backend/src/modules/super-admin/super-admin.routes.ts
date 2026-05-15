import { Router } from 'express';
import companyRoutes from './company/company.routes';

const router = Router();

// Aggregate all super-admin modules
router.use('/companies', companyRoutes);

export default router;
