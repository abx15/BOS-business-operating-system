import { Request, Response } from 'express';
import { staffService } from './staff.service';
import { sendSuccess, sendError } from '../../utils/response';

export const staffController = {

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const search = req.query.search as string | undefined;
      const result = await staffService.getAll(req.companyId!, page, limit, search);
      sendSuccess(res, result.staff, { meta: result.meta });
    } catch {
      sendError(res, 'Failed to fetch staff', { statusCode: 500 });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const member = await staffService.getById(req.companyId!, req.params.id);
      sendSuccess(res, member);
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch staff member', { statusCode: 500 });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const member = await staffService.create(req.companyId!, req.body);
      sendSuccess(res, member, { statusCode: 201, message: 'Staff member added successfully' });
    } catch {
      sendError(res, 'Failed to add staff member', { statusCode: 500 });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const member = await staffService.update(req.companyId!, req.params.id, req.body);
      sendSuccess(res, member, { message: 'Staff member updated successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to update staff member', { statusCode: 500 });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await staffService.delete(req.companyId!, req.params.id);
      sendSuccess(res, null, { message: 'Staff member removed successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to remove staff member', { statusCode: 500 });
    }
  },

  async toggleVerify(req: Request, res: Response): Promise<void> {
    try {
      const member = await staffService.toggleVerify(req.companyId!, req.params.id);
      sendSuccess(res, { isVerified: member.isVerified }, {
        message: member.isVerified ? 'Staff member verified' : 'Staff member unverified',
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to toggle verification', { statusCode: 500 });
    }
  },
};
