'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginRequest } from '@/schemas/auth/login';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { persistRefreshTokenCookie } from '@/lib/refresh-token-client';
import { AUTH_ME_QUERY_KEY } from '@/constants/query-keys';
import Routers from '@/constants/routers';
import { cn, getValidRedirectUrl } from '@/lib/utils';
import { Role } from '@/constants/enum/role';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginRequest) => {
    setPendingEmail(null);
    try {
      const { data: res } = await authService.login(values);
      const { accessToken, refreshToken, user } = res.data;

      await persistRefreshTokenCookie(refreshToken);
      setAccessToken(accessToken);
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, user);

      toast.success('Chào mừng bạn quay trở lại!');

      const redirectUrl = getValidRedirectUrl(searchParams);
      if (redirectUrl) {
        router.push(redirectUrl);
        return;
      }

      const roles = user.roles || [];
      if (roles.includes(Role.ADMIN)) router.push(Routers.ADMIN);
      else if (roles.includes(Role.STAFF)) router.push(Routers.STAFF);
      else if (roles.includes(Role.SHIPPER)) router.push(Routers.SHIPPER);
      else router.push(Routers.HOME);
      
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number } };
      const message = err?.response?.data?.message || 'Đăng nhập không thành công';
      const statusCode = err?.response?.status;

      if (statusCode === 401 && (message.includes('activate') || message.includes('PENDING'))) {
        setPendingEmail(values.email);
      }
      toast.error(message);
    }
  };

  return (
    <div className='w-full max-w-md space-y-12 animate-in fade-in slide-in-from-right-8 duration-700'>
      {/* Branding */}
      <div className='space-y-3'>
        <h2 className='text-3xl font-black text-[#ff8c5a] tracking-tight font-heading'>Studio Visuals</h2>
        <h3 className='text-2xl font-bold text-white font-heading'>Chào mừng trở lại</h3>
      </div>

      {/* Industrial Alerts */}
      <div className='space-y-4'>
        <div className='flex items-center gap-4 p-5 bg-[#3a1515] border border-white/5 rounded-2xl'>
          <Lock className='w-5 h-5 text-[#ff8c5a] shrink-0' />
          <p className='text-xs font-semibold text-white leading-relaxed'>
            Tài khoản bị khóa. Vui lòng liên hệ bộ phận hỗ trợ hoặc đặt lại mật mã.
          </p>
        </div>

        {pendingEmail && (
          <div className='flex items-center gap-4 p-5 bg-[#1a1a1a] border border-[#ff8c5a]/20 rounded-2xl'>
            <Mail className='w-5 h-5 text-[#ff8c5a] shrink-0' />
            <p className='text-xs font-semibold text-white leading-relaxed'>
              Vui lòng kiểm tra email kích hoạt để tiếp tục.
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Email */}
        <div className='space-y-3'>
          <label className='text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1'>Địa chỉ Email</label>
          <Input
            placeholder='alex@studiovisuals.com'
            {...register('email')}
            className={cn(
              'h-14 bg-[#1a1a1a] border-[#2a2a2a] rounded-xl px-5 text-white placeholder:text-zinc-700 transition-all focus:ring-1 focus:ring-[#ff8c5a]/50 focus:border-[#ff8c5a]/50',
              errors.email && 'border-red-500/50'
            )}
          />
          {errors.email && <p className='text-[10px] font-bold text-red-500 uppercase px-1'>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className='space-y-3'>
          <label className='text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1'>Mật mã</label>
          <div className='relative group'>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              {...register('password')}
              className={cn(
                'h-14 bg-[#1a1a1a] border-[#2a2a2a] rounded-xl px-5 pr-14 text-white placeholder:text-zinc-700 transition-all focus:ring-1 focus:ring-[#ff8c5a]/50 focus:border-[#ff8c5a]/50',
                errors.password && 'border-red-500/50'
              )}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors'
            >
              {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>
          {errors.password && <p className='text-[10px] font-bold text-red-500 uppercase px-1'>{errors.password.message}</p>}
        </div>

        {/* Forgot Password */}
        <div className='flex justify-end'>
          <Link
            href={Routers.FORGOT_PASSWORD}
            className='text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-widest transition-all underline underline-offset-4'
          >
            Quên mật mã?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full h-16 bg-linear-to-r from-[#ffae8f] to-[#f97316] text-zinc-950 hover:brightness-110 font-black text-sm uppercase tracking-[0.2em] rounded-full shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50'
        >
          {isSubmitting ? 'ĐANG XỬ LÝ...' : 'Đăng Nhập'}
        </Button>
      </form>

      {/* Footer */}
      <div className='pt-8 text-center'>
        <p className='text-zinc-500 text-[10px] font-black uppercase tracking-widest'>
          Bạn mới gia nhập?{' '}
          <Link
            href={Routers.REGISTER}
            className='text-white hover:text-[#ff8c5a] transition-all ml-1'
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
