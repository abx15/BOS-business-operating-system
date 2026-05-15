import { prisma } from '../../config/db';

export const analyticsService = {

  // Monthly revenue — last 12 months
  async getMonthlyRevenue(companyId: string) {
    const months = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      });
    }

    const results = await Promise.all(
      months.map(async (m) => {
        const agg = await prisma.invoice.aggregate({
          where: {
            companyId,
            status: 'PAID',
            createdAt: { gte: m.start, lte: m.end },
          },
          _sum: { total: true },
          _count: true,
        });
        return {
          month: m.label,
          revenue: Math.round((agg._sum.total ?? 0) * 100) / 100,
          invoiceCount: agg._count,
        };
      })
    );

    return results;
  },

  // Top selling products
  async getTopProducts(companyId: string, limit = 10) {
    const topItems = await prisma.invoiceItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        invoice: { companyId, status: 'PAID' },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: limit,
    });

    return topItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: item._sum.quantity ?? 0,
      totalRevenue: Math.round((item._sum.subtotal ?? 0) * 100) / 100,
    }));
  },

  // Revenue comparison — this month vs last month
  async getRevenueComparison(companyId: string) {
    const today = new Date();

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const [thisMonth, lastMonth] = await Promise.all([
      prisma.invoice.aggregate({
        where: { companyId, status: 'PAID', createdAt: { gte: thisMonthStart, lte: thisMonthEnd } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { companyId, status: 'PAID', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    const thisRevenue = thisMonth._sum.total ?? 0;
    const lastRevenue = lastMonth._sum.total ?? 0;
    const growth =
      lastRevenue === 0
        ? 100
        : Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100 * 100) / 100;

    return {
      thisMonth: {
        revenue: Math.round(thisRevenue * 100) / 100,
        invoiceCount: thisMonth._count,
      },
      lastMonth: {
        revenue: Math.round(lastRevenue * 100) / 100,
        invoiceCount: lastMonth._count,
      },
      growthPercent: growth,
    };
  },

  // Payment method breakdown
  async getPaymentBreakdown(companyId: string) {
    const breakdown = await prisma.invoice.groupBy({
      by: ['paymentMethod'],
      where: { companyId, status: 'PAID' },
      _sum: { total: true },
      _count: true,
    });

    return breakdown.map((b) => ({
      method: b.paymentMethod,
      total: Math.round((b._sum.total ?? 0) * 100) / 100,
      count: b._count,
    }));
  },

  // Staff attendance summary for current month
  async getAttendanceSummary(companyId: string) {
    const today = new Date();
    const month = today.toISOString().slice(0, 7);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const staff = await prisma.staffMember.findMany({
      where: { companyId, deletedAt: null, isActive: true },
      select: {
        id: true,
        name: true,
        designation: true,
        attendances: {
          where: { date: { gte: monthStart, lte: monthEnd } },
          select: { status: true },
        },
      },
    });

    return staff.map((s) => ({
      staffId: s.id,
      name: s.name,
      designation: s.designation,
      month,
      present: s.attendances.filter((a) => a.status === 'PRESENT').length,
      absent: s.attendances.filter((a) => a.status === 'ABSENT').length,
      halfDay: s.attendances.filter((a) => a.status === 'HALF_DAY').length,
      total: s.attendances.length,
    }));
  },
};
