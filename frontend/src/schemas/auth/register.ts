import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must be less than 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeToTOS: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterRequest = z.infer<typeof registerSchema>;
