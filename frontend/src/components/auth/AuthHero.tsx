'use client';

import Image from 'next/image';

interface AuthHeroProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

export function AuthHero({ title, subtitle, imageSrc, imageAlt }: AuthHeroProps) {
  return (
    <div className='hidden lg:flex flex-col items-start justify-center relative pl-8'>
      <div className='space-y-4 mb-8'>
        <h1 className='text-6xl font-bold tracking-tight text-white leading-[1.1]'>
          {title}
        </h1>
        <p className='text-2xl text-zinc-400 font-medium'>
          {subtitle}
        </p>
      </div>
      <div className='relative w-full max-w-lg'>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={600}
          height={500}
          className='w-full h-auto object-contain scale-110'
          priority
        />
      </div>
    </div>
  );
}

// Convenience wrappers
export function LoginHero(props: Partial<AuthHeroProps>) {
  return (
    <AuthHero
      title={props.title || 'Chào Mừng Trở Lại'}
      subtitle={props.subtitle || 'Đăng nhập vào tài khoản của bạn'}
      imageSrc={props.imageSrc || '/images/auth-login-hero.png'}
      imageAlt={props.imageAlt || 'Login illustration'}
    />
  );
}

export function RegisterHero(props: Partial<AuthHeroProps>) {
  return (
    <AuthHero
      title={props.title || 'Tạo Tài Khoản'}
      subtitle={props.subtitle || 'Bắt đầu hành trình của bạn'}
      imageSrc={props.imageSrc || '/images/auth-register-hero.png'}
      imageAlt={props.imageAlt || 'Register illustration'}
    />
  );
}
