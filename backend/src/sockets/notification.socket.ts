import { Socket } from 'socket.io';
import { logger } from '../utils/logger';

export function registerNotificationSocket(socket: Socket): void {
  // Client marks notification read via socket (optional — REST API bhi hai)
  socket.on('notification:read', (data: { notificationId: string }) => {
    const user = socket.data.user;
    logger.info(
      { userId: user.userId, notificationId: data.notificationId },
      'Notification read via socket'
    );
    socket.emit('notification:read-ack', { notificationId: data.notificationId });
  });
}

// Called from anywhere to push notification to company
export function emitNotification(
  companyId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    metadata?: unknown;
  }
): void {
  import('./index').then(({ emitToCompany }) => {
    emitToCompany(companyId, 'notification:new', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  });
}
