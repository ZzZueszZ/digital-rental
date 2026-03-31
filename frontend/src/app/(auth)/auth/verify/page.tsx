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
    <main className='min-h-screen flex flex-col items-center justify-center bg-[#0c0c0c] px-6 overflow-hidden relative'>
      {/* Background Glow */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff8c5a]/5 rounded-full blur-[120px] pointer-events-none' />

      <div className='w-full max-w-xl bg-zinc-900 border border-white/5 rounded-[2.5rem] p-16 flex flex-col items-center text-center space-y-12 shadow-2xl animate-in fade-in zoom-in-95 duration-1000 relative z-10'>
        {/* Icon */}
        <div className='relative'>
          <div className='w-28 h-28 bg-[#1a1a1a] border border-white/10 rounded-[2rem] flex items-center justify-center shadow-sm'>
            <ShieldCheck className='w-14 h-14 text-[#ff8c5a]' />
          </div>
          <div className='absolute -bottom-2 -right-2 w-10 h-10 bg-[#ff8c5a] rounded-2xl flex items-center justify-center shadow-2xl'>
            <Mail className='w-5 h-5 text-black' />
          </div>
        </div>

        {/* Text */}
        <div className='space-y-4'>
          <h1 className='text-4xl font-black text-white tracking-tighter uppercase font-heading'>Xác Thực</h1>
          <p className='text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] max-w-xs mx-auto leading-loose'>
            Kiểm tra hộp thư Studio để hoàn tất quy trình kích hoạt tài khoản của bạn.
          </p>
        </div>

        {/* Actions */}
        <div className='w-full space-y-6 pt-4'>
          <Button 
            disabled={!canResend} 
            className='w-full h-16 bg-[#ff8c5a] text-black hover:bg-[#ffae8f] font-black text-xs uppercase tracking-[0.4em] rounded-full shadow-2xl active:scale-[0.98] transition-all disabled:opacity-20'
          >
            {canResend ? 'Gửi Lại Mã' : `Chờ đợi ${countdown}s`}
          </Button>
          
          <div className='flex justify-center'>
            <Link 
              href={Routers.LOGIN} 
              className='group flex items-center gap-3 text-zinc-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] underline underline-offset-8 decoration-2'
            >
              <ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform' />
              Quay lại Đăng Nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className='absolute bottom-12 w-full text-center opacity-20'>
        <p className='text-[10px] font-black uppercase tracking-[0.6em] text-white'>Studio Visuals Security Protocol</p>
      </div>
    </main>
  );
}
