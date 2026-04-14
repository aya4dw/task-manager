import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { JSONStorage } from './storage/JSONStorage';
import { TaskService } from './services/TaskService';
import { AgentService } from './services/AgentService';
import { NotificationService } from './services/NotificationService';
import { WebSocketService } from './services/WebSocketService';
import { AuthService } from './services/AuthService';
import { setupTaskRoutes } from './routes/tasks';
import { setupAgentRoutes } from './routes/agents';
import { setupHeartbeatRoutes } from './routes/heartbeat';
import { setupTemplateRoutes } from './routes/templates';
import { setupConfigRoutes } from './routes/config';
import companyRouter from './routes/company';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { loggingMiddleware } from './middleware/logging';
import { corsMiddleware } from './middleware/cors';

// Initialize storage
const storage = new JSONStorage('./data', './backups');

async function bootstrap(): Promise<void> {
  console.log('🚀 Task Manager Backend starting...');

  try {
    // Initialize storage (create data directories and files)
    await storage.initialize();
    console.log('✅ Storage initialized');

    // Get initial config
    const config = await storage.getConfig();

    // Initialize services
    const taskService = new TaskService(storage);
    const agentService = new AgentService(storage);
    const notificationService = new NotificationService(storage);
    const authService = new AuthService(config);

    // Create Express app
    const app: Application = express();
    const httpServer = createServer(app);

    // Initialize WebSocket service
    const wsService = new WebSocketService(httpServer);
    wsService.setApiKey(config.auth.apiKey);
    notificationService.setWebSocketService(wsService);

    // Update auth service with config
    authService.updateConfig(config);

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(loggingMiddleware);
    app.use(corsMiddleware(config));

    // Health check endpoint
    app.get('/api/health', (_req: Request, res: Response) => {
      res.json({
        status: 'ok',
        version: config.version,
        timestamp: Date.now(),
        websocketConnections: wsService.getConnectionCount()
      });
    });

    // API v1 routes
    const taskRouter = setupTaskRoutes(taskService, notificationService, wsService);
    const agentRouter = setupAgentRoutes(agentService, notificationService, wsService);
    const heartbeatRouter = setupHeartbeatRoutes(agentService, taskService);
    const templateRouter = setupTemplateRoutes(storage);
    const configRouter = setupConfigRoutes(storage);

    app.use('/api/v1/tasks', taskRouter);
    app.use('/api/v1/agents', agentRouter);
    app.use('/api/v1/heartbeat', heartbeatRouter);
    app.use('/api/v1/templates', templateRouter);
    app.use('/api/v1/config', configRouter);
    app.use('/api/v1/company', companyRouter);

    // 404 handler
    app.use(notFoundHandler);

    // Error handler
    app.use(errorHandler);

    // Start server
    const port = config.server.port || 3001;
    const host = config.server.host || '0.0.0.0';

    httpServer.listen(port, host, () => {
      console.log(`✅ Server running on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`📊 Health check: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/api/health`);
      console.log(`🔑 API Key: ${config.auth.apiKey}`);
    });

    // Handle shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down...');
      await storage.createBackup();
      httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down...');
      await storage.createBackup();
      httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();
