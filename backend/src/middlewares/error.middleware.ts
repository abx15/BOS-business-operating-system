import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  if (err instanceof ZodError) {
    sendError(res, 'Validation failed', {
      statusCode: 422,
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 'This record already exists (duplicate value)', { statusCode: 409 });
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Record not found', { statusCode: 404 });
      return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Invalid data provided', { statusCode: 400 });
    return;
  }

  if (err instanceof Error) {
    sendError(res, err.message, { statusCode: 500 });
    return;
  }

  sendError(res, 'Internal server error', { statusCode: 500 });
}
