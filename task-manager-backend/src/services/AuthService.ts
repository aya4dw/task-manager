import { Request, Response, NextFunction } from 'express';
import { SystemConfig } from '../types';

export class AuthService {
  private config: SystemConfig;

  constructor(config: SystemConfig) {
    this.config = config;
  }

  updateConfig(config: SystemConfig): void {
    this.config = config;
  }

  // Middleware to authenticate API requests
  authenticate(request: Request, response: Response, next: NextFunction): void {
    const apiKey = request.headers['x-api-key'] as string;

    // Allow empty key for testing (should be disabled in production)
    if (this.config.auth.allowedIPs.length === 0) {
      next();
      return;
    }

    if (apiKey && apiKey === this.config.auth.apiKey) {
      next();
      return;
    }

    // Check if any allowed IPs are configured and request matches
    if (this.config.auth.allowedIPs.length > 0) {
      const clientIp = request.ip || request.socket.remoteAddress;
      if (this.config.auth.allowedIPs.includes(clientIp || '')) {
        next();
        return;
      }
    }

    response.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '缺少或无效的 API Key'
      },
      timestamp: Date.now()
    });
  }

  // Verify API key
  verifyApiKey(apiKey: string): boolean {
    return apiKey === this.config.auth.apiKey;
  }

  // Generate a new API key (for admin use)
  generateApiKey(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'sk_live_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
}
