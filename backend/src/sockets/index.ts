import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { registerDashboardSocket } from './dashboard.socket';
import { registerNotificationSocket } from './notification.socket';

export let io: SocketServer;

export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware — har connection pe JWT verify karo
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        logger.warn({ socketId: socket.id }, 'Socket connection rejected — no token');
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      logger.warn({ socketId: socket.id }, 'Socket connection rejected — invalid token');
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    logger.info(
      { socketId: socket.id, userId: user.userId, role: user.role },
      'Socket connected'
    );

    // Join company room for tenant isolation
    if (user.role === 'SUPER_ADMIN') {
      socket.join('super-admin');
      logger.info({ socketId: socket.id }, 'Super Admin joined super-admin room');
    } else if (user.companyId) {
      const room = `company:${user.companyId}`;
      socket.join(room);
      logger.info({ socketId: socket.id, room }, 'User joined company room');
    }

    // Register event handlers
    registerDashboardSocket(socket);
    registerNotificationSocket(socket);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Realtime connection established',
      userId: user.userId,
      role: user.role,
      companyId: user.companyId,
    });

    socket.on('disconnect', (reason) => {
      logger.info(
        { socketId: socket.id, userId: user.userId, reason },
        'Socket disconnected'
      );
    });

    socket.on('error', (err) => {
      logger.error({ socketId: socket.id, err }, 'Socket error');
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

// Helper — emit to a specific company room
export function emitToCompany(companyId: string, event: string, data: unknown): void {
  if (io) {
    io.to(`company:${companyId}`).emit(event, data);
  }
}

// Helper — emit to super admin room
export function emitToSuperAdmin(event: string, data: unknown): void {
  if (io) {
    io.to('super-admin').emit(event, data);
  }
}

// Helper — emit to all connected clients
export function emitToAll(event: string, data: unknown): void {
  if (io) {
    io.emit(event, data);
  }
}
