import { Router, Request, Response } from 'express';
import { JSONStorage } from '../storage/JSONStorage';

const router = Router();

let storage: JSONStorage;

export function setupConfigRoutes(storageInstance: JSONStorage): Router {
  storage = storageInstance;

  // GET /api/v1/config - Get system config
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const config = await storage.getConfig();

      res.json({
        success: true,
        data: {
          version: config.version,
          serverTime: Date.now(),
          features: config.features,
          limits: config.limits
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching config:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取配置失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // PATCH /api/v1/config - Update system config
  router.patch('/', async (req: Request, res: Response) => {
    try {
      const config = await storage.updateConfig(req.body);

      res.json({
        success: true,
        data: {
          version: config.version,
          features: config.features,
          updatedAt: config.updatedAt
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating config:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新配置失败'
        },
        timestamp: Date.now()
      });
    }
  });

  return router;
}
