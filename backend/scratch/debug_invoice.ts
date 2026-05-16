import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Debugging Invoice creation...\n');

  // Cleanup
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      name: 'Test Company',
      slug: 'test-' + Date.now(),
      ownerName: 'Owner',
      ownerPhone: '123',
      ownerEmail: 'test@test.com',
      planExpiresAt: new Date(),
    }
  });

  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@test.com',
      password: 'hash',
      companyId: company.id
    }
  });

  const customer = await prisma.customer.create({
    data: {
      name: 'Customer',
      companyId: company.id
    }
  });

  const product = await prisma.product.create({
    data: {
      name: 'Product',
      price: 10,
      companyId: company.id
    }
  });

  console.log('Creating invoice...');
  try {
    const inv = await prisma.invoice.create({
      data: {
        companyId: company.id,
        invoiceNumber: 'INV-' + Date.now(),
        customerId: customer.id,
        createdById: user.id,
        subtotal: 10,
        total: 10,
        paymentMethod: 'CASH',
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              quantity: 1,
              unitPrice: 10,
              subtotal: 10
            }
          ]
        }
      }
    });
    console.log('✅ Invoice created successfully!', inv.id);
  } catch (err: any) {
    console.error('❌ Failed to create invoice:', err.message);
    if (err.meta) console.log('Meta:', err.meta);
    throw err;
  }
}

main().finally(() => prisma.$disconnect());
