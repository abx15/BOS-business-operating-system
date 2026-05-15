import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .min(1, 'Name cannot be empty')
    .trim(),
  price: z
    .number({ required_error: 'Price is required' })
    .positive('Price must be greater than 0'),
  stockQty: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .default(0),
  lowStockThreshold: z
    .number()
    .int()
    .min(0)
    .default(10),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).trim().optional(),
  price: z.number().positive().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const updateStockSchema = z.object({
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be a whole number'),
  type: z.enum(['ADD', 'SUBTRACT', 'SET'], {
    required_error: 'Type must be ADD, SUBTRACT, or SET',
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
