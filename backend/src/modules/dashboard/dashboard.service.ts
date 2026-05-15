import { prisma } from '../../config/db';

export const dashboardService = {

  async getStats(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      todaySales,
      todayInvoiceCount,
      monthRevenue,
      totalStaff,
      totalProducts,
      lowStockProducts,
      recentInvoices,
      unreadNotifications,
    ] = await Promise.all([
      // Today total sales
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          createdAt: { gte: today, lte: todayEnd },
        },
        _sum: { total: true },
        _count: true,
      }),

      // Today invoice count
      prisma.invoice.count({
        where: {
          companyId,
          status: 'PAID',
          createdAt: { gte: today, lte: todayEnd },
        },
      }),

      // This month revenue
      prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { total: true },
      }),

      // Total active staff
      prisma.staffMember.count({
        where: { companyId, deletedAt: null, isActive: true },
      }),

      // Total active products
      prisma.product.count({
        where: { companyId, deletedAt: null, isActive: true },
      }),

      // Low stock products count
      prisma.product.findMany({
        where: { companyId, deletedAt: null, isActive: true },
        select: { stockQty: true, lowStockThreshold: true },
      }),

      // Recent 5 invoices
      prisma.invoice.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          total: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
          customer: { select: { name: true } },
        },
      }),

      // Unread notifications count
      prisma.notification.count({
        where: { companyId, isRead: false },
      }),
    ]);

    const lowStockCount = lowStockProducts.filter(
      (p: { stockQty: number; lowStockThreshold: number }) => p.stockQty <= p.lowStockThreshold
    ).length;

    return {
      today: {
        sales: todaySales._sum.total ?? 0,
        invoiceCount: todayInvoiceCount,
      },
      month: {
        revenue: monthRevenue._sum.total ?? 0,
      },
      totalStaff,
      totalProducts,
      lowStockCount,
      unreadNotifications,
      recentInvoices,
    };
  },

  async getSalesGraph(companyId: string, period: 'weekly' | 'monthly') {
    const today = new Date();
    let startDate: Date;
    let days: number;

    if (period === 'weekly') {
      days = 7;
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else {
      days = 30;
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        status: 'PAID',
        createdAt: { gte: startDate },
      },
      select: { total: true, createdAt: true },
    });

    // Build date map
    const dateMap: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dateMap[key] = 0;
    }

    // Fill with actual data
    for (const inv of invoices) {
      const key = inv.createdAt.toISOString().slice(0, 10);
      if (dateMap[key] !== undefined) {
        dateMap[key] += inv.total;
      }
    }

    // Convert to array for Recharts
    const graphData = Object.entries(dateMap).map(([date, total]) => ({
      date,
      total: Math.round(total * 100) / 100,
    }));

    return graphData;
  },
};
