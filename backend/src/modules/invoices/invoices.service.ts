import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';
import { generateInvoiceNumber } from '../../utils/invoice-number';
import type { CreateInvoiceInput } from './invoices.schema';
import { emitDashboardUpdate } from '../../sockets/dashboard.socket';
import { emitNotification } from '../../sockets/notification.socket';

export const invoicesService = {

  // Create invoice — full transaction
  async create(companyId: string, createdById: string, input: CreateInvoiceInput) {

    // 1. Fetch all products in one query
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        companyId,
        deletedAt: null,
        isActive: true,
      },
    });

    // 2. Validate all products exist
    if (products.length !== productIds.length) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    // 3. Validate stock availability
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error('PRODUCT_NOT_FOUND');
      if (product.stockQty < item.quantity) {
        throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
      }
    }

    // 4. Calculate totals
    let subtotal = 0;
    const itemsWithPrice = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
      };
    });

    const taxAmount = (subtotal * input.tax) / 100;
    const total = subtotal + taxAmount - input.discount;

    // 5. Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(companyId);

    // 6. TRANSACTION — create invoice + items + deduct stock + notifications
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const newInvoice = await tx.invoice.create({
        data: {
          companyId,
          invoiceNumber,
          customerId: input.customerId ?? null,
          createdById,
          subtotal,
          tax: taxAmount,
          discount: input.discount,
          total,
          paymentMethod: input.paymentMethod,
          status: 'PAID',
          notes: input.notes,
          items: {
            create: itemsWithPrice,
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, phone: true } },
          createdBy: { select: { id: true, name: true } },
        },
      });

      // Deduct stock for each product
      for (const item of input.items) {
        const product = products.find((p) => p.id === item.productId)!;
        const newQty = product.stockQty - item.quantity;

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: newQty },
        });

        // Low stock check inside transaction
        if (newQty <= product.lowStockThreshold) {
          await tx.notification.create({
            data: {
              companyId,
              type: 'LOW_STOCK',
              title: 'Low Stock Alert',
              message: `"${product.name}" ka stock sirf ${newQty} bache hain. Restock karo.`,
              metadata: { productId: product.id, currentStock: newQty },
            },
          });
        }
      }

      return newInvoice;
    });

    // Emit dashboard update to company room
    emitDashboardUpdate(companyId, {
      type: 'NEW_INVOICE',
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      paymentMethod: invoice.paymentMethod,
    });

    logger.info(
      { companyId, invoiceId: invoice.id, invoiceNumber, total },
      'Invoice created'
    );

    return invoice;
  },

  // Get all invoices with pagination + filters
  async getAll(
    companyId: string,
    page: number,
    limit: number,
    status?: string,
    paymentMethod?: string,
    startDate?: string,
    endDate?: string
  ) {
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(status && { status: status as 'PAID' | 'PENDING' | 'CANCELLED' }),
      ...(paymentMethod && {
        paymentMethod: paymentMethod as 'CASH' | 'UPI' | 'CARD',
      }),
      ...(startDate &&
        endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          subtotal: true,
          tax: true,
          discount: true,
          total: true,
          paymentMethod: true,
          status: true,
          createdAt: true,
          customer: { select: { id: true, name: true, phone: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single invoice with full details
  async getById(companyId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, category: true } },
          },
        },
        customer: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!invoice) throw new Error('INVOICE_NOT_FOUND');
    return invoice;
  },

  // Cancel invoice (restore stock)
  async cancel(companyId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: { items: true },
    });
    if (!invoice) throw new Error('INVOICE_NOT_FOUND');
    if (invoice.status === 'CANCELLED') throw new Error('ALREADY_CANCELLED');

    await prisma.$transaction(async (tx) => {
      // Cancel invoice
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'CANCELLED' },
      });

      // Restore stock
      for (const item of invoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.quantity } },
        });
      }
    });

    logger.info({ companyId, invoiceId }, 'Invoice cancelled, stock restored');
  },

  // Generate PDF using pdf-lib
  async generatePDF(companyId: string, invoiceId: string): Promise<Uint8Array> {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, companyId },
      include: {
        items: true,
        customer: true,
        createdBy: { select: { name: true } },
        company: {
          select: {
            name: true,
            ownerName: true,
            ownerPhone: true,
            ownerEmail: true,
            isVerified: true,
          },
        },
      },
    });
    if (!invoice) throw new Error('INVOICE_NOT_FOUND');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const black = rgb(0, 0, 0);
    const gray = rgb(0.5, 0.5, 0.5);
    const lightGray = rgb(0.9, 0.9, 0.9);
    const blue = rgb(0.1, 0.3, 0.8);

    let y = height - 50;

    // Header — Company Name
    page.drawText(invoice.company.name, {
      x: 50,
      y,
      size: 22,
      font: fontBold,
      color: blue,
    });

    if (invoice.company.isVerified) {
      page.drawText('✓ Verified', { x: 50, y: y - 22, size: 10, font, color: blue });
    }

    // Invoice title on right
    page.drawText('INVOICE', {
      x: width - 150,
      y,
      size: 22,
      font: fontBold,
      color: black,
    });

    y -= 20;
    page.drawText(invoice.invoiceNumber, {
      x: width - 150,
      y,
      size: 11,
      font,
      color: gray,
    });

    y -= 40;

    // Divider
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: lightGray,
    });

    y -= 20;

    // Company + Invoice details side by side
    page.drawText('From:', { x: 50, y, size: 10, font: fontBold, color: gray });
    page.drawText('Invoice Details:', { x: 350, y, size: 10, font: fontBold, color: gray });

    y -= 16;
    page.drawText(invoice.company.ownerName, { x: 50, y, size: 11, font: fontBold, color: black });
    page.drawText(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, {
      x: 350, y, size: 11, font, color: black,
    });

    y -= 16;
    page.drawText(invoice.company.ownerPhone, { x: 50, y, size: 10, font, color: black });
    page.drawText(`Payment: ${invoice.paymentMethod}`, { x: 350, y, size: 11, font, color: black });

    y -= 16;
    page.drawText(invoice.company.ownerEmail, { x: 50, y, size: 10, font, color: black });
    page.drawText(`Status: ${invoice.status}`, { x: 350, y, size: 11, font, color: black });

    // Customer info if present
    if (invoice.customer) {
      y -= 30;
      page.drawText('Bill To:', { x: 50, y, size: 10, font: fontBold, color: gray });
      y -= 16;
      page.drawText(invoice.customer.name, { x: 50, y, size: 11, font: fontBold, color: black });
      if (invoice.customer.phone) {
        y -= 14;
        page.drawText(invoice.customer.phone, { x: 50, y, size: 10, font, color: black });
      }
    }

    y -= 30;

    // Items table header
    page.drawRectangle({ x: 50, y: y - 4, width: width - 100, height: 22, color: blue });
    page.drawText('Item', { x: 58, y: y + 2, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Qty', { x: 340, y: y + 2, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Price', { x: 390, y: y + 2, size: 10, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Total', { x: 460, y: y + 2, size: 10, font: fontBold, color: rgb(1, 1, 1) });

    y -= 20;

    // Items rows
    for (const item of invoice.items) {
      page.drawText(item.productName.substring(0, 35), { x: 58, y, size: 10, font, color: black });
      page.drawText(String(item.quantity), { x: 340, y, size: 10, font, color: black });
      page.drawText(`Rs.${item.unitPrice.toFixed(2)}`, { x: 390, y, size: 10, font, color: black });
      page.drawText(`Rs.${item.subtotal.toFixed(2)}`, { x: 460, y, size: 10, font, color: black });
      y -= 18;

      // Light row separator
      page.drawLine({
        start: { x: 50, y: y + 4 },
        end: { x: width - 50, y: y + 4 },
        thickness: 0.5,
        color: lightGray,
      });
    }

    y -= 10;

    // Totals section
    const totalsX = 380;
    page.drawText('Subtotal:', { x: totalsX, y, size: 10, font, color: gray });
    page.drawText(`Rs.${invoice.subtotal.toFixed(2)}`, { x: 490, y, size: 10, font, color: black });

    if (invoice.tax > 0) {
      y -= 16;
      page.drawText('Tax:', { x: totalsX, y, size: 10, font, color: gray });
      page.drawText(`Rs.${invoice.tax.toFixed(2)}`, { x: 490, y, size: 10, font, color: black });
    }

    if (invoice.discount > 0) {
      y -= 16;
      page.drawText('Discount:', { x: totalsX, y, size: 10, font, color: gray });
      page.drawText(`-Rs.${invoice.discount.toFixed(2)}`, { x: 490, y, size: 10, font, color: black });
    }

    y -= 6;
    page.drawLine({
      start: { x: totalsX, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: black,
    });

    y -= 18;
    page.drawText('TOTAL:', { x: totalsX, y, size: 13, font: fontBold, color: black });
    page.drawText(`Rs.${invoice.total.toFixed(2)}`, { x: 490, y, size: 13, font: fontBold, color: blue });

    // Notes
    if (invoice.notes) {
      y -= 30;
      page.drawText('Notes:', { x: 50, y, size: 10, font: fontBold, color: gray });
      y -= 14;
      page.drawText(invoice.notes, { x: 50, y, size: 10, font, color: black });
    }

    // Footer
    page.drawText('Thank you for your business!', {
      x: 50,
      y: 40,
      size: 10,
      font,
      color: gray,
    });
    page.drawText(`Generated by BOS — ${invoice.invoiceNumber}`, {
      x: width - 250,
      y: 40,
      size: 9,
      font,
      color: lightGray,
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  },
};
