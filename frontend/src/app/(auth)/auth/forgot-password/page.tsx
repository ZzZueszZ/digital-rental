'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ChevronLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Routers from '@/constants/routers';
import { authService } from '@/services/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword({ email });
      if (res.data.success) {
        setSent(true);
        toast.success(res.data.message || 'Mã phục hồi đã được tạo.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Không thể gửi yêu cầu phục hồi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='min-h-screen flex items-center justify-center bg-white px-6 overflow-hidden relative'>
      <div className='absolute -bottom-1/4 left-1/4 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[200px] pointer-events-none' />

      <div className='w-full max-w-xl bg-white border border-zinc-100 rounded-[4rem] p-16 flex flex-col space-y-12 shadow-[0_50px_100px_rgba(0,0,0,0.06)] animate-in fade-in zoom-in-95 duration-1000 relative z-10'>
        {/* Header Section */}
        <div className='space-y-6 text-center'>
          <div className='inline-flex items-center justify-center w-24 h-24 rounded-[30%] bg-zinc-950 border border-zinc-950 mb-2 shadow-2xl'>
            <Lock className='w-12 h-12 text-white' />
          </div>
          <div className='space-y-4'>
            <h1 className='text-5xl font-black text-zinc-950 tracking-tighter uppercase font-heading'>Phục Hồi</h1>
            <p className='text-zinc-400 font-bold text-[10px] uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed'>
              Mất quyền truy cập? Hãy nhập email để thiết lập lại mật mã Studio của bạn.
            </p>
          </div>
        </div>

        {sent ? (
          <div className='flex flex-col items-center text-center space-y-10 py-4 animate-in fade-in slide-in-from-bottom-6'>
            <div className='p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem]'>
              <Mail className='w-12 h-12 text-indigo-600' />
            </div>
            <div className='space-y-2'>
              <p className='text-zinc-950 font-black text-sm uppercase tracking-widest'>Yêu cầu đã được gửi</p>
              <p className='text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed'>Kiểm tra hộp thư của bạn để lấy mã khôi phục.</p>
            </div>
            <Link href={Routers.LOGIN} className='w-full'>
              <Button className='w-full h-20 bg-zinc-950 text-white hover:bg-zinc-800 font-black text-xs uppercase tracking-[0.4em] rounded-full shadow-2xl transition-all'>
                Quay Lại Đăng Nhập
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className='space-y-10'>
            <div className='space-y-4'>
              <div className='px-2'>
                <label className='text-[10px] font-black text-zinc-400 uppercase tracking-widest'>Email Xác Minh</label>
              </div>
              <Input
                placeholder='Nhập email cá nhân'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='h-16 bg-zinc-50 border-zinc-100 rounded-[1.5rem] px-6 text-zinc-950 placeholder:text-zinc-300 transition-all focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-600/50 shadow-inner font-medium'
                required
              />
            </div>

            <div className='space-y-6 pt-4'>
              <Button
                type='submit'
                disabled={isSubmitting || !email}
                className='w-full h-20 bg-zinc-950 text-white hover:bg-zinc-800 font-black text-xs uppercase tracking-[0.4em] rounded-full shadow-2xl active:scale-[0.98] transition-all disabled:opacity-20'
              >
                {isSubmitting ? 'TIẾP NHẬN...' : 'TẠO MẬT MÃ MỚI'}
              </Button>
              
              <div className='flex justify-center'>
                <Link 
                  href={Routers.LOGIN} 
                  className='group flex items-center gap-3 text-zinc-400 hover:text-zinc-950 transition-all font-black text-[10px] uppercase tracking-[0.3em] underline underline-offset-8 decoration-2'
                >
                  <ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
                  Về Trang Chủ Hub
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className='absolute bottom-12 w-full text-center opacity-20'>
        <p className='text-[10px] font-black uppercase tracking-[0.6em] text-zinc-950'>Lens Studio Access Recovery</p>
      </div>
    </main>
  );
}
