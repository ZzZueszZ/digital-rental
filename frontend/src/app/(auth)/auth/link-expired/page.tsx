'use client';

import { AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Routers from '@/constants/routers';

export default function LinkExpiredPage() {
  return (
    <main className='min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6'>
      <div className='w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-10 flex flex-col items-center text-center space-y-8 shadow-sm'>
        <div className='w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center'>
          <AlertCircle className='w-10 h-10 text-red-500' />
        </div>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-zinc-900 tracking-tight'>Link Expired</h1>
          <p className='text-zinc-500 font-medium'>The activation token is no longer valid.</p>
        </div>
        <div className='w-full space-y-4'>
          <Input placeholder='Enter email to resend' className='h-14 bg-white border-zinc-200 shadow-sm rounded-2xl px-6 text-zinc-900 text-center placeholder:text-zinc-500' />
          <Button className='w-full h-14 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 font-bold rounded-2xl shadow-sm'>
            Resend Activation Link
          </Button>
          <Link href={Routers.LOGIN} className='flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm'>
            <ChevronLeft className='w-4 h-4' />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
