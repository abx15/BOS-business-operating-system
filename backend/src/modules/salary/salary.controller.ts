import { Request, Response } from 'express';
import { salaryService } from './salary.service';
import { sendSuccess, sendError } from '../../utils/response';
import { z } from 'zod';

const createSalarySchema = z.object({
  staffId: z.string({ required_error: 'Staff ID is required' }),
  month: z
    .string({ required_error: 'Month is required' })
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format eg: 2026-05'),
  amount: z.number({ required_error: 'Amount is required' }).positive(),
  notes: z.string().optional(),
});

export const salaryController = {

  async getMonthly(req: Request, res: Response): Promise<void> {
    try {
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const result = await salaryService.getMonthly(req.companyId!, month);
      sendSuccess(res, result);
    } catch {
      sendError(res, 'Failed to fetch salary records', { statusCode: 500 });
    }
  },

  async getByStaff(req: Request, res: Response): Promise<void> {
    try {
      const result = await salaryService.getByStaff(req.companyId!, req.params.staffId);
      sendSuccess(res, result);
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch salary history', { statusCode: 500 });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createSalarySchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', {
          statusCode: 422,
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const { staffId, month, amount, notes } = parsed.data;
      const salary = await salaryService.create(req.companyId!, staffId, month, amount, notes);
      sendSuccess(res, salary, { statusCode: 201, message: 'Salary record created' });
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      if (err instanceof Error && err.message === 'SALARY_ALREADY_EXISTS') {
        sendError(res, 'Salary record already exists for this month', { statusCode: 409 });
        return;
      }
      sendError(res, 'Failed to create salary record', { statusCode: 500 });
    }
  },

  async markPaid(req: Request, res: Response): Promise<void> {
    try {
      const salary = await salaryService.markPaid(req.companyId!, req.params.id);
      sendSuccess(res, salary, { message: `Salary marked as paid for ${salary.staff.name}` });
    } catch (err) {
      if (err instanceof Error && err.message === 'SALARY_NOT_FOUND') {
        sendError(res, 'Salary record not found', { statusCode: 404 });
        return;
      }
      if (err instanceof Error && err.message === 'ALREADY_PAID') {
        sendError(res, 'Salary is already marked as paid', { statusCode: 400 });
        return;
      }
      sendError(res, 'Failed to mark salary as paid', { statusCode: 500 });
    }
  },

  async generateForMonth(req: Request, res: Response): Promise<void> {
    try {
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const result = await salaryService.generateForMonth(req.companyId!, month);
      sendSuccess(res, result, {
        message: `${result.generated} salary records generated for ${month}`,
      });
    } catch {
      sendError(res, 'Failed to generate salary records', { statusCode: 500 });
    }
  },
};
