import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BOS database with core demo data...\n');

  // Cleanup
  console.log('Cleaning up...');
  await prisma.notification.deleteMany();
  await prisma.salary.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 12);
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@bos.com',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const company1 = await prisma.company.create({
    data: {
      name: 'Sharma General Store',
      slug: 'sharma-general-store',
      ownerName: 'Ramesh Sharma',
      ownerPhone: '9876543210',
      ownerEmail: 'ramesh@sharma.com',
      plan: 'PRO',
      planExpiresAt: new Date('2027-12-31'),
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Ramesh Sharma',
      email: 'ramesh.admin@sharma.com',
      password: await bcrypt.hash('Admin@12345', 12),
      role: 'COMPANY_ADMIN',
      companyId: company1.id,
    },
  });

  console.log('✅ Core data created!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
