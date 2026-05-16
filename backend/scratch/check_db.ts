import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany();
  console.log('Customers count:', customers.length);
  if (customers.length > 0) {
    console.log('Sample customer:', customers[0]);
  }
}

main().finally(() => prisma.$disconnect());
