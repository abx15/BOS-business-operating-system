import { prisma } from '../../../config/db';

export const platformAnalyticsService = {
  async getGeneralStats() {
    const [totalCompanies, totalActiveCompanies, totalRevenueResult, totalInvoices] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { isActive: true } }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: 'PAID' }
      }),
      prisma.invoice.count(),
    ]);

    return {
      totalCompanies,
      totalActiveCompanies,
      totalRevenue: totalRevenueResult._sum.total || 0,
      totalInvoices,
    };
  },

  async getGrowthStats() {
    const companies = await prisma.company.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyGrowth: Record<string, number> = {};
    companies.forEach((c) => {
      const month = c.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
    });

    return Object.entries(monthlyGrowth).map(([month, count]) => ({ month, count }));
  },

  async getPlanBreakdown() {
    const plans = await prisma.company.groupBy({
      by: ['plan'],
      _count: { id: true },
    });
    return plans.map(p => ({ plan: p.plan, count: p._count.id }));
  }
};
