import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';

export const customersService = {

  async getAll(companyId: string, page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          createdAt: true,
          _count: { select: { invoices: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(companyId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId, deletedAt: null },
    });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');
    return customer;
  },

  async getPurchaseHistory(companyId: string, customerId: string, page: number, limit: number) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId, deletedAt: null },
    });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    const skip = (page - 1) * limit;

    const [invoices, total, totalSpent] = await Promise.all([
      prisma.invoice.findMany({
        where: { companyId, customerId, status: 'PAID' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: {
              productName: true,
              quantity: true,
              unitPrice: true,
              subtotal: true,
            },
          },
        },
      }),
      prisma.invoice.count({ where: { companyId, customerId, status: 'PAID' } }),
      prisma.invoice.aggregate({
        where: { companyId, customerId, status: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    return {
      customer,
      invoices,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      totalSpent: totalSpent._sum.total ?? 0,
    };
  },

  async create(companyId: string, data: { name: string; phone?: string; email?: string }) {
    const customer = await prisma.customer.create({
      data: { companyId, ...data },
    });
    logger.info({ companyId, customerId: customer.id }, 'Customer created');
    return customer;
  },

  async update(
    companyId: string,
    customerId: string,
    data: { name?: string; phone?: string; email?: string }
  ) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId, deletedAt: null },
    });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
      },
    });
    return updated;
  },

  async delete(companyId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId, deletedAt: null },
    });
    if (!customer) throw new Error('CUSTOMER_NOT_FOUND');

    await prisma.customer.update({
      where: { id: customerId },
      data: { deletedAt: new Date() },
    });
    logger.info({ companyId, customerId }, 'Customer soft deleted');
  },
};
