import { Request, Response } from 'express';
import { invoicesService } from './invoices.service';
import { sendSuccess, sendError } from '../../utils/response';

export const invoicesController = {

  async create(req: Request, res: Response): Promise<void> {
    try {
      const invoice = await invoicesService.create(
        req.companyId!,
        req.user!.userId,
        req.body
      );
      sendSuccess(res, invoice, {
        statusCode: 201,
        message: 'Invoice created successfully',
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'PRODUCT_NOT_FOUND') {
        sendError(res, 'One or more products not found or inactive', { statusCode: 404 });
        return;
      }
      if (err instanceof Error && err.message.startsWith('INSUFFICIENT_STOCK:')) {
        const productName = err.message.split(':')[1];
        sendError(res, `Insufficient stock for "${productName}"`, { statusCode: 400 });
        return;
      }
      sendError(res, 'Failed to create invoice', { statusCode: 500 });
    }
  },

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const status = req.query.status as string | undefined;
      const paymentMethod = req.query.paymentMethod as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const customerId = req.query.customerId as string | undefined;

      const result = await invoicesService.getAll(
        req.companyId!,
        page,
        limit,
        status,
        paymentMethod,
        startDate,
        endDate,
        customerId
      );
      sendSuccess(res, result.invoices, { meta: result.meta });
    } catch {
      sendError(res, 'Failed to fetch invoices', { statusCode: 500 });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const invoice = await invoicesService.getById(req.companyId!, req.params.id);
      sendSuccess(res, invoice);
    } catch (err) {
      if (err instanceof Error && err.message === 'INVOICE_NOT_FOUND') {
        sendError(res, 'Invoice not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch invoice', { statusCode: 500 });
    }
  },

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      await invoicesService.cancel(req.companyId!, req.params.id);
      sendSuccess(res, null, { message: 'Invoice cancelled and stock restored' });
    } catch (err) {
      if (err instanceof Error && err.message === 'INVOICE_NOT_FOUND') {
        sendError(res, 'Invoice not found', { statusCode: 404 });
        return;
      }
      if (err instanceof Error && err.message === 'ALREADY_CANCELLED') {
        sendError(res, 'Invoice is already cancelled', { statusCode: 400 });
        return;
      }
      sendError(res, 'Failed to cancel invoice', { statusCode: 500 });
    }
  },

  async downloadPDF(req: Request, res: Response): Promise<void> {
    try {
      const pdfBytes = await invoicesService.generatePDF(
        req.companyId!,
        req.params.id
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="invoice-${req.params.id}.pdf"`
      );
      res.send(Buffer.from(pdfBytes));
    } catch (err) {
      if (err instanceof Error && err.message === 'INVOICE_NOT_FOUND') {
        sendError(res, 'Invoice not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to generate PDF', { statusCode: 500 });
    }
  },
};
