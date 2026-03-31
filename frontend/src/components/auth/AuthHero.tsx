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
        <h1 className='text-[3.5rem] font-bold tracking-tight text-white leading-[1.1]'>
          {title}
        </h1>
        <p className='text-2xl text-on-surface-variant font-medium'>
          {subtitle}
        </p>
      </div>
      <div 
        className='relative w-full max-w-lg overflow-hidden'
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskComposite: 'source-in',
          maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
          maskComposite: 'intersect',
        }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={600}
          height={500}
          className='w-full h-auto object-contain scale-[1.15]'
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
