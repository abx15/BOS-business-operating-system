import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendError } from '../../utils/response';

export const authController = {

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, {
        message: 'Login successful',
        statusCode: 200,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        sendError(res, 'Invalid email or password', { statusCode: 401 });
        return;
      }
      sendError(res, 'Login failed', { statusCode: 500 });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.refresh(req.body);
      sendSuccess(res, result, { message: 'Token refreshed' });
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_REFRESH_TOKEN') {
        sendError(res, 'Invalid or expired refresh token', { statusCode: 401 });
        return;
      }
      sendError(res, 'Token refresh failed', { statusCode: 500 });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      await authService.logout(req.user!.userId);
      sendSuccess(res, null, { message: 'Logged out successfully' });
    } catch {
      sendError(res, 'Logout failed', { statusCode: 500 });
    }
  },
};
