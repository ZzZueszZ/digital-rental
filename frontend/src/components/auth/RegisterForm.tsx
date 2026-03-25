'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema, type RegisterRequest } from '@/schemas/auth/register';
import { authService } from '@/services/auth';
import Routers from '@/constants/routers';
import { cn } from '@/lib/utils';

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
      agreeToTOS: true
    },
  });

  const onSubmit = async (values: RegisterRequest) => {
    try {
      const res = await authService.register(values);
      if (res.data.success) {
        toast.success('Đăng ký thành công. Vui lòng kiểm tra email kích hoạt.');
        router.push(Routers.VERIFY);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Đăng ký không thành công');
    }
  };

  return (
    <div className='w-full max-w-md space-y-12 animate-in fade-in slide-in-from-right-8 duration-700'>
      {/* Branding */}
      <div className='space-y-3'>
        <h2 className='text-3xl font-black text-[#ff8c5a] tracking-tight font-heading'>Studio Visuals</h2>
        <h3 className='text-2xl font-bold text-white font-heading'>Tạo tài khoản mới</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
        {/* Full Name */}
        <div className='space-y-3'>
          <label className='text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1'>Họ và Tên</label>
          <Input
            placeholder='Họ và tên của bạn'
            {...register('fullName')}
            className={cn(
              'h-14 bg-[#1a1a1a] border-[#2a2a2a] rounded-xl px-5 text-white placeholder:text-zinc-700 transition-all focus:ring-1 focus:ring-[#ff8c5a]/50 focus:border-[#ff8c5a]/50',
              errors.fullName && 'border-red-500/50'
            )}
          />
          {errors.fullName && <p className='text-[10px] font-bold text-red-500 uppercase px-1'>{errors.fullName.message}</p>}
        </div>

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
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <label className='text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1'>Mật mã</label>
            <div className='relative group'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...register('password')}
                className={cn(
                  'h-14 bg-[#1a1a1a] border-[#2a2a2a] rounded-xl px-5 pr-14 text-white transition-all focus:ring-1 focus:ring-[#ff8c5a]/50 focus:border-[#ff8c5a]/50',
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
          </div>

          <div className='space-y-3'>
            <label className='text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1'>Xác nhận</label>
            <Input
              type='password'
              placeholder='••••••••'
              {...register('confirmPassword')}
              className={cn(
                'h-14 bg-[#1a1a1a] border-[#2a2a2a] rounded-xl px-5 text-white transition-all focus:ring-1 focus:ring-[#ff8c5a]/50 focus:border-[#ff8c5a]/50',
                errors.confirmPassword && 'border-red-500/50'
              )}
            />
          </div>
        </div>

        {/* TOS Checkbox */}
        <div className='flex items-center gap-3 p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl'>
          <input 
            type="checkbox" 
            {...register('agreeToTOS')}
            id="agreeToTOS"
            className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0c0c0c] text-[#ff8c5a] focus:ring-[#ff8c5a]/50"
          />
          <label htmlFor="agreeToTOS" className='text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed'>
            Tôi đồng ý với các <Link href="/tos" className='text-[#ff8c5a] hover:underline'>Điều khoản Studio</Link>.
          </label>
        </div>

        {/* Submit */}
        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full h-16 bg-linear-to-r from-[#ffae8f] to-[#f97316] text-zinc-950 hover:brightness-110 font-black text-sm uppercase tracking-[0.2em] rounded-full shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50'
        >
          {isSubmitting ? 'ĐANG KHỞI TẠO...' : 'ĐĂNG KÝ NGAY'}
        </Button>
      </form>

      {/* Footer */}
      <div className='pt-8 text-center'>
        <p className='text-zinc-500 text-[10px] font-black uppercase tracking-widest'>
          Đã có tài khoản?{' '}
          <Link
            href={Routers.LOGIN}
            className='text-white hover:text-[#ff8c5a] transition-all ml-1'
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
