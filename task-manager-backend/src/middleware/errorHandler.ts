import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: err.details
    },
    timestamp: Date.now()
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的資源不存在'
    },
    timestamp: Date.now()
  });
}
