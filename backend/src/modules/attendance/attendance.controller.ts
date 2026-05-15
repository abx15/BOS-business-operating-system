import { Request, Response } from 'express';
import { attendanceService } from './attendance.service';
import { sendSuccess, sendError } from '../../utils/response';
import { z } from 'zod';

const markSchema = z.object({
  staffId: z.string({ required_error: 'Staff ID is required' }),
  date: z.string({ required_error: 'Date is required' }),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY'], {
    required_error: 'Status must be PRESENT, ABSENT, or HALF_DAY',
  }),
  note: z.string().optional(),
});

export const attendanceController = {

  async mark(req: Request, res: Response): Promise<void> {
    try {
      const parsed = markSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', {
          statusCode: 422,
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const { staffId, date, status, note } = parsed.data;
      const attendance = await attendanceService.mark(
        req.companyId!,
        staffId,
        date,
        status,
        note
      );
      sendSuccess(res, attendance, { message: 'Attendance marked successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to mark attendance', { statusCode: 500 });
    }
  },

  async getMonthly(req: Request, res: Response): Promise<void> {
    try {
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const attendance = await attendanceService.getMonthly(req.companyId!, month);
      sendSuccess(res, attendance);
    } catch {
      sendError(res, 'Failed to fetch attendance', { statusCode: 500 });
    }
  },

  async getByStaff(req: Request, res: Response): Promise<void> {
    try {
      const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const result = await attendanceService.getByStaff(
        req.companyId!,
        req.params.staffId,
        month
      );
      sendSuccess(res, result);
    } catch (err) {
      if (err instanceof Error && err.message === 'STAFF_NOT_FOUND') {
        sendError(res, 'Staff member not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch attendance', { statusCode: 500 });
    }
  },
};
