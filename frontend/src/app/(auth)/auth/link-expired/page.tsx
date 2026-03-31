'use client';

import { AlertCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Routers from '@/constants/routers';

export default function LinkExpiredPage() {
  return (
    <main className='min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6'>
      <div className='w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-10 flex flex-col items-center text-center space-y-8'>
        <div className='w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center'>
          <AlertCircle className='w-10 h-10 text-red-500' />
        </div>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-white tracking-tight'>Link Expired</h1>
          <p className='text-zinc-400 font-medium'>The activation token is no longer valid.</p>
        </div>
        <div className='w-full space-y-4'>
          <Input placeholder='Enter email to resend' className='h-14 bg-zinc-950 border-zinc-800 rounded-2xl px-6 text-white text-center' />
          <Button className='w-full h-14 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-2xl'>
            Resend Activation Link
          </Button>
          <Link href={Routers.LOGIN} className='flex items-center justify-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm'>
            <ChevronLeft className='w-4 h-4' />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
