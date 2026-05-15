import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z
    .string({ required_error: 'Company name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  slug: z
    .string({ required_error: 'Slug is required' })
    .min(2)
    .toLowerCase()
    .trim()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'),
  ownerName: z.string({ required_error: 'Owner name is required' }).min(2).trim(),
  ownerPhone: z
    .string({ required_error: 'Owner phone is required' })
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  ownerEmail: z
    .string({ required_error: 'Owner email is required' })
    .email('Invalid email')
    .toLowerCase()
    .trim(),
  plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']).default('BASIC'),
  planExpiresAt: z
    .string({ required_error: 'Plan expiry date is required' })
    .datetime({ message: 'Invalid date format. Use ISO 8601 eg: 2026-12-31T00:00:00.000Z' }),
  logo: z.string().url().optional(),
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).trim().optional(),
  ownerName: z.string().min(2).trim().optional(),
  ownerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')
    .optional(),
  ownerEmail: z.string().email().toLowerCase().trim().optional(),
  logo: z.string().url().optional(),
});

export const setPlanSchema = z.object({
  plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
  planExpiresAt: z
    .string({ required_error: 'Expiry date is required' })
    .datetime({ message: 'Invalid date format. Use ISO 8601' }),
});

export const createAdminSchema = z.object({
  name: z.string({ required_error: 'Admin name is required' }).min(2).trim(),
  email: z
    .string({ required_error: 'Admin email is required' })
    .email('Invalid email')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type SetPlanInput = z.infer<typeof setPlanSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
