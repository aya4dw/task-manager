import { Request, Response, NextFunction } from 'express';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const path = req.path;
  const method = req.method;

  // Add timestamp to response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${method} ${path} ${res.statusCode} ${duration}ms`);
  });

  next();
}
