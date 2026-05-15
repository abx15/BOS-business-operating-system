import { prisma } from '../config/db';

export async function generateInvoiceNumber(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      companyId,
      invoiceNumber: { startsWith: prefix },
    },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
    nextNumber = lastNum + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}
