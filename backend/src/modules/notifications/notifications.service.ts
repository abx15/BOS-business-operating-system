import { prisma } from '../../config/db';

export const notificationsService = {

  async getAll(companyId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { companyId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { companyId } }),
      prisma.notification.count({ where: { companyId, isRead: false } }),
    ]);

    return {
      notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      unreadCount,
    };
  },

  async markRead(companyId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, companyId },
    });
    if (!notification) throw new Error('NOTIFICATION_NOT_FOUND');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  async markAllRead(companyId: string) {
    const result = await prisma.notification.updateMany({
      where: { companyId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  },

  async delete(companyId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, companyId },
    });
    if (!notification) throw new Error('NOTIFICATION_NOT_FOUND');

    await prisma.notification.delete({ where: { id: notificationId } });
  },
};
