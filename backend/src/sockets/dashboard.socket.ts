import { Socket } from 'socket.io';
import { logger } from '../utils/logger';

export function registerDashboardSocket(socket: Socket): void {
  // Client requests manual dashboard refresh
  socket.on('dashboard:refresh', () => {
    const user = socket.data.user;
    logger.info({ userId: user.userId }, 'Dashboard refresh requested');
    // Frontend will re-fetch via REST API after receiving this
    socket.emit('dashboard:refresh-ack', { timestamp: new Date().toISOString() });
  });
}

// Called from invoices.service.ts after invoice create
// This function emits dashboard update to the company room
export function emitDashboardUpdate(
  companyId: string,
  data: {
    type: 'NEW_INVOICE';
    invoiceId: string;
    invoiceNumber: string;
    total: number;
    paymentMethod: string;
  }
): void {
  // Import io lazily to avoid circular dependency
  import('./index').then(({ emitToCompany }) => {
    emitToCompany(companyId, 'dashboard:update', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });
}
