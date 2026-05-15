import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../../utils/response';

export const analyticsController = {

  async getMonthlyRevenue(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getMonthlyRevenue(req.companyId!);
      sendSuccess(res, data);
    } catch {
      sendError(res, 'Failed to fetch revenue data', { statusCode: 500 });
    }
  },

  async getTopProducts(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 20);
      const data = await analyticsService.getTopProducts(req.companyId!, limit);
      sendSuccess(res, data);
    } catch {
      sendError(res, 'Failed to fetch top products', { statusCode: 500 });
    }
  },

  async getRevenueComparison(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getRevenueComparison(req.companyId!);
      sendSuccess(res, data);
    } catch {
      sendError(res, 'Failed to fetch revenue comparison', { statusCode: 500 });
    }
  },

  async getPaymentBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getPaymentBreakdown(req.companyId!);
      sendSuccess(res, data);
    } catch {
      sendError(res, 'Failed to fetch payment breakdown', { statusCode: 500 });
    }
  },

  async getAttendanceSummary(req: Request, res: Response): Promise<void> {
    try {
      const data = await analyticsService.getAttendanceSummary(req.companyId!);
      sendSuccess(res, data);
    } catch {
      sendError(res, 'Failed to fetch attendance summary', { statusCode: 500 });
    }
  },
};
