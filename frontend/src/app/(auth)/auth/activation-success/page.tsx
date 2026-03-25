'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Routers from '@/constants/routers';

export default function ActivationSuccessPage() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-white px-6 overflow-hidden relative'>
      <div className='absolute inset-0 bg-linear-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none' />

      <div className='w-full max-w-xl bg-white/80 backdrop-blur-3xl border border-zinc-100 rounded-[4rem] p-16 flex flex-col items-center text-center space-y-12 shadow-[0_50px_100px_rgba(0,0,0,0.08)] animate-in fade-in zoom-in-95 duration-1000 relative z-10'>
        {/* Success Icon */}
        <div className='relative'>
          <div className='w-28 h-28 bg-white border border-zinc-100 rounded-[2.5rem] flex items-center justify-center shadow-xl animate-bounce duration-[2000ms]'>
            <CheckCircle2 className='w-14 h-14 text-green-500' />
          </div>
          <div className='absolute -bottom-1 -right-1 w-12 h-12 bg-zinc-950 rounded-[1.2rem] flex items-center justify-center shadow-2xl'>
            <CheckCircle2 className='w-6 h-6 text-white' />
          </div>
        </div>

        {/* Messaging */}
        <div className='space-y-4'>
          <h1 className='text-5xl font-black text-zinc-950 tracking-tighter uppercase font-heading'>KÍCH HOẠT</h1>
          <p className='text-zinc-400 font-bold text-[10px] uppercase tracking-[0.4em] max-w-xs mx-auto leading-loose'>
            Tài khoản của bạn đã được xác thực thành công. Bạn đã sẵn sàng khám phá hệ sinh thái Lens Studio.
          </p>
        </div>

        {/* Primary Action */}
        <div className='w-full pt-4'>
          <Link href={Routers.LOGIN} className='w-full'>
            <Button className='w-full h-24 bg-zinc-950 text-white hover:bg-zinc-800 font-black text-xs uppercase tracking-[0.5em] rounded-full shadow-2xl active:scale-[0.98] transition-all group'>
              BẮT ĐẦU NGAY
              <ArrowRight className='ml-6 w-6 h-6 group-hover:translate-x-3 transition-transform duration-500' />
            </Button>
          </Link>
        </div>
      </div>

      {/* Aesthetic Decoration */}
      <div className='absolute bottom-12 w-full text-center opacity-20'>
        <p className='text-[10px] font-black uppercase tracking-[0.6em] text-zinc-950'>Authenticated Member of Lens Studio Hub</p>
      </div>
    </main>
  );
}
