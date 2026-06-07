"use client";

interface AuthStatusCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthStatusCard({
  icon,
  eyebrow,
  title,
  description,
  children,
}: AuthStatusCardProps) {
  return (
    <div className="w-full">
      <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
        {icon}
      </div>
      <p className="mb-2 text-sm font-medium text-red-600">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
        {title}
      </h2>
      <p className="mt-3 text-sm font-normal leading-6 text-zinc-500">
        {description}
      </p>
      <div className="mt-7">{children}</div>
    </div>
  );
}
