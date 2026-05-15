import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';
import type { CreateStaffInput, UpdateStaffInput } from './staff.schema';

export const staffService = {

  async getAll(companyId: string, page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { designation: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [staff, total] = await Promise.all([
      prisma.staffMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          designation: true,
          joinDate: true,
          photoUrl: true,
          monthlySalary: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.staffMember.count({ where }),
    ]);

    return {
      staff,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(companyId: string, staffId: string) {
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        salaries: {
          orderBy: { month: 'desc' },
          take: 12,
        },
      },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');
    return member;
  },

  async create(companyId: string, input: CreateStaffInput) {
    const member = await prisma.staffMember.create({
      data: {
        companyId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        designation: input.designation,
        joinDate: new Date(input.joinDate),
        monthlySalary: input.monthlySalary,
        photoUrl: input.photoUrl,
      },
    });
    logger.info({ companyId, staffId: member.id }, 'Staff member created');
    return member;
  },

  async update(companyId: string, staffId: string, input: UpdateStaffInput) {
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');

    const updated = await prisma.staffMember.update({
      where: { id: staffId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email }),
        ...(input.designation !== undefined && { designation: input.designation }),
        ...(input.monthlySalary !== undefined && { monthlySalary: input.monthlySalary }),
        ...(input.photoUrl !== undefined && { photoUrl: input.photoUrl }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    logger.info({ companyId, staffId }, 'Staff member updated');
    return updated;
  },

  async delete(companyId: string, staffId: string) {
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');

    await prisma.staffMember.update({
      where: { id: staffId },
      data: { deletedAt: new Date(), isActive: false },
    });

    logger.info({ companyId, staffId }, 'Staff member soft deleted');
  },

  async toggleVerify(companyId: string, staffId: string) {
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');

    const updated = await prisma.staffMember.update({
      where: { id: staffId },
      data: { isVerified: !member.isVerified },
    });

    logger.info({ companyId, staffId, isVerified: updated.isVerified }, 'Staff verify toggled');
    return updated;
  },
};
