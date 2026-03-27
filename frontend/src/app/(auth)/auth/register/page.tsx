'use client'

import { RegisterForm } from '@/components/auth/RegisterForm'
import { RegisterHero } from '@/components/auth/AuthHero'
import Link from 'next/link'
import Routers from '@/constants/routers'
import { ChevronLeft, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      {/* Top Navigation */}
      <div className='p-6 flex justify-between items-center'>
        <Link href={Routers.LOGIN}>
          <Button
            variant='outline'
            size='icon'
            className='rounded-full h-12 w-12 border-slate-200 hover:bg-slate-50'
          >
            <ChevronLeft className='h-6 w-6 text-slate-900' />
          </Button>
        </Link>
        <Button variant='ghost' size='icon' className='rounded-full h-12 w-12'>
          <Share2 className='h-6 w-6 text-slate-900' />
        </Button>
      </div>

      <main className='flex-1 flex items-center px-4 pb-12'>
        <div className='max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center'>
          <RegisterHero />
          <RegisterForm />
        </div>
      </main>
    </div>
  )
}
