import { Router, Request, Response } from 'express';
import { AgentService } from '../services/AgentService';
import { TaskService } from '../services/TaskService';

const router = Router();

let agentService: AgentService;
let taskService: TaskService;

export function setupHeartbeatRoutes(as: AgentService, ts: TaskService): Router {
  agentService = as;
  taskService = ts;

  // POST /api/v1/heartbeat - Agent heartbeat
  router.post('/', async (req: Request, res: Response): Promise<any> => {
    try {
      const { agentId, status, currentTasks } = req.body;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: '缺少 agentId'
          },
          timestamp: Date.now()
        });
      }

      // Update agent status
      await agentService.updateAgentStatus(agentId, status || 'online', currentTasks || []);

      // Get pending tasks for this agent
      const pendingTasks = await taskService.getPendingTasks(agentId);

      res.json({
        success: true,
        data: {
          agentId,
          pendingTasks: pendingTasks.map(task => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            tags: task.tags,
            assignedAt: task.assigneeId ? task.updatedAt : null
          })),
          serverTime: Date.now()
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error processing heartbeat:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '心跳处理失败'
        },
        timestamp: Date.now()
      });
    }
  });

  return router;
}
