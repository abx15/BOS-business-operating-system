import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';

export const attendanceService = {

  // Mark attendance — one entry per staff per day (unique constraint)
  async mark(
    companyId: string,
    staffId: string,
    date: string,
    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY',
    note?: string
  ) {
    // Verify staff belongs to this company
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Upsert — agar same day already hai to update karo
    const attendance = await prisma.attendance.upsert({
      where: { staffId_date: { staffId, date: attendanceDate } },
      update: { status, note },
      create: {
        companyId,
        staffId,
        date: attendanceDate,
        status,
        note,
      },
    });

    logger.info({ companyId, staffId, date, status }, 'Attendance marked');
    return attendance;
  },

  // Get monthly attendance for all staff
  async getMonthly(companyId: string, month: string) {
    // month format: "2026-05"
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const attendance = await prisma.attendance.findMany({
      where: {
        companyId,
        date: { gte: startDate, lte: endDate },
      },
      include: {
        staff: {
          select: { id: true, name: true, designation: true, photoUrl: true },
        },
      },
      orderBy: [{ date: 'asc' }, { staff: { name: 'asc' } }],
    });

    return attendance;
  },

  // Get attendance for single staff member
  async getByStaff(companyId: string, staffId: string, month: string) {
    const member = await prisma.staffMember.findFirst({
      where: { id: staffId, companyId, deletedAt: null },
    });
    if (!member) throw new Error('STAFF_NOT_FOUND');

    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    const attendance = await prisma.attendance.findMany({
      where: {
        staffId,
        companyId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Summary
    const present = attendance.filter((a) => a.status === 'PRESENT').length;
    const absent = attendance.filter((a) => a.status === 'ABSENT').length;
    const halfDay = attendance.filter((a) => a.status === 'HALF_DAY').length;

    return {
      staff: member,
      month,
      attendance,
      summary: { present, absent, halfDay, total: attendance.length },
    };
  },
};
