import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BOS database with rich demo data...\n');
  console.log('Cleaning up existing data...');

  // ============================================
  // CLEANUP — correct order (children first, parents last)
  // ============================================
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
  console.log('✅ Database cleaned\n');

  // ============================================
  // SUPER ADMIN
  // ============================================
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 12);
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@bos.com',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin created: admin@bos.com / SuperAdmin@123');

  // ============================================
  // COMPANY 1 — Sharma General Store (PRO)
  // ============================================
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

  const admin1Password = await bcrypt.hash('Admin@12345', 12);
  await prisma.user.create({
    data: {
      name: 'Ramesh Sharma',
      email: 'ramesh.admin@sharma.com',
      password: admin1Password,
      role: 'COMPANY_ADMIN',
      companyId: company1.id,
    },
  });
  console.log('\n✅ Company 1: Sharma General Store (PRO)');
  console.log('   Login: ramesh.admin@sharma.com / Admin@12345');

  // ============================================
  // COMPANY 2 — Raj Medical Store (BASIC)
  // ============================================
  const company2 = await prisma.company.create({
    data: {
      name: 'Raj Medical Store',
      slug: 'raj-medical-store',
      ownerName: 'Suresh Raj',
      ownerPhone: '9811223344',
      ownerEmail: 'suresh@rajmedical.com',
      plan: 'BASIC',
      planExpiresAt: new Date('2026-12-31'),
      isActive: true,
      isVerified: false,
    },
  });

  const admin2Password = await bcrypt.hash('Admin@12345', 12);
  await prisma.user.create({
    data: {
      name: 'Suresh Raj',
      email: 'suresh.admin@rajmedical.com',
      password: admin2Password,
      role: 'COMPANY_ADMIN',
      companyId: company2.id,
    },
  });
  console.log('✅ Company 2: Raj Medical Store (BASIC)');
  console.log('   Login: suresh.admin@rajmedical.com / Admin@12345');

  // ============================================
  // COMPANY 3 — Krishna Coaching Center (PRO)
  // ============================================
  const company3 = await prisma.company.create({
    data: {
      name: 'Krishna Coaching Center',
      slug: 'krishna-coaching',
      ownerName: 'Vijay Krishna',
      ownerPhone: '9988776655',
      ownerEmail: 'vijay@krishnacoaching.com',
      plan: 'PRO',
      planExpiresAt: new Date('2027-06-30'),
      isActive: true,
      isVerified: true,
    },
  });

  const admin3Password = await bcrypt.hash('Admin@12345', 12);
  await prisma.user.create({
    data: {
      name: 'Vijay Krishna',
      email: 'vijay.admin@krishnacoaching.com',
      password: admin3Password,
      role: 'COMPANY_ADMIN',
      companyId: company3.id,
    },
  });
  console.log('✅ Company 3: Krishna Coaching Center (PRO)');
  console.log('   Login: vijay.admin@krishnacoaching.com / Admin@12345');

  // ============================================
  // PRODUCTS — Sharma General Store
  // ============================================
  const products1 = await Promise.all([
    // Grocery
    prisma.product.create({ data: { companyId: company1.id, name: 'Tata Salt 1kg', price: 28, stockQty: 150, lowStockThreshold: 20, category: 'Grocery' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Fortune Sunflower Oil 1L', price: 145, stockQty: 80, lowStockThreshold: 15, category: 'Grocery' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Aashirvaad Atta 5kg', price: 285, stockQty: 60, lowStockThreshold: 10, category: 'Grocery' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'India Gate Basmati Rice 5kg', price: 450, stockQty: 45, lowStockThreshold: 10, category: 'Grocery' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Toor Dal 1kg', price: 120, stockQty: 90, lowStockThreshold: 15, category: 'Grocery' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Chana Dal 1kg', price: 95, stockQty: 70, lowStockThreshold: 10, category: 'Grocery' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Moong Dal 1kg', price: 130, stockQty: 55, lowStockThreshold: 10, category: 'Grocery' } }),
    // Dairy
    prisma.product.create({ data: { companyId: company1.id, name: 'Amul Butter 500g', price: 280, stockQty: 40, lowStockThreshold: 10, category: 'Dairy' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Amul Milk 1L', price: 68, stockQty: 120, lowStockThreshold: 20, category: 'Dairy' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Nestle Dahi 400g', price: 55, stockQty: 35, lowStockThreshold: 10, category: 'Dairy' } }),
    // Beverages
    prisma.product.create({ data: { companyId: company1.id, name: 'Tata Tea Premium 250g', price: 115, stockQty: 65, lowStockThreshold: 10, category: 'Beverages' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Nescafe Classic 100g', price: 245, stockQty: 30, lowStockThreshold: 8, category: 'Beverages' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Bisleri Water 1L', price: 20, stockQty: 200, lowStockThreshold: 30, category: 'Beverages' } }),
    // Snacks
    prisma.product.create({ data: { companyId: company1.id, name: 'Lays Classic Salted 52g', price: 20, stockQty: 100, lowStockThreshold: 20, category: 'Snacks' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Kurkure Masala Munch 90g', price: 30, stockQty: 80, lowStockThreshold: 15, category: 'Snacks' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Parle-G Biscuit 799g', price: 60, stockQty: 50, lowStockThreshold: 10, category: 'Snacks' } }),
    // Personal Care
    prisma.product.create({ data: { companyId: company1.id, name: 'Colgate MaxFresh 150g', price: 89, stockQty: 45, lowStockThreshold: 10, category: 'Personal Care' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Dove Soap 100g', price: 55, stockQty: 60, lowStockThreshold: 12, category: 'Personal Care' } }),
    prisma.product.create({ data: { companyId: company1.id, name: 'Head & Shoulders Shampoo 340ml', price: 320, stockQty: 25, lowStockThreshold: 5, category: 'Personal Care' } }),
    // Household — low stock for demo
    prisma.product.create({ data: { companyId: company1.id, name: 'Surf Excel 1kg', price: 195, stockQty: 5, lowStockThreshold: 10, category: 'Household' } }),
  ]);
  console.log(`\n✅ Products created for Sharma Store: ${products1.length}`);

  // ============================================
  // PRODUCTS — Raj Medical Store
  // ============================================
  const products2 = await Promise.all([
    prisma.product.create({ data: { companyId: company2.id, name: 'Paracetamol 500mg (10 tabs)', price: 15, stockQty: 500, lowStockThreshold: 50, category: 'Medicines' } }),
    prisma.product.create({ data: { companyId: company2.id, name: 'Crocin Advance (15 tabs)', price: 35, stockQty: 300, lowStockThreshold: 30, category: 'Medicines' } }),
    prisma.product.create({ data: { companyId: company2.id, name: 'Dettol Antiseptic 100ml', price: 85, stockQty: 80, lowStockThreshold: 10, category: 'Antiseptic' } }),
    prisma.product.create({ data: { companyId: company2.id, name: 'Band-Aid (10 strips)', price: 40, stockQty: 150, lowStockThreshold: 20, category: 'First Aid' } }),
    prisma.product.create({ data: { companyId: company2.id, name: 'Vicks VapoRub 25g', price: 65, stockQty: 60, lowStockThreshold: 10, category: 'Medicines' } }),
    prisma.product.create({ data: { companyId: company2.id, name: 'Digene Antacid 150ml', price: 110, stockQty: 40, lowStockThreshold: 8, category: 'Medicines' } }),
    prisma.product.create({ data: { companyId: company2.id, name: 'Volini Spray 50g', price: 195, stockQty: 30, lowStockThreshold: 5, category: 'Pain Relief' } }),
    prisma.product.create({ data: { companyId: company2.id, name: 'Glucon-D 500g', price: 120, stockQty: 45, lowStockThreshold: 8, category: 'Nutrition' } }),
  ]);
  console.log(`✅ Products created for Raj Medical: ${products2.length}`);

  // ============================================
  // STAFF — Sharma General Store
  // ============================================
  const staff1 = await Promise.all([
    prisma.staffMember.create({
      data: {
        companyId: company1.id, name: 'Rajesh Kumar', phone: '9812345678',
        designation: 'Store Manager', joinDate: new Date('2024-01-15'),
        monthlySalary: 25000, isVerified: true,
      },
    }),
    prisma.staffMember.create({
      data: {
        companyId: company1.id, name: 'Priya Sharma', phone: '9823456789',
        designation: 'Cashier', joinDate: new Date('2024-03-01'),
        monthlySalary: 15000, isVerified: true,
      },
    }),
    prisma.staffMember.create({
      data: {
        companyId: company1.id, name: 'Mohan Das', phone: '9834567890',
        designation: 'Helper', joinDate: new Date('2024-06-15'),
        monthlySalary: 10000, isVerified: true,
      },
    }),
    prisma.staffMember.create({
      data: {
        companyId: company1.id, name: 'Sunita Verma', phone: '9845678901',
        designation: 'Billing Staff', joinDate: new Date('2025-01-01'),
        monthlySalary: 14000, isVerified: false,
      },
    }),
    prisma.staffMember.create({
      data: {
        companyId: company1.id, name: 'Anil Gupta', phone: '9856789012',
        designation: 'Security Guard', joinDate: new Date('2023-08-01'),
        monthlySalary: 12000, isVerified: true,
      },
    }),
  ]);
  console.log(`\n✅ Staff created for Sharma Store: ${staff1.length}`);

  // ============================================
  // CUSTOMERS — Sharma General Store
  // ============================================
  const customers1 = await Promise.all([
    prisma.customer.create({ data: { companyId: company1.id, name: 'Suresh Patel', phone: '9901234567', email: 'suresh@gmail.com' } }),
    prisma.customer.create({ data: { companyId: company1.id, name: 'Meena Agarwal', phone: '9912345678' } }),
    prisma.customer.create({ data: { companyId: company1.id, name: 'Rahul Verma', phone: '9923456789', email: 'rahul.v@yahoo.com' } }),
    prisma.customer.create({ data: { companyId: company1.id, name: 'Kavita Singh', phone: '9934567890' } }),
    prisma.customer.create({ data: { companyId: company1.id, name: 'Deepak Joshi', phone: '9945678901', email: 'deepak@outlook.com' } }),
    prisma.customer.create({ data: { companyId: company1.id, name: 'Anita Rani', phone: '9956789012' } }),
  ]);
  console.log(`✅ Customers created: ${customers1.length}`);

  // ============================================
  // INVOICES — last 30 days (~45 invoices)
  // ============================================
  const paymentMethods: ('CASH' | 'UPI' | 'CARD')[] = ['CASH', 'UPI', 'CARD'];
  let invoiceCount = 0;

  for (let day = 29; day >= 0; day--) {
    const date = new Date();
    date.setDate(date.getDate() - day);
    date.setHours(9, 0, 0, 0);

    const invoicesPerDay = Math.floor(Math.random() * 3) + 1;

    for (let inv = 0; inv < invoicesPerDay; inv++) {
      const invDate = new Date(date);
      invDate.setHours(date.getHours() + inv * 2);

      const numItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [...products1]
        .sort(() => Math.random() - 0.5)
        .slice(0, numItems);

      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const customer = Math.random() > 0.4
        ? customers1[Math.floor(Math.random() * customers1.length)]
        : null;

      let subtotal = 0;
      const items = selectedProducts.map((p) => {
        const qty = Math.floor(Math.random() * 3) + 1;
        const itemSubtotal = p.price * qty;
        subtotal += itemSubtotal;
        return {
          productId: p.id,
          productName: p.name,
          quantity: qty,
          unitPrice: p.price,
          subtotal: itemSubtotal,
        };
      });

      const taxRate = Math.random() > 0.6 ? 5 : 0;
      const taxAmount = Math.round((subtotal * taxRate) / 100 * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;

      invoiceCount++;
      const invoiceNumber = `INV-2026-${String(invoiceCount).padStart(4, '0')}`;

      await prisma.invoice.create({
        data: {
          companyId: company1.id,
          invoiceNumber,
          customerId: customer?.id ?? null,
          createdById: superAdmin.id,
          subtotal,
          tax: taxAmount,
          discount: 0,
          total,
          paymentMethod,
          status: 'PAID',
          createdAt: invDate,
          items: { create: items },
        },
      });
    }
  }
  console.log(`✅ Invoices created: ${invoiceCount} (last 30 days)`);

  // ============================================
  // ATTENDANCE — last 30 days
  // ============================================
  const attendanceStatuses: ('PRESENT' | 'ABSENT' | 'HALF_DAY')[] = [
    'PRESENT', 'PRESENT', 'PRESENT', 'PRESENT',
    'PRESENT', 'ABSENT', 'HALF_DAY',
  ];

  for (const member of staff1) {
    for (let day = 29; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setUTCHours(0, 0, 0, 0);

      // Skip Sundays
      if (date.getDay() === 0) continue;

      const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];

      await prisma.attendance.upsert({
        where: { staffId_date: { staffId: member.id, date } },
        update: { status },
        create: {
          companyId: company1.id,
          staffId: member.id,
          date,
          status,
        },
      });
    }
  }
  console.log('✅ Attendance marked for last 30 days');

  // ============================================
  // SALARY — last 3 months
  // ============================================
  const today = new Date();
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const d = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const isPast = monthOffset > 0;

    for (const member of staff1) {
      await prisma.salary.upsert({
        where: { staffId_month: { staffId: member.id, month } },
        update: {},
        create: {
          companyId: company1.id,
          staffId: member.id,
          month,
          amount: member.monthlySalary,
          status: isPast ? 'PAID' : 'PENDING',
          paidAt: isPast
            ? new Date(d.getFullYear(), d.getMonth() + 1, 5)
            : null,
        },
      });
    }
  }
  console.log('✅ Salary records created (3 months)');

  // ============================================
  // NOTIFICATIONS
  // ============================================
  await prisma.notification.createMany({
    data: [
      {
        companyId: company1.id,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert',
        message: '"Surf Excel 1kg" ka stock sirf 5 bache hain. Restock karo.',
        isRead: false,
      },
      {
        companyId: company1.id,
        type: 'SALARY_PENDING',
        title: 'Salary Pending',
        message: '5 staff members ki salary is month pending hai.',
        isRead: false,
      },
      {
        companyId: company1.id,
        type: 'GENERAL',
        title: 'Welcome to BOS!',
        message: 'Your Business Operating System is ready. Start billing now.',
        isRead: true,
      },
    ],
  });
  console.log('✅ Notifications created');

  // ============================================
  // FINAL SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('🎉 SEED COMPLETE — BOS Demo Data Ready!');
  console.log('='.repeat(50));
  console.log('\n📋 LOGIN CREDENTIALS:');
  console.log('─'.repeat(40));
  console.log('SUPER ADMIN:');
  console.log('  Email:    admin@bos.com');
  console.log('  Password: SuperAdmin@123');
  console.log('\nCOMPANY ADMINS:');
  console.log('  1. Sharma General Store (PRO ✓):');
  console.log('     Email:    ramesh.admin@sharma.com');
  console.log('     Password: Admin@12345');
  console.log('\n  2. Raj Medical Store (BASIC):');
  console.log('     Email:    suresh.admin@rajmedical.com');
  console.log('     Password: Admin@12345');
  console.log('\n  3. Krishna Coaching (PRO ✓):');
  console.log('     Email:    vijay.admin@krishnacoaching.com');
  console.log('     Password: Admin@12345');
  console.log('\n📊 DATA SUMMARY:');
  console.log('─'.repeat(40));
  console.log(`  Companies:   3`);
  console.log(`  Products:    ${products1.length + products2.length}`);
  console.log(`  Staff:       ${staff1.length}`);
  console.log(`  Customers:   ${customers1.length}`);
  console.log(`  Invoices:    ${invoiceCount} (last 30 days)`);
  console.log(`  Attendance:  last 30 days`);
  console.log(`  Salary:      3 months`);
  console.log('='.repeat(50));
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });