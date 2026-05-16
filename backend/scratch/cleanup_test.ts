import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Counting...');
  console.log('Invoices:', await prisma.invoice.count());
  console.log('InvoiceItems:', await prisma.invoiceItem.count());
  console.log('Products:', await prisma.product.count());

  console.log('Deleting InvoiceItems...');
  await prisma.invoiceItem.deleteMany();
  console.log('Remaining InvoiceItems:', await prisma.invoiceItem.count());

  console.log('Deleting Invoices...');
  await prisma.invoice.deleteMany();

  console.log('Deleting Products...');
  await prisma.product.deleteMany();
  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
