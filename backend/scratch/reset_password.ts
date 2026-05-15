import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@12345', 12);

  const user = await prisma.user.update({
    where: { email: 'ramesh.admin@sharma.com' },
    data: {
      password: hashedPassword,
      isActive: true
    },
  });
  
  console.log('✅ Password reset for:', user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
