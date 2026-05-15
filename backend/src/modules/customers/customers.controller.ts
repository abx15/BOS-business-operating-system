import { Request, Response } from 'express';
import { customersService } from './customers.service';
import { sendSuccess, sendError } from '../../utils/response';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1).trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number')
    .optional(),
  email: z.string().email().toLowerCase().trim().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

export const customersController = {

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const search = req.query.search as string | undefined;
      const result = await customersService.getAll(req.companyId!, page, limit, search);
      sendSuccess(res, result.customers, { meta: result.meta });
    } catch {
      sendError(res, 'Failed to fetch customers', { statusCode: 500 });
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const customer = await customersService.getById(req.companyId!, req.params.id);
      sendSuccess(res, customer);
    } catch (err) {
      if (err instanceof Error && err.message === 'CUSTOMER_NOT_FOUND') {
        sendError(res, 'Customer not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch customer', { statusCode: 500 });
    }
  },

  async getPurchaseHistory(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const result = await customersService.getPurchaseHistory(
        req.companyId!,
        req.params.id,
        page,
        limit
      );
      sendSuccess(res, result);
    } catch (err) {
      if (err instanceof Error && err.message === 'CUSTOMER_NOT_FOUND') {
        sendError(res, 'Customer not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to fetch purchase history', { statusCode: 500 });
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createCustomerSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', {
          statusCode: 422,
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const customer = await customersService.create(req.companyId!, parsed.data);
      sendSuccess(res, customer, { statusCode: 201, message: 'Customer added successfully' });
    } catch {
      sendError(res, 'Failed to add customer', { statusCode: 500 });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const parsed = updateCustomerSchema.safeParse(req.body);
      if (!parsed.success) {
        sendError(res, 'Validation failed', {
          statusCode: 422,
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const customer = await customersService.update(req.companyId!, req.params.id, parsed.data);
      sendSuccess(res, customer, { message: 'Customer updated successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'CUSTOMER_NOT_FOUND') {
        sendError(res, 'Customer not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to update customer', { statusCode: 500 });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await customersService.delete(req.companyId!, req.params.id);
      sendSuccess(res, null, { message: 'Customer deleted successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'CUSTOMER_NOT_FOUND') {
        sendError(res, 'Customer not found', { statusCode: 404 });
        return;
      }
      sendError(res, 'Failed to delete customer', { statusCode: 500 });
    }
  },
};
