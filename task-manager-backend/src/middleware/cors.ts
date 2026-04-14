import { Request, Response, NextFunction } from 'express';
import { SystemConfig } from '../types';

export function corsMiddleware(config: SystemConfig): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    // Check if origin is allowed
    const allowedOrigins = config.server.allowedOrigins;
    let isAllowed = false;

    for (const pattern of allowedOrigins) {
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        if (origin?.startsWith(prefix)) {
          isAllowed = true;
          break;
        }
      } else if (origin === pattern) {
        isAllowed = true;
        break;
      }
    }

    if (isAllowed || allowedOrigins.length === 0) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  };
}
