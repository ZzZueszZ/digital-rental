"use client";

import { X, Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  isPending?: boolean;
  submitText?: string;
  submitIcon?: LucideIcon;
  cancelText?: string;
  maxWidth?: string;
  hideFooter?: boolean;
}

export function AdminFormDialog({
  open,
  onOpenChange,
  icon: Icon = X, // Fallback to X or similar
  iconClassName = "bg-red-600 text-white", // Default to brand red
  title,
  description,
  children,
  onSubmit = () => {},
  isPending = false,
  submitText = "Lưu thay đổi",
  submitIcon: SubmitIcon,
  cancelText = "Hủy",
  maxWidth = "max-w-lg",
  hideFooter = false,
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
            "relative w-full bg-white rounded-xl shadow-dash-overlay overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 border border-zinc-100",
            maxWidth,
          )}
        >
          {/* Header */}
          <div className="px-6 pt-7 pb-5 border-b border-zinc-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
                    iconClassName,
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
                    {title}
                  </h2>
                  {description && (
                    <p className="text-xs text-zinc-500 font-medium mt-1">
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
          <form
            onSubmit={onSubmit}
            className="flex flex-col max-h-[calc(100vh-140px)]"
          >
            <div className="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Actions / Footer */}
            {!hideFooter && (
              <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-10 px-5 rounded-xl border border-zinc-200 bg-white text-zinc-400 font-semibold text-sm hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                >
                  {cancelText}
                </button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-red-100"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2" />
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
            )}
          </form>
        </div>
      </div>
    </>
  );
}
