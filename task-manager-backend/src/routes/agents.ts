import { Router, Request, Response } from 'express';
import { AgentService } from '../services/AgentService';
import { NotificationService } from '../services/NotificationService';
import { WebSocketService } from '../services/WebSocketService';
import { AgentStatus, AgentType } from '../types';

const router = Router();

let agentService: AgentService;

export function setupAgentRoutes(
  as: AgentService,
  _ns: NotificationService,
  _ws: WebSocketService
): Router {
  agentService = as;

  // GET /api/v1/agents - Get agent list
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { status, type, capability } = req.query;

      const options: any = {};
      if (status) options.status = status as AgentStatus;
      if (type) options.type = type as AgentType;
      if (capability) options.capability = capability as string;

      const agents = await agentService.getAgents(options);

      res.json({
        success: true,
        data: agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          currentTasks: agent.currentTasks ? agent.currentTasks.length : 0,
          lastHeartbeat: agent.lastHeartbeat
        })),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取员工列表失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/agents - Create agent
  router.post('/', async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, type, description, capabilities, config } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'name 和 type 是必填字段'
          },
          timestamp: Date.now()
        });
      }

      const agent = await agentService.createAgent({
        name,
        type,
        description,
        capabilities: capabilities || [],
        config
      });

      res.status(201).json({
        success: true,
        data: agent,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建员工失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // GET /api/v1/agents/:id - Get agent by ID
  router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const agent = await agentService.getAgent(req.params.id);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '员工不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: agent,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching agent:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取员工信息失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // PATCH /api/v1/agents/:id - Update agent
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const agent = await agentService.updateAgent(req.params.id, req.body);

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '员工不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: {
          id: agent.id,
          status: agent.status,
          updatedAt: agent.updatedAt
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新员工失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // DELETE /api/v1/agents/:id - Delete agent
  router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const deleted = await agentService.deleteAgent(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '员工不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: {
          deleted: true,
          agentId: req.params.id
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除员工失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // GET /api/v1/agents/:id/pending-tasks - Get pending tasks for agent
  router.get('/:id/pending-tasks', async (req: Request, res: Response) => {
    try {
      const tasks = await agentService.getTasksByAgent(req.params.id);
      
      // Filter for pending tasks (todo or in_progress)
      const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'in_progress');

      res.json({
        success: true,
        data: pendingTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          tags: task.tags,
          status: task.status,
          dueDate: task.dueDate,
          assignedAt: task.assigneeId ? task.updatedAt : null
        })),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取待处理任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  return router;
}
