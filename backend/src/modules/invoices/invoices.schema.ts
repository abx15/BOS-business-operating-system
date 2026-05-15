import { z } from 'zod';

const invoiceItemSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }).min(1),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than 0'),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  items: z
    .array(invoiceItemSchema, { required_error: 'Items are required' })
    .min(1, 'At least one item is required'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD'], {
    required_error: 'Payment method is required — CASH, UPI, or CARD',
  }),
  tax: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  notes: z.string().trim().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
