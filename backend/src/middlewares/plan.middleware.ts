import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { sendError } from '../utils/response';
import { PlanType } from '@prisma/client';

export async function planMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user || req.user.role === 'SUPER_ADMIN') {
    next();
    return;
  }

  if (!req.companyId) {
    next();
    return;
  }

  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
      select: { planExpiresAt: true, plan: true },
    });

    if (!company) {
      next();
      return;
    }

    const isExpired = company.planExpiresAt < new Date();
    if (isExpired) {
      res.setHeader('X-Plan-Expired', 'true');
      if (req.method !== 'GET') {
        sendError(res, 'Your plan has expired. Please contact admin to renew.', { statusCode: 403 });
        return;
      }
    }

    const daysLeft = Math.ceil((company.planExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) {
      res.setHeader('X-Plan-Expires-In', String(daysLeft));
    }

    // Attach plan info to request for further checks
    (req as any).companyPlan = company.plan;

    next();
  } catch {
    next();
  }
}

export const requirePlan = (requiredPlan: PlanType) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user || req.user.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    const currentPlan = (req as any).companyPlan as PlanType;
    
    const planHierarchy: Record<PlanType, number> = {
      BASIC: 0,
      PRO: 1,
      ENTERPRISE: 2
    };

    if (planHierarchy[currentPlan] < planHierarchy[requiredPlan]) {
      sendError(res, `This feature requires a ${requiredPlan} plan.`, { statusCode: 403 });
      return;
    }

    next();
  };
};
