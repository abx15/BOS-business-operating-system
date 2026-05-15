import { Request, Response } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess, sendError } from '../../utils/response';

export const notificationsController = {

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const result = await notificationsService.getAll(req.companyId!, page, limit);
      sendSuccess(res, result.notifications, {
        meta: result.meta,
      });
    } catch {
      sendError(res, 'Failed to fetch notifications', { statusCode: 500 });
    }
  },

  async markRead(req: Request, res: Response): Promise<void> {
    try {
      const notification = await notificationsService.markRead(req.companyId!, req.params.id);
      sendSuccess(res, notification, { message: 'Notification marked as read' });
    } catch (err) {
      if (err instanceof Error && err.message === 'NOTIFICATION_NOT_FOUND') {
        sendError(res, 'Notification not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to mark notification', { statusCode: 500 });
    }
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      const result = await notificationsService.markAllRead(req.companyId!);
      sendSuccess(res, result, { message: `${result.updated} notifications marked as read` });
    } catch {
      sendError(res, 'Failed to mark all notifications', { statusCode: 500 });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await notificationsService.delete(req.companyId!, req.params.id);
      sendSuccess(res, null, { message: 'Notification deleted' });
    } catch (err) {
      if (err instanceof Error && err.message === 'NOTIFICATION_NOT_FOUND') {
        sendError(res, 'Notification not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to delete notification', { statusCode: 500 });
    }
  },
};
