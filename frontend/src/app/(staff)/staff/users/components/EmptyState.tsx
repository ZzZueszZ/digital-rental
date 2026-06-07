"use client";

import { LucideIcon, Aperture } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export function EmptyState({
  title = "Không tìm thấy kết quả",
  description = "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm",
  actionText,
  onAction,
  icon: Icon = Aperture,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="w-16 h-16 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
        <Icon className="w-7 h-7 text-zinc-300" />
      </div>
      <p className="text-[14px] font-bold text-zinc-400">{title}</p>
      <p className="text-[13px] text-zinc-300 mb-2">{description}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white text-[13px] font-bold hover:bg-red-600 transition-all shadow-lg shadow-zinc-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
