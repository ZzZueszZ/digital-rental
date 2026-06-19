import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
  layout?: "inline" | "stacked";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  isLoading = false,
  variant = "danger",
  layout = "inline",
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "info":
        return <Info className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-red-50";
      case "warning":
        return "bg-amber-50";
      case "info":
        return "bg-zinc-50";
      default:
        return "bg-red-50";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md !p-0 !gap-0 overflow-hidden border border-zinc-100 shadow-dash-overlay rounded-xl bg-white"
      >
        <div className="p-6">
          {layout === "stacked" ? (
            <DialogHeader className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-100",
                    getIconBg(),
                  )}
                >
                  {getIcon()}
                </div>
                <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-950">
                  {title}
                </DialogTitle>
              </div>
              <DialogDescription className="space-y-4 text-sm font-normal leading-relaxed text-zinc-500">
                {description}
              </DialogDescription>
            </DialogHeader>
          ) : (
            <DialogHeader className="flex flex-col sm:flex-row sm:items-start gap-4 space-y-0 text-left">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0 self-start shadow-sm border border-zinc-100",
                  getIconBg(),
                )}
              >
                {getIcon()}
              </div>
              <div className="space-y-1.5 pt-0.5">
                <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-950">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-zinc-500 leading-relaxed">
                  {description}
                </DialogDescription>
              </div>
            </DialogHeader>
          )}
        </div>
        <DialogFooter className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex flex-row justify-end gap-3 m-0 rounded-b-xl">
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={isLoading}
                className="rounded-xl font-semibold border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-100 hover:text-zinc-950 h-10 px-5 shadow-sm transition-all"
              />
            }
          >
            {cancelText}
          </DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "rounded-xl font-semibold h-10 px-5 shadow-sm text-white transition-all",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-100"
                : variant === "warning"
                  ? "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-100"
                  : "bg-red-600 hover:bg-red-700 shadow-md shadow-red-100",
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
