'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ChevronLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Routers from '@/constants/routers';

export default function VerifyPage() {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (canResend) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [canResend]);

  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-8 overflow-hidden relative'>
      {/* Background Glow */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none' />

      <div className='w-full max-w-xl bg-white border border-black/5 rounded-2xl p-10 flex flex-col items-center text-center space-y-8 shadow-dash-card relative z-10'>
        {/* Icon */}
        <div className='relative'>
          <div className='w-24 h-24 bg-zinc-50 border border-black/5 rounded-xl flex items-center justify-center shadow-sm'>
            <ShieldCheck className='w-12 h-12 text-red-600' />
          </div>
          <div className='absolute -bottom-2 -right-2 w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-white'>
            <Mail className='w-5 h-5 text-white' />
          </div>
        </div>

        {/* Text */}
        <div className='space-y-3'>
          <h1 className='text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight'>Xác thực tài khoản</h1>
          <p className='text-zinc-500 font-medium text-base max-w-sm mx-auto leading-relaxed'>
            Kiểm tra hộp thư của bạn để hoàn tất quy trình kích hoạt tài khoản studio.
          </p>
        </div>

        {/* Actions */}
        <div className='w-full space-y-4 pt-4'>
          <Button 
            disabled={!canResend} 
            className='w-full h-12 bg-red-600 text-white hover:bg-zinc-900 font-bold text-sm rounded-lg shadow-dash-card active:scale-[0.95] transition-all disabled:opacity-30 border-none'
          >
            {canResend ? 'Gửi lại mã xác nhận' : `Gửi lại mã sau ${countdown}s`}
          </Button>
          
          <div className='flex justify-center'>
            <Link 
              href={Routers.LOGIN} 
              className='group flex items-center gap-3 text-zinc-500 hover:text-zinc-900 transition-all font-bold text-sm'
            >
              <ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className='absolute bottom-12 w-full text-center opacity-40'>
        <p className='text-[10px] font-bold text-zinc-400'>LensHub • Studio Visuals</p>
      </div>
    </main>
  );
}
