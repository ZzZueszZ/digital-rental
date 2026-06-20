"use client";

import { useState } from "react";
import {
  History,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
  StickyNote,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useSupportTicket, useReplyTicket } from "@/services/support";
import { SUPPORT_STATUS_CONFIG, SUPPORT_SUBJECT_LABELS } from "./supportUi";

interface SupportTicketDialogProps {
  ticketId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SupportTicketDialog({
  ticketId,
  isOpen,
  onOpenChange,
}: SupportTicketDialogProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const { data: ticketRes, isLoading } = useSupportTicket(ticketId);
  const { mutate: replyTicket, isPending } = useReplyTicket();

  const ticket = ticketRes?.data;
  const statusCfg = ticket ? SUPPORT_STATUS_CONFIG[ticket.status] : null;
  const StatusIcon = statusCfg?.icon;

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    replyTicket(
      {
        id: ticketId,
        request: { replyMessage, internalNote, markAsResolved: true },
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi phản hồi thành công");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <AdminFormDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      icon={MessageSquare}
      iconClassName="bg-red-600 text-white"
      title={`Chi tiết yêu cầu #${ticketId}`}
      description={
        ticket
          ? `Yêu cầu từ ${ticket.name} • ${format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}`
          : "Đang tải thông tin..."
      }
      onSubmit={handleReply}
      isPending={isPending}
      submitText="Gửi phản hồi"
      submitIcon={Send}
      maxWidth="max-w-2xl"
      hideFooter={!!ticket?.replyMessage}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm font-medium text-zinc-500">
            Đang truy xuất dữ liệu yêu cầu...
          </p>
        </div>
      ) : ticket ? (
        <div className="space-y-6 py-2">
          <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-none"
              >
                {SUPPORT_SUBJECT_LABELS[ticket.subject]}
              </Badge>
              <span className="text-xs font-medium text-zinc-400">
                Mã số: {ticketId}
              </span>
            </div>

            {statusCfg && StatusIcon && (
              <span
                className={cn(
                  "inline-flex w-fit min-w-max shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap",
                  statusCfg.color,
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusCfg.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: User, label: "Khách hàng", value: ticket.name },
              { icon: Mail, label: "Email", value: ticket.email },
              {
                icon: Phone,
                label: "Số điện thoại",
                value: ticket.phone || "Chưa cập nhật",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-zinc-400 shadow-sm">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-zinc-400">
                    {item.label}
                  </span>
                </div>
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-red-600" />
              <h3 className="text-sm font-semibold text-zinc-900">
                Nội dung yêu cầu
              </h3>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-5">
              <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-zinc-700">
                {ticket.message}
              </p>
            </div>
          </div>

          {ticket.replyMessage && (
            <div className="space-y-3 border-t border-zinc-100 pt-5">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-semibold text-zinc-900">
                  Phản hồi của hệ thống
                </h3>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-emerald-950">
                  {ticket.replyMessage}
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-emerald-200/50 pt-4 text-xs font-medium text-emerald-700">
                  <History className="h-3.5 w-3.5" />
                  <span>
                    Phản hồi bởi {ticket.processedByName || "Hệ thống"}
                    {ticket.resolvedAt
                      ? ` • ${format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm", { locale: vi })}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {ticket.internalNote && (
            <div className="flex gap-3 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <StickyNote className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold text-amber-700">
                  Ghi chú nội bộ
                </p>
                <p className="text-sm font-medium leading-relaxed text-amber-950">
                  {ticket.internalNote}
                </p>
              </div>
            </div>
          )}

          {!ticket.replyMessage && (
            <div className="space-y-5 border-t border-zinc-100 pt-5">
              <div className="space-y-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-sm font-medium text-zinc-600">
                    Nội dung phản hồi khách hàng
                  </label>
                  <span className="text-xs font-medium text-zinc-400">
                    Nội dung này sẽ được gửi qua email.
                  </span>
                </div>
                <Textarea
                  placeholder="Nhập nội dung phản hồi chính thức gửi đến email khách hàng..."
                  className="min-h-[140px] resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium leading-relaxed text-zinc-900 shadow-none transition-all placeholder:text-zinc-400 focus:border-red-500/30 focus:ring-4 focus:ring-red-600/5"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600">
                  Ghi chú nội bộ
                </label>
                <Input
                  placeholder="Ví dụ: Đã liên hệ trực tiếp, khách đồng ý với phương án..."
                  className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-none transition-all placeholder:text-zinc-400 focus:border-red-500/30 focus:ring-4 focus:ring-red-600/5"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>
            </div>
          )}

          {ticket.replyMessage && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-950"
              >
                Đóng chi tiết
              </button>
            </div>
          )}
        </div>
      ) : null}
    </AdminFormDialog>
  );
}
