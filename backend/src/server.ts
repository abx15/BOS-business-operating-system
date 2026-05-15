import http from 'http';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import app from './app';
import { initSocket } from './sockets/index';

async function bootstrap(): Promise<void> {
  await connectDB();

  // Create HTTP server (required for Socket.io)
  const httpServer = http.createServer(app);

  // Initialize Socket.io
  const io = initSocket(httpServer);

  httpServer.listen(Number(env.PORT), () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info('Socket.io ready for connections');
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down gracefully...`);
    io.close();
    httpServer.close(async () => {
      const { prisma } = await import('./config/db');
      await prisma.$disconnect();
      logger.info('Server closed, database disconnected');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
