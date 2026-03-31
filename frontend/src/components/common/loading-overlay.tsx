'use client'

import { useLoadingStore } from '@/store/loading'

/**
 * Global loading indicator for all API requests.
 */
export function LoadingOverlay() {
  const requestCount = useLoadingStore((s) => s.requestCount)

  if (requestCount <= 0) return null

  return (
    <div className='fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='flex flex-col items-center gap-5 p-8 rounded-3xl bg-zinc-900/90 border border-white/5 shadow-2xl'>
        {/* Spinner */}
        <div className='relative'>
          <div className='w-10 h-10 rounded-full border-[3px] border-white/10' />
          <div className='w-10 h-10 absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#ff8c5a] animate-spin' />
        </div>
        <p className='text-xs font-bold text-zinc-300 tracking-widest uppercase select-none'>
          Đang xử lý...
        </p>
      </div>
    </div>
  )
}
