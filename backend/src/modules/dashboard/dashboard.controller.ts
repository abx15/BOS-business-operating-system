import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess, sendError } from '../../utils/response';

export const dashboardController = {

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getStats(req.companyId!);
      sendSuccess(res, stats);
    } catch {
      sendError(res, 'Failed to fetch dashboard stats', { statusCode: 500 });
    }
  },

  async getSalesGraph(req: Request, res: Response): Promise<void> {
    try {
      const period = (req.query.period as 'weekly' | 'monthly') || 'weekly';
      if (!['weekly', 'monthly'].includes(period)) {
        sendError(res, 'Period must be weekly or monthly', { statusCode: 400 });
        return;
      }
      const data = await dashboardService.getSalesGraph(req.companyId!, period);
      sendSuccess(res, data);
    } catch {
      sendError(res, 'Failed to fetch sales graph', { statusCode: 500 });
    }
  },
};
