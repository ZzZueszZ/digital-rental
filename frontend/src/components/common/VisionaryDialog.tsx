import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface VisionaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  showCloseButton?: boolean;
}

export function VisionaryDialog({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  children,
  maxWidth = "max-w-2xl",
  className,
  showCloseButton = true,
}: VisionaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 overflow-hidden rounded-xl border-none shadow-[0_30px_100px_rgba(0,0,0,0.1)] bg-white animate-in fade-in zoom-in-95 duration-300",
          maxWidth,
          className,
        )}
      >
        {/* Header Section */}
        <div className="px-8 py-6 md:px-10 md:py-8 flex items-center gap-6 border-b border-zinc-50 relative">
          {icon && (
            <div className="w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center text-white shrink-0 shadow-lg shadow-zinc-200">
              {icon}
            </div>
          )}
          <div className="flex-1 pr-8">
            <DialogTitle className="text-2xl font-black text-zinc-950 tracking-tight leading-tight">
              {title}
            </DialogTitle>
            {subtitle && (
              <DialogDescription className="text-sm text-zinc-400 font-bold mt-1 leading-relaxed">
                {subtitle}
              </DialogDescription>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-8 md:top-8 md:right-10 w-10 h-10 rounded-full hover:bg-zinc-50 flex items-center justify-center text-zinc-300 hover:text-zinc-950 transition-all z-20 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          )}
        </div>

        {/* Body Section */}
        <div className="px-8 py-8 md:px-10 md:py-10">{children}</div>

        {/* Footer Section */}
        {footer && (
          <div className="px-8 py-6 md:px-10 md:py-8 bg-zinc-50/30 border-t border-zinc-50 flex justify-end gap-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
