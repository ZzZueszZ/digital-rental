"use client";

import { X, Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isPending?: boolean;
  submitText?: string;
  submitIcon?: LucideIcon;
  cancelText?: string;
  maxWidth?: string;
}

export function AdminFormDialog({
  open,
  onOpenChange,
  icon: Icon,
  iconClassName = "bg-zinc-950 text-white", // Default to black for general things, can override with red-600
  title,
  description,
  children,
  onSubmit,
  isPending = false,
  submitText = "Lưu thay đổi",
  submitIcon: SubmitIcon,
  cancelText = "Hủy",
  maxWidth = "max-w-lg",
}: AdminFormDialogProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm transition-all"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div 
          className={cn(
            "relative w-full bg-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300",
            maxWidth
          )}
        >

          {/* Header */}
          <div className="px-6 pt-7 pb-5 border-b border-zinc-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0", iconClassName)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-950 tracking-tight">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col max-h-[calc(100vh-140px)]">
            <div className="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Actions / Footer */}
            <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end gap-3 mt-auto">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-10 px-5 rounded-full border border-zinc-200 bg-white text-zinc-400 font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
              >
                {cancelText}
              </button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 px-6 rounded-full bg-zinc-950 hover:bg-red-600 text-white font-bold text-[11px] uppercase tracking-wider transition-all duration-300"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {SubmitIcon && <SubmitIcon className="w-4 h-4 mr-2" />}
                    {submitText}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
