import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options?: {
    message?: string;
    statusCode?: number;
    meta?: SuccessResponse<T>['meta'];
  }
): void {
  const { message, statusCode = 200, meta } = options ?? {};
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta }),
  };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message: string,
  options?: {
    statusCode?: number;
    errors?: unknown;
  }
): void {
  const { statusCode = 500, errors } = options ?? {};
  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  res.status(statusCode).json(response);
}
