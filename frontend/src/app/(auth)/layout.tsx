'use client'

import { GuestGuard } from '@/components/auth/Guards'

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <GuestGuard>
      <div className='min-h-screen bg-zinc-950'>{children}</div>
    </GuestGuard>
  )
}
