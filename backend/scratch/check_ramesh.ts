import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'ramesh.admin@sharma.com' },
    select: {
      id: true,
      email: true,
      role: true,
    }
  });
  console.log('User Ramesh:', JSON.stringify(user, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
