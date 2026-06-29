"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";

interface ReviewUserAvatarProps {
  name?: string | null;
  src?: string | null;
  className?: string;
}

export function ReviewUserAvatar({
  name,
  src,
  className,
}: ReviewUserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "";
  const imageSrc = src && !imageError ? getImageUrl(src) : null;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-50 text-sm font-medium text-zinc-700",
        className,
      )}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : initial ? (
        <span>{initial}</span>
      ) : (
        <User className="h-5 w-5 text-zinc-400" />
      )}
    </div>
  );
}
