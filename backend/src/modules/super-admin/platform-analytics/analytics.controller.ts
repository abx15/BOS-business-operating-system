import { Request, Response } from 'express';
import { platformAnalyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../../../utils/response';

export const platformAnalyticsController = {
  async getGeneralStats(req: Request, res: Response) {
    try {
      const data = await platformAnalyticsService.getGeneralStats();
      sendSuccess(res, data);
    } catch (error) {
      sendError(res, 'Failed to fetch general stats', { statusCode: 500 });
    }
  },

  async getGrowthStats(req: Request, res: Response) {
    try {
      const data = await platformAnalyticsService.getGrowthStats();
      sendSuccess(res, data);
    } catch (error) {
      sendError(res, 'Failed to fetch growth stats', { statusCode: 500 });
    }
  },

  async getPlanBreakdown(req: Request, res: Response) {
    try {
      const data = await platformAnalyticsService.getPlanBreakdown();
      sendSuccess(res, data);
    } catch (error) {
      sendError(res, 'Failed to fetch plan breakdown', { statusCode: 500 });
    }
  }
};
