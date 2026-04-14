import { Router, Request, Response } from 'express';
import { JSONStorage } from '../storage/JSONStorage';

const router = Router();

let storage: JSONStorage;

export function setupTemplateRoutes(storageInstance: JSONStorage): Router {
  storage = storageInstance;

  // GET /api/v1/templates - Get template list
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const templates = await storage.getTemplates();

      res.json({
        success: true,
        data: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          stages: t.stages,
          tags: t.tags,
          createdAt: t.createdAt
        })),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取模板列表失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/templates - Create template
  router.post('/', async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, description, stages, tags, defaultPriority, metadata } = req.body;

      if (!name || !stages) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'name 和 stages 是必填字段'
          },
          timestamp: Date.now()
        });
      }

      const template = await storage.createTemplate({
        name,
        description,
        stages,
        tags: tags || [],
        defaultPriority: defaultPriority || 'medium',
        metadata
      }, 'system');

      res.status(201).json({
        success: true,
        data: template,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建模板失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // GET /api/v1/templates/:id - Get template by ID
  router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const template = await storage.getTemplate(req.params.id);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '模板不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: template,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取模板失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // PATCH /api/v1/templates/:id - Update template
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '模板不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: {
          id: template.id,
          name: template.name,
          stages: template.stages,
          updatedAt: template.updatedAt
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新模板失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // DELETE /api/v1/templates/:id - Delete template
  router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '模板不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: {
          deleted: true,
          templateId: req.params.id
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除模板失败'
        },
        timestamp: Date.now()
      });
    }
  });

  return router;
}
