import Image from 'next/image';

interface AuthHeroProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
}

export function AuthHero({ title, subtitle, imageSrc, imageAlt }: AuthHeroProps) {
  // Extract highlight words
  const titleParts = title.split(' ');
  const highlight = titleParts.pop();
  const lead = titleParts.join(' ');

  return (
    <div className='hidden lg:flex flex-col relative h-full w-full overflow-hidden bg-black select-none'>
        {/* Immersive Background */}
        <div className='absolute inset-0 z-0'>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className='object-cover opacity-90 transition-all duration-1000 scale-105 hover:scale-100'
            priority
          />
          {/* Cinematic Vignette & Gradients */}
          <div className='absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent opacity-80' />
          <div className='absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-black/40 opacity-40' />
        </div>
        
        {/* Premium Content Box (Glassmorphism at bottom) */}
        <div className='relative z-10 mt-auto p-20 w-full'>
          <div className='max-w-2xl backdrop-blur-md bg-white/5 border border-white/10 p-10 rounded-[40px] shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000'>
            <div className='space-y-6'>
              <div className='w-12 h-1 bg-orange-500 rounded-full' />
              <h1 className='text-6xl font-black tracking-tight text-white leading-none'>
                {lead} <span className='text-orange-500 italic'>{highlight}</span>
              </h1>
              <p className='text-xl text-zinc-400 font-medium leading-relaxed max-w-lg'>
                {subtitle}
              </p>
            </div>
          </div>
          
          <div className='mt-12 flex items-center gap-10 opacity-30'>
            <p className='text-[10px] uppercase tracking-[0.4em] font-bold text-white'>Studio Visuals Pro</p>
            <div className='flex-1 h-px bg-white/20' />
            <p className='text-[10px] uppercase tracking-[0.4em] font-bold text-white'>Est. 2026</p>
          </div>
        </div>
      </div>
  );
}

// Convenience wrappers
export function LoginHero(props: Partial<AuthHeroProps>) {
  return (
    <AuthHero
      title={props.title || "Capture the infinite."}
      subtitle={props.subtitle || "Access your professional portfolio and studio tools."}
      imageSrc={props.imageSrc || "/modern_photography_hero.png"}
      imageAlt={props.imageAlt || "Professional camera lens"}
    />
  );
}

export function RegisterHero(props: Partial<AuthHeroProps>) {
  return (
    <AuthHero
      title={props.title || "Elite community join."}
      subtitle={props.subtitle || "Start your journey with premium photography gear."}
      imageSrc={props.imageSrc || "/modern_register_hero.png"}
      imageAlt={props.imageAlt || "Studio photographer"}
    />
  );
}
