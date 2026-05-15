import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if super admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
  });

  if (existingAdmin) {
    console.log('✅ Super Admin already exists:', existingAdmin.email);
    return;
  }

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('SuperAdmin@123', 12);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@bos.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      companyId: null,
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:');
  console.log('   Email:', superAdmin.email);
  console.log('   Password: SuperAdmin@123');
  console.log('   Role:', superAdmin.role);
  console.log('');
  console.log('⚠️  IMPORTANT: Change password after first login!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
