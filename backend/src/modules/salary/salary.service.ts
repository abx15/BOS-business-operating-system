import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';

export const salaryService = {

  // Get monthly salary list for all staff
  async getMonthly(companyId: string, month: string) {
    const salaries = await prisma.salary.findMany({
      where: { companyId, month },
      include: {
        staff: {
          select: { id: true, name: true, designation: true, photoUrl: true },
        },
      },
      orderBy: { staff: { name: 'asc' } },
    });

    const totalPaid = salaries
      .filter((s) => s.status === 'PAID')
      .reduce((sum, s) => sum + s.amount, 0);

    const totalPending = salaries
      .filter((s) => s.status === 'PENDING')
      .reduce((sum, s) => sum + s.amount, 0);

    return { salaries, summary: { totalPaid, totalPending, month } };
  },

  // Get salary history for single staff
  async getByStaff(companyId: string, staffId: string) {
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');

    const salaries = await prisma.salary.findMany({
      where: { staffId, companyId },
      orderBy: { month: 'desc' },
    });

    return { staff: member, salaries };
  },

  // Create salary record for a month
  async create(
    companyId: string,
    staffId: string,
    month: string,
    amount: number,
    notes?: string
  ) {
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');

    // Check if salary already exists for this month
    const existing = await prisma.salary.findUnique({
      where: { staffId_month: { staffId, month } },
    });
    if (existing) throw new Error('SALARY_ALREADY_EXISTS');

    const salary = await prisma.salary.create({
      data: {
        companyId,
        staffId,
        month,
        amount,
        status: 'PENDING',
        notes,
      },
      include: {
        staff: { select: { id: true, name: true, designation: true } },
      },
    });

    logger.info({ companyId, staffId, month, amount }, 'Salary record created');
    return salary;
  },

  // Mark salary as paid
  async markPaid(companyId: string, salaryId: string) {
    const salary = await prisma.salary.findFirst({
      where: { id: salaryId, companyId },
    });
    if (!salary) throw new Error('SALARY_NOT_FOUND');
    if (salary.status === 'PAID') throw new Error('ALREADY_PAID');

    const updated = await prisma.salary.update({
      where: { id: salaryId },
      data: { status: 'PAID', paidAt: new Date() },
      include: {
        staff: { select: { id: true, name: true } },
      },
    });

    logger.info({ companyId, salaryId }, 'Salary marked as paid');
    return updated;
  },

  // Generate salary records for all active staff for a month
  async generateForMonth(companyId: string, month: string) {
    const allStaff = await prisma.staffMember.findMany({
      where: { companyId, deletedAt: null, isActive: true },
    });

    const results = [];
    for (const member of allStaff) {
      const existing = await prisma.salary.findUnique({
        where: { staffId_month: { staffId: member.id, month } },
      });

      if (!existing) {
        const salary = await prisma.salary.create({
          data: {
            companyId,
            staffId: member.id,
            month,
            amount: member.monthlySalary,
            status: 'PENDING',
          },
        });
        results.push(salary);
      }
    }

    logger.info({ companyId, month, generated: results.length }, 'Salary generated for month');
    return { generated: results.length, month };
  },
};
