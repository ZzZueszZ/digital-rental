import { LoginForm } from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className='min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0c0c0c]'>
      {/* Left: Industrial Photography Hero */}
      <div className='hidden lg:block relative overflow-hidden'>
        <Image
          src='/modern_photography_hero.png'
          alt='Studio Visuals Lens'
          fill
          className='object-cover grayscale brightness-75'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black/20 to-[#0c0c0c]' />
      </div>

      {/* Right: Authentication Form */}
      <div className='flex items-center justify-center p-8 md:p-16'>
        <LoginForm />
      </div>
    </main>
  );
}
