import { Request, Response } from 'express';
import { companyService } from './company.service';
import { sendSuccess, sendError } from '../../../utils/response';

export const companyController = {

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const search = req.query.search as string | undefined;

      const result = await companyService.getAll(page, limit, search);
      sendSuccess(res, result.companies, { meta: result.meta });
    } catch {
      sendError(res, 'Failed to fetch companies', { statusCode: 500 });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const company = await companyService.getById(req.params.id);
      sendSuccess(res, company);
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch company', { statusCode: 500 });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const company = await companyService.create(req.body);
      sendSuccess(res, company, { statusCode: 201, message: 'Company created successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'SLUG_TAKEN') {
        sendError(res, 'This slug is already taken. Choose a different one.', { statusCode: 409 });
        return;
      }
      sendError(res, 'Failed to create company', { statusCode: 500 });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const company = await companyService.update(req.params.id, req.body);
      sendSuccess(res, company, { message: 'Company updated successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to update company', { statusCode: 500 });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await companyService.delete(req.params.id);
      sendSuccess(res, null, { message: 'Company deleted successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to delete company', { statusCode: 500 });
    }
  },

  async suspend(req: Request, res: Response): Promise<void> {
    try {
      await companyService.suspend(req.params.id);
      sendSuccess(res, null, { message: 'Company suspended successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to suspend company', { statusCode: 500 });
    }
  },

  async activate(req: Request, res: Response): Promise<void> {
    try {
      await companyService.activate(req.params.id);
      sendSuccess(res, null, { message: 'Company activated successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to activate company', { statusCode: 500 });
    }
  },

  async toggleVerify(req: Request, res: Response): Promise<void> {
    try {
      const company = await companyService.toggleVerify(req.params.id);
      sendSuccess(res, { isVerified: company.isVerified }, {
        message: company.isVerified ? 'Company verified' : 'Company unverified',
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to toggle verification', { statusCode: 500 });
    }
  },

  async setPlan(req: Request, res: Response): Promise<void> {
    try {
      const company = await companyService.setPlan(req.params.id, req.body);
      sendSuccess(res, company, { message: 'Plan updated successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to update plan', { statusCode: 500 });
    }
  },

  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const admin = await companyService.createAdmin(req.params.id, req.body);
      sendSuccess(res, admin, { statusCode: 201, message: 'Company admin created successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'COMPANY_NOT_FOUND') {
        sendError(res, 'Company not found', { statusCode: 404 });
        return;
      }
      if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
        sendError(res, 'This email is already registered', { statusCode: 409 });
        return;
      }
      sendError(res, 'Failed to create admin', { statusCode: 500 });
    }
  },

  async getPlatformAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await companyService.getPlatformAnalytics();
      sendSuccess(res, analytics);
    } catch {
      sendError(res, 'Failed to fetch analytics', { statusCode: 500 });
    }
  },
};
