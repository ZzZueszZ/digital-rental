'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Routers from '@/constants/routers';
import { authService } from '@/services/auth';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    email: '',
    otpCode: '',
    newPassword: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword(form);
      if (res.data.success) {
        toast.success(res.data.message || 'Thiết lập mật mã thành công.');
        router.push(Routers.LOGIN);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Xác thực không thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='min-h-screen flex items-center justify-center bg-[#0c0c0c] px-6 overflow-hidden relative'>
      <div className='absolute -top-1/4 -right-1/4 w-[1200px] h-[1200px] bg-indigo-500/5 rounded-full blur-[250px] pointer-events-none' />

      <div className='w-full max-w-2xl bg-[#121212] border border-white/5 rounded-[4rem] p-16 flex flex-col space-y-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-1000 relative z-10'>
        {/* Header */}
        <div className='space-y-6 text-center'>
          <div className='inline-flex items-center justify-center w-24 h-24 rounded-[30%] bg-zinc-900 border border-white/10 mb-2 relative overflow-hidden'>
            <div className='absolute inset-0 bg-indigo-500/10 animate-pulse' />
            <KeyRound className='w-12 h-12 text-[#ff8c5a] relative z-10' />
          </div>
          <div className='space-y-4'>
            <h1 className='text-5xl font-black text-white tracking-tighter uppercase font-heading leading-tight'>Cập Nhật</h1>
            <p className='text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed'>
              Nhập mã OTP đã nhận được và thiết lập mật mã mới cho tài khoản.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className='space-y-10'>
          {/* Identity & OTP Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-4'>
              <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1'>Tài Khoản (Email)</label>
              <Input
                placeholder='Nhập email'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className='h-16 bg-zinc-900/50 border-white/10 rounded-[1.5rem] px-6 text-white placeholder:text-zinc-600 transition-all focus:ring-2 focus:ring-[#ff8c5a] shadow-inner'
                required
              />
            </div>

            <div className='space-y-4'>
              <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1'>Mã Xác Thực (OTP)</label>
              <Input
                placeholder='6-Chữ số'
                value={form.otpCode}
                onChange={(e) => setForm({ ...form, otpCode: e.target.value })}
                className='h-16 bg-zinc-900/50 border-white/10 rounded-[1.5rem] px-6 text-white text-center font-black tracking-[0.5em] focus:ring-2 focus:ring-[#ff8c5a] shadow-inner placeholder:text-zinc-600'
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className='space-y-4'>
            <label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1'>Mật Mã Mới</label>
            <div className='relative group'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder='Nhập mật mã mới'
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className='h-16 bg-zinc-900/50 border-white/10 rounded-[1.5rem] px-6 pr-14 text-white placeholder:text-zinc-600 transition-all focus:ring-2 focus:ring-[#ff8c5a] shadow-inner'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors'
              >
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>
          </div>

          <div className='space-y-6 pt-4'>
            <Button
              type='submit'
              disabled={isSubmitting || !form.email || !form.otpCode || !form.newPassword}
              className='w-full h-20 bg-[#ff8c5a] text-black hover:bg-[#ff6b3a] font-black text-xs uppercase tracking-[0.4em] rounded-full shadow-[0_0_15px_rgba(255,140,90,0.3)] active:scale-[0.98] transition-all disabled:opacity-30'
            >
              {isSubmitting ? 'ĐANG CẬP NHẬT...' : 'HOÀN TẤT THIẾT LẬP'}
            </Button>
            
            <div className='flex justify-center'>
              <Link 
                href={Routers.LOGIN} 
                className='group flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] underline underline-offset-8 decoration-2'
              >
                <ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
                Quay Lại
              </Link>
            </div>
          </div>
        </form>
      </div>

      <div className='absolute bottom-12 w-full text-center opacity-20'>
        <p className='text-[10px] font-black uppercase tracking-[0.6em] text-white'>Lens Studio Key Management</p>
      </div>
    </main>
  );
}
