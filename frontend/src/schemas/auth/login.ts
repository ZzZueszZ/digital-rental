import { z } from 'zod';
import type { UserResponse } from '@/types/user';

export const loginSchema = z.object({
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
});

export type LoginRequest = z.infer<typeof loginSchema>;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
