import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Vui lòng nhập họ và tên')
      .max(100, 'Họ tên không được quá 100 ký tự'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập email')
      .email('Email không hợp lệ')
      .max(100, 'Email không được quá 100 ký tự'),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(6, 'Mật khẩu tối thiểu 6 ký tự')
      .max(100, 'Mật khẩu không được quá 100 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

export type RegisterRequest = z.infer<typeof registerSchema>;
