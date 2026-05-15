import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { sendError } from '../utils/response';

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    sendError(res, 'Unauthorized', { statusCode: 401 });
    return;
  }
  if (req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }
  if (!req.user.companyId) {
    sendError(res, 'No company associated with this account', { statusCode: 403 });
    return;
  }
  try {
    const company = await prisma.company.findFirst({
      where: {
        id: req.user.companyId,
        deletedAt: null,
      },
      select: { id: true, isSuspended: true, isActive: true },
    });
    if (!company) {
      sendError(res, 'Company not found', { statusCode: 404 });
      return;
    }
    if (company.isSuspended) {
      sendError(res, 'Your account has been suspended. Contact support.', { statusCode: 403 });
      return;
    }
    if (!company.isActive) {
      sendError(res, 'Your account is inactive. Contact support.', { statusCode: 403 });
      return;
    }
    req.companyId = company.id;
    next();
  } catch {
    sendError(res, 'Internal server error', { statusCode: 500 });
  }
}
