'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Routers from '@/constants/routers';

export default function ActivationSuccessPage() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-8 overflow-hidden relative'>
      <div className='absolute inset-0 bg-linear-to-b from-red-600/5 via-transparent to-transparent pointer-events-none' />

      <div className='w-full max-w-xl bg-white border border-black/5 rounded-2xl p-10 flex flex-col items-center text-center space-y-8 shadow-dash-card relative z-10'>
        {/* Success Icon */}
        <div className='relative'>
          <div className='w-24 h-24 bg-zinc-50 border border-black/5 rounded-xl flex items-center justify-center shadow-sm'>
            <CheckCircle2 className='w-12 h-12 text-emerald-500' />
          </div>
          <div className='absolute -bottom-1 -right-1 w-10 h-10 bg-white border border-black/5 rounded-lg flex items-center justify-center shadow-md'>
            <CheckCircle2 className='w-5 h-5 text-emerald-500' />
          </div>
        </div>

        {/* Messaging */}
        <div className='space-y-3'>
          <h1 className='text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight'>Kích hoạt thành công</h1>
          <p className='text-zinc-500 font-medium text-base max-w-sm mx-auto leading-relaxed'>
            Tài khoản của bạn đã được xác thực thành công. Bạn đã sẵn sàng khám phá hệ sinh thái LensHub.
          </p>
        </div>

        {/* Primary Action */}
        <div className='w-full pt-4'>
          <Link href={Routers.LOGIN} className='w-full'>
            <Button className='w-full h-12 bg-zinc-900 text-white hover:bg-red-600 font-bold text-sm rounded-lg shadow-dash-card active:scale-[0.95] transition-all group border-none flex items-center justify-center gap-3'>
              Bắt đầu ngay
              <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </Button>
          </Link>
        </div>
      </div>

      {/* Aesthetic Decoration */}
      <div className='absolute bottom-12 w-full text-center opacity-40'>
        <p className='text-[10px] font-bold text-zinc-400'>LensHub • Studio Visuals</p>
      </div>
    </main>
  );
}
