'use client'

import { Loader2 } from 'lucide-react'
import { useLoadingStore } from '@/store/useLoadingStore'

export function LoadingOverlay() {
  const { isLoading } = useLoadingStore()
  
  if (!isLoading) return null

  return (
    <div className='fixed inset-0 z-100 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <Loader2 className='w-12 h-12 text-primary animate-spin' />
        <p className='text-sm font-semibold text-white tracking-widest uppercase'>Studio Visuals</p>
      </div>
    </div>
  )
}
