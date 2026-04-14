import { Router, Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { NotificationService } from '../services/NotificationService';
import { WebSocketService } from '../services/WebSocketService';
import { TaskStatus, Priority, TaskFeedbackType } from '../types';

const router = Router();

let taskService: TaskService;
let notificationService: NotificationService;
let wsService: WebSocketService;

export function setupTaskRoutes(
  ts: TaskService,
  ns: NotificationService,
  ws: WebSocketService
): Router {
  taskService = ts;
  notificationService = ns;
  wsService = ws;

  // ============================================
  // 具体路由必须放在前面！
  // 否则会被 /:id 通配符匹配
  // ============================================

  // POST /api/v1/tasks/:id/stop - Stop agent working on task
  router.post('/:id/stop', async (req: Request, res: Response) => {
    try {
      const task = await taskService.stopAgent(req.params.id, 'system');

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      // Broadcast via WebSocket
      wsService.broadcastTaskUpdated(task, ['status']);

      res.json({
        success: true,
        data: {
          taskId: req.params.id,
          stoppedAt: new Date().toISOString(),
          message: '已发送停止命令'
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error stopping agent:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '停止任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/tasks/:id/feedback - Add feedback to task
  router.post('/:id/feedback', async (req: Request, res: Response) => {
    try {
      const { feedback, type = 'info', assigneeId } = req.body;

      if (!feedback) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: '缺少反馈内容'
          },
          timestamp: Date.now()
        });
      }

      const task = await taskService.addFeedback(
        req.params.id,
        feedback,
        type as TaskFeedbackType,
        'system',
        assigneeId
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      // Broadcast via WebSocket
      wsService.broadcastTaskUpdated(task, ['feedbacks']);

      res.json({
        success: true,
        data: {
          taskId: req.params.id,
          feedbackCount: task.feedbacks?.length || 0
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error adding feedback:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '添加反馈失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/tasks/:id/accept - Accept and complete task
  router.post('/:id/accept', async (req: Request, res: Response) => {
    try {
      const task = await taskService.acceptTask(req.params.id, 'system');

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      // Broadcast via WebSocket
      wsService.broadcastTaskUpdated(task, ['status']);

      res.json({
        success: true,
        data: {
          taskId: req.params.id,
          acceptedAt: new Date().toISOString(),
          status: task.status
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error accepting task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '验收任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/tasks/:id/assign - Assign task to agent
  router.post('/:id/assign', async (req: Request, res: Response) => {
    try {
      const { assigneeId } = req.body;

      if (!assigneeId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: '缺少 assigneeId'
          },
          timestamp: Date.now()
        });
      }

      const task = await taskService.assignTask(req.params.id, assigneeId, 'system');

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      // Send notification
      await notificationService.notifyTaskAssigned(
        req.params.id,
        assigneeId,
        task.title
      );

      // Broadcast via WebSocket
      wsService.broadcastTaskAssigned(req.params.id, assigneeId);

      res.json({
        success: true,
        data: {
          taskId: req.params.id,
          assigneeId,
          previousAssigneeId: task.assigneeId,
          status: task.status
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '分配任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/tasks/:id/move - Move task (kanban drag)
  router.post('/:id/move', async (req: Request, res: Response) => {
    try {
      const { toColumn, position } = req.body;

      if (!toColumn) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: '缺少 toColumn'
          },
          timestamp: Date.now()
        });
      }

      const task = await taskService.moveTask(
        req.params.id,
        toColumn as TaskStatus,
        position || 0,
        'system'
      );

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: {
          taskId: req.params.id,
          toColumn,
          status: task.status
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error moving task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '移动任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/tasks/:id/receive - Agent receives task
  router.post('/:id/receive', async (req: Request, res: Response) => {
    try {
      const { agentId } = req.body;

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

      const task = await taskService.receiveTask(req.params.id, agentId);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: {
          taskId: req.params.id,
          agentId,
          receivedAt: new Date().toISOString()
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error receiving task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '接收任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // ============================================
  // 通用路由放在最后
  // ============================================

  // GET /api/v1/tasks - Get task list
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        status,
        priority,
        assigneeId,
        tag,
        page = '1',
        limit = '20'
      } = req.query;

      const options: any = {};
      if (status) options.status = status as TaskStatus;
      if (priority) options.priority = priority as Priority;
      if (assigneeId) options.assigneeId = assigneeId as string;
      if (tag) options.tag = tag as string;
      options.page = parseInt(page as string);
      options.limit = parseInt(limit as string);

      const { tasks, total } = await taskService.getTasks(options);

      const pages = Math.ceil(total / options.limit);

      res.json({
        success: true,
        data: {
          tasks,
          pagination: {
            page: options.page,
            limit: options.limit,
            total,
            pages
          }
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取任务列表失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // POST /api/v1/tasks - Create task
  router.post('/', async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        title,
        description,
        priority,
        tags,
        status,
        templateId,
        dueDate,
        metadata,
        assigneeId
      } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: '任务标题不能为空'
          },
          timestamp: Date.now()
        });
      }

      const task = await taskService.createTask({
        title,
        description,
        priority: priority || 'medium',
        tags: tags || [],
        status: status || 'todo',
        templateId,
        dueDate,
        metadata,
        assigneeId: assigneeId || undefined,
        createdBy: 'system'
      });

      // Enrich task with assignee name
      const enrichedTask = await taskService.getTask(task.id);

      // Broadcast via WebSocket
      wsService.broadcastTaskCreated(enrichedTask);

      res.status(201).json({
        success: true,
        data: enrichedTask,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // GET /api/v1/tasks/:id - Get task by ID
  router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const task = await taskService.getTask(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: task,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // PATCH /api/v1/tasks/:id - Update task
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const task = await taskService.updateTask(req.params.id, req.body, 'system');

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      // Determine what changed
      const changes: string[] = [];
      if (req.body.title) changes.push('title');
      if (req.body.description) changes.push('description');
      if (req.body.priority) changes.push('priority');
      if (req.body.status) changes.push('status');
      if (req.body.assigneeId) changes.push('assigneeId');

      // Broadcast via WebSocket
      wsService.broadcastTaskUpdated(task, changes);

      res.json({
        success: true,
        data: task,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  // DELETE /api/v1/tasks/:id - Delete task
  router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const deleted = await taskService.deleteTask(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '任务不存在'
          },
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        data: {
          deleted: true,
          taskId: req.params.id
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除任务失败'
        },
        timestamp: Date.now()
      });
    }
  });

  return router;
}
