import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BOS database (Defensive Mode)...\n');

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

  // Create Companies
  const company1 = await prisma.company.create({
    data: {
      name: 'Sharma General Store',
      slug: 'sharma-' + Date.now(),
      ownerName: 'Ramesh Sharma',
      ownerPhone: '9876543210',
      ownerEmail: 'ramesh@sharma.com',
      plan: 'PRO',
      planExpiresAt: new Date('2027-12-31'),
    },
  });

  // Create Users
  const password = await bcrypt.hash('Admin@12345', 12);
  const admin1 = await prisma.user.create({
    data: {
      name: 'Ramesh Sharma',
      email: 'ramesh.' + Date.now() + '@sharma.com',
      password,
      role: 'COMPANY_ADMIN',
      companyId: company1.id,
    },
  });

  // Create Products
  const products = [];
  for (let i = 0; i < 5; i++) {
    const p = await prisma.product.create({
      data: {
        name: `Product ${i}`,
        price: 10 + i,
        companyId: company1.id
      }
    });
    products.push(p);
  }

  // Create Customers
  const customers = [];
  for (let i = 0; i < 3; i++) {
    const c = await prisma.customer.create({
      data: {
        name: `Customer ${i}`,
        companyId: company1.id
      }
    });
    customers.push(c);
  }

  console.log('Creating invoices...');
  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length];
    const product = products[i % products.length];
    
    await prisma.invoice.create({
      data: {
        company: { connect: { id: company1.id } },
        invoiceNumber: `INV-${Date.now()}-${i}`,
        customer: { connect: { id: customer.id } },
        createdBy: { connect: { id: admin1.id } },
        subtotal: product.price,
        total: product.price,
        paymentMethod: 'CASH',
        items: {
          create: [
            {
              product: { connect: { id: product.id } },
              productName: product.name,
              quantity: 1,
              unitPrice: product.price,
              subtotal: product.price
            }
          ]
        }
      }
    });
  }

  console.log('✅ Success!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
