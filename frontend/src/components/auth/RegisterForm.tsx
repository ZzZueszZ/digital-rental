'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema, type RegisterRequest } from '@/schemas/auth/register';
import { authService } from '@/services/auth';
import Routers from '@/constants/routers';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterRequest) => {
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      };

      const res = await authService.register(payload);
      toast.success(res.data.message || 'Đăng ký thành công, vui lòng kiểm tra email');
      router.push(Routers.VERIFY);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại';
      toast.error(message);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto lg:mx-0'>
      {/* Header for Mobile only */}
      <div className='lg:hidden space-y-4 mb-8 text-center'>
        <h1 className='text-4xl font-bold tracking-tight text-white'>Tạo tài khoản</h1>
        <p className='text-[1.125rem] text-on-surface-variant font-medium'>Bắt đầu hành trình của bạn</p>
      </div>

      <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-3'>
          <label className='text-[1.125rem] font-medium text-white'>Họ và Tên</label>
          <Input
            placeholder='Nhập họ và tên'
            {...register('fullName')}
            className={`h-14 bg-surface-container-highest border-transparent rounded-[1.5rem] focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary caret-secondary text-white text-[1.125rem] px-5 shadow-inner ${errors.fullName ? 'border-b-2 border-b-error' : ''}`}
          />
          {errors.fullName && (
            <p className='text-sm text-error font-medium'>{errors.fullName.message}</p>
          )}
        </div>

        <div className='space-y-3'>
          <label className='text-[1.125rem] font-medium text-white'>Email</label>
          <Input
            placeholder='Nhập địa chỉ email của bạn'
            type='email'
            {...register('email')}
            className={`h-14 bg-surface-container-highest border-transparent rounded-[1.5rem] focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary caret-secondary text-white text-[1.125rem] px-5 shadow-inner ${errors.email ? 'border-b-2 border-b-error' : ''}`}
          />
          {errors.email && (
            <p className='text-sm text-error font-medium'>{errors.email.message}</p>
          )}
        </div>

        <div className='space-y-3'>
          <label className='text-[1.125rem] font-medium text-white'>Mật khẩu</label>
          <div className='relative'>
            <Input
              placeholder='Nhập mật khẩu'
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`h-14 bg-surface-container-highest border-transparent rounded-[1.5rem] focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary caret-secondary text-white text-[1.125rem] px-5 pr-12 shadow-inner ${errors.password ? 'border-b-2 border-b-error' : ''}`}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition'
            >
              {showPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}
            </button>
          </div>
          {errors.password && (
            <p className='text-sm text-error font-medium'>{errors.password.message}</p>
          )}
        </div>

        <div className='space-y-3'>
          <label className='text-[1.125rem] font-medium text-white'>Xác nhận mật khẩu</label>
          <Input
            placeholder='Nhập lại mật khẩu'
            type='password'
            {...register('confirmPassword')}
            className={`h-14 bg-surface-container-highest border-transparent rounded-[1.5rem] focus-visible:ring-1 focus-visible:ring-secondary focus-visible:border-secondary caret-secondary text-white text-[1.125rem] px-5 shadow-inner ${errors.confirmPassword ? 'border-b-2 border-b-error' : ''}`}
          />
          {errors.confirmPassword && (
            <p className='text-sm text-error font-medium'>{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          className='w-full h-14 text-lg font-bold bg-linear-to-br from-primary to-on-primary-container text-[#131313] rounded-full hover:brightness-110 shadow-[0_4px_20px_rgba(255,181,154,0.3)] transition-all active:scale-98 mt-2'
          type='submit'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </Button>
      </form>

      {/* Divider */}
      <div className='relative mt-12 mb-8 text-center'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-outline-variant/30'></div>
        </div>
        <span className='relative bg-surface-container/80 px-4 text-sm font-medium text-on-surface-variant uppercase tracking-widest'>
          Hoặc
        </span>
      </div>

      {/* Social Login */}
      <div className='space-y-4'>
        <Button
          variant='outline'
          className='w-full h-14 justify-center gap-3 rounded-full bg-surface-container-highest border border-outline-variant/20 text-white font-bold hover:bg-surface-bright transition-all active:scale-98 shadow-sm'
        >
          <Image
            src='https://www.svgrepo.com/show/475656/google-color.svg'
            width={20}
            height={20}
            alt='Google'
          />
          Đăng ký với Google
        </Button>
        <Button className='w-full h-14 justify-center gap-3 rounded-full bg-surface-container-highest border border-outline-variant/20 text-[#1877F2] font-bold hover:bg-surface-bright transition-all active:scale-98 shadow-sm'>
          <svg className='w-5 h-5 fill-current' viewBox='0 0 24 24'>
            <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
          </svg>
          <span className='text-white'>Đăng ký với Facebook</span>
        </Button>
      </div>

      <p className='mt-10 text-center text-[1.125rem] text-on-surface-variant'>
        Đã có tài khoản?{' '}
        <Link
          href={Routers.LOGIN}
          className='text-primary-fixed underline decoration-2 underline-offset-4 hover:text-white transition-all ml-1 font-bold'
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
