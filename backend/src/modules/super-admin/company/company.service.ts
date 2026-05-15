import bcrypt from 'bcryptjs';
import { prisma } from '../../../config/db';
import { logger } from '../../../utils/logger';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  SetPlanInput,
  CreateAdminInput,
} from './company.schema';

export const companyService = {

  // List all companies with pagination
  async getAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { ownerName: { contains: search, mode: 'insensitive' as const } },
          { ownerEmail: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          ownerName: true,
          ownerPhone: true,
          ownerEmail: true,
          plan: true,
          planExpiresAt: true,
          isActive: true,
          isVerified: true,
          isSuspended: true,
          createdAt: true,
          _count: {
            select: {
              staff: { where: { deletedAt: null } },
              invoices: true,
            },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      companies,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single company detail
  async getById(id: string) {
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
      include: {
        users: {
          where: { role: 'COMPANY_ADMIN', deletedAt: null },
          select: { id: true, name: true, email: true, isActive: true, createdAt: true },
        },
        _count: {
          select: {
            staff: { where: { deletedAt: null } },
            products: { where: { deletedAt: null } },
            invoices: true,
            customers: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!company) throw new Error('COMPANY_NOT_FOUND');
    return company;
  },

  // Create new company
  async create(input: CreateCompanyInput) {
    // Check slug uniqueness
    const existing = await prisma.company.findUnique({
      where: { slug: input.slug },
    });
    if (existing) throw new Error('SLUG_TAKEN');

    const company = await prisma.company.create({
      data: {
        name: input.name,
        slug: input.slug,
        logo: input.logo,
        ownerName: input.ownerName,
        ownerPhone: input.ownerPhone,
        ownerEmail: input.ownerEmail,
        plan: input.plan,
        planExpiresAt: new Date(input.planExpiresAt),
      },
    });

    logger.info({ companyId: company.id, name: company.name }, 'Company created');
    return company;
  },

  // Update company basic info
  async update(id: string, input: UpdateCompanyInput) {
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.ownerName && { ownerName: input.ownerName }),
        ...(input.ownerPhone && { ownerPhone: input.ownerPhone }),
        ...(input.ownerEmail && { ownerEmail: input.ownerEmail }),
        ...(input.logo && { logo: input.logo }),
      },
    });

    logger.info({ companyId: id }, 'Company updated');
    return updated;
  },

  // Soft delete company
  async delete(id: string) {
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    // Soft delete company + deactivate its admin users
    await prisma.$transaction([
      prisma.company.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      }),
      prisma.user.updateMany({
        where: { companyId: id },
        data: { isActive: false, deletedAt: new Date() },
      }),
    ]);

    logger.info({ companyId: id }, 'Company soft deleted');
  },

  // Suspend company
  async suspend(id: string) {
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    await prisma.company.update({
      where: { id },
      data: { isSuspended: true },
    });

    logger.info({ companyId: id }, 'Company suspended');
  },

  // Activate company
  async activate(id: string) {
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    await prisma.company.update({
      where: { id },
      data: { isSuspended: false, isActive: true },
    });

    logger.info({ companyId: id }, 'Company activated');
  },

  // Toggle blue tick verification
  async toggleVerify(id: string) {
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    const updated = await prisma.company.update({
      where: { id },
      data: { isVerified: !company.isVerified },
    });

    logger.info({ companyId: id, isVerified: updated.isVerified }, 'Company verify toggled');
    return updated;
  },

  // Set plan + expiry
  async setPlan(id: string, input: SetPlanInput) {
    const company = await prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    const updated = await prisma.company.update({
      where: { id },
      data: {
        plan: input.plan,
        planExpiresAt: new Date(input.planExpiresAt),
        isActive: true,
        isSuspended: false,
      },
    });

    logger.info({ companyId: id, plan: input.plan }, 'Company plan updated');
    return updated;
  },

  // Create Company Admin login
  async createAdmin(companyId: string, input: CreateAdminInput) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
    });
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    // Check email not already taken
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new Error('EMAIL_TAKEN');

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const admin = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'COMPANY_ADMIN',
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
      },
    });

    logger.info({ companyId, adminId: admin.id }, 'Company admin created');
    return admin;
  },

  // Platform analytics
  async getPlatformAnalytics() {
    const [
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      expiredCompanies,
      totalStaff,
      totalInvoices,
      planCounts,
    ] = await Promise.all([
      prisma.company.count({ where: { deletedAt: null } }),
      prisma.company.count({ where: { deletedAt: null, isActive: true, isSuspended: false } }),
      prisma.company.count({ where: { deletedAt: null, isSuspended: true } }),
      prisma.company.count({
        where: { deletedAt: null, planExpiresAt: { lt: new Date() } },
      }),
      prisma.staffMember.count({ where: { deletedAt: null } }),
      prisma.invoice.count(),
      prisma.company.groupBy({
        by: ['plan'],
        where: { deletedAt: null },
        _count: { plan: true },
      }),
    ]);

    return {
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      expiredCompanies,
      totalStaff,
      totalInvoices,
      planDistribution: planCounts.map((p) => ({
        plan: p.plan,
        count: p._count.plan,
      })),
    };
  },
};
