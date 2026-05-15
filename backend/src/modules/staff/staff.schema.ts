import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number')
    .optional(),
  email: z.string().email('Invalid email').toLowerCase().trim().optional(),
  designation: z
    .string({ required_error: 'Designation is required' })
    .min(1, 'Designation cannot be empty')
    .trim(),
  joinDate: z
    .string({ required_error: 'Join date is required' })
    .datetime({ message: 'Invalid date. Use ISO 8601 format' }),
  monthlySalary: z
    .number({ required_error: 'Monthly salary is required' })
    .positive('Salary must be greater than 0'),
  photoUrl: z.string().url('Invalid photo URL').optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).trim().optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number')
    .optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  designation: z.string().min(1).trim().optional(),
  monthlySalary: z.number().positive().optional(),
  photoUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
