'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Routers from '@/constants/routers';

export default function ActivationSuccessPage() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-6 overflow-hidden relative'>
      <div className='absolute inset-0 bg-linear-to-b from-red-600/5 via-transparent to-transparent pointer-events-none' />

      <div className='w-full max-w-xl bg-white border border-zinc-200 rounded-[4rem] p-16 flex flex-col items-center text-center space-y-12 shadow-sm animate-in fade-in zoom-in-95 duration-1000 relative z-10'>
        {/* Success Icon */}
        <div className='relative'>
          <div className='w-28 h-28 bg-zinc-100 border border-zinc-200 rounded-[2.5rem] flex items-center justify-center shadow-sm animate-bounce duration-2000'>
            <CheckCircle2 className='w-14 h-14 text-green-500' />
          </div>
          <div className='absolute -bottom-1 -right-1 w-12 h-12 bg-white border border-zinc-200 rounded-[1.2rem] flex items-center justify-center shadow-md'>
            <CheckCircle2 className='w-6 h-6 text-green-500' />
          </div>
        </div>

        {/* Messaging */}
        <div className='space-y-4'>
          <h1 className='text-5xl font-black text-zinc-900 tracking-tighter uppercase font-heading'>KÍCH HOẠT</h1>
          <p className='text-zinc-500 font-bold text-[10px] uppercase tracking-[0.4em] max-w-xs mx-auto leading-loose'>
            Tài khoản của bạn đã được xác thực thành công. Bạn đã sẵn sàng khám phá hệ sinh thái Lens Studio.
          </p>
        </div>

        {/* Primary Action */}
        <div className='w-full pt-4'>
          <Link href={Routers.LOGIN} className='w-full'>
            <Button className='w-full h-24 bg-zinc-900 text-white hover:bg-black font-black text-xs uppercase tracking-[0.5em] rounded-full shadow-md active:scale-[0.98] transition-all group'>
              BẮT ĐẦU NGAY
              <ArrowRight className='ml-6 w-6 h-6 group-hover:translate-x-3 transition-transform duration-500 text-white' />
            </Button>
          </Link>
        </div>
      </div>

      {/* Aesthetic Decoration */}
      <div className='absolute bottom-12 w-full text-center opacity-40'>
        <p className='text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500'>Authenticated Member of Lens Studio Hub</p>
      </div>
    </main>
  );
}
