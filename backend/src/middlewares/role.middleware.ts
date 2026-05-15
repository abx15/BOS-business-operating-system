import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN';

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Unauthorized', { statusCode: 401 });
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      sendError(res, 'Forbidden: insufficient permissions', { statusCode: 403 });
      return;
    }
    next();
  };
}
