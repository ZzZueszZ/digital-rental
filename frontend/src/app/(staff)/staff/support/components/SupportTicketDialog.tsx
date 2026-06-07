"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Calendar,
  History,
  ShieldCheck,
  StickyNote,
  User,
  Phone,
  Mail,
  Loader2,
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
      iconClassName="bg-red-600 text-white shadow-lg shadow-red-100"
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
      hideFooter={!!ticket?.replyMessage} // Hide default footer if already replied
    >
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-red-600" />
          <p className="text-sm font-bold text-zinc-400 italic">
            Đang truy xuất dữ liệu yêu cầu...
          </p>
        </div>
      ) : ticket ? (
        <div className="space-y-8 py-2">
          {/* Header Info with Badge */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-xl bg-zinc-50 border-zinc-200 font-bold text-xs px-2.5 py-1 text-zinc-600"
              >
                {ticket.subject}
              </Badge>
              <div className="w-1 h-1 rounded-full bg-zinc-300" />
              <span className="text-xs font-bold text-zinc-400">
                Mã số: {ticketId}
              </span>
            </div>
            <Badge
              className={cn(
                "rounded-full font-bold text-xs px-3 py-1",
                ticket.status === "PENDING"
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  : ticket.status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                    : ticket.status === "RESOLVED"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-100",
              )}
            >
              {ticket.status === "PENDING"
                ? "Chờ xử lý"
                : ticket.status === "IN_PROGRESS"
                  ? "Đang xử lý"
                  : ticket.status === "RESOLVED"
                    ? "Đã giải quyết"
                    : ticket.status}
            </Badge>
          </div>

          {/* Customer Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: User, label: "Khách hàng", value: ticket.name },
              { icon: Mail, label: "Email", value: ticket.email },
              { icon: Phone, label: "Số điện thoại", value: ticket.phone },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-zinc-950/5 bg-zinc-50/50 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-xl bg-white shadow-dash-card flex items-center justify-center">
                    <item.icon className="w-3 h-3 text-zinc-400" />
                  </div>
                  <span className="text-xs font-bold text-zinc-400">
                    {item.label}
                  </span>
                </div>
                <p className="text-[14px] font-bold text-zinc-900 truncate">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Request Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 ml-1">
              <div className="w-1.5 h-6 bg-red-600 rounded-full" />
              <h3 className="text-sm font-bold text-zinc-900">
                Nội dung yêu cầu
              </h3>
            </div>
            <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-950/5 shadow-inner">
              <p className="text-[15px] font-medium text-zinc-700 leading-relaxed whitespace-pre-wrap italic opacity-90">
                &quot;{ticket.message}&quot;
              </p>
            </div>
          </div>

          {/* System Response */}
          {ticket.replyMessage && (
            <div className="space-y-3 pt-4 border-t border-zinc-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 ml-1">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Phản hồi của hệ thống
                </h3>
              </div>
              <div className="p-6 rounded-xl bg-emerald-50/50 border border-emerald-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                  <ShieldCheck className="w-32 h-32 text-emerald-600 rotate-12" />
                </div>
                <p className="text-[15px] font-bold text-emerald-950 leading-relaxed whitespace-pre-wrap relative z-10">
                  {ticket.replyMessage}
                </p>
                <div className="mt-5 flex items-center gap-3 pt-5 border-t border-emerald-200/30 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <History className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600/80">
                    Phản hồi bởi{" "}
                    <span className="text-emerald-700 font-bold">
                      {ticket.processedByName || "Hệ thống"}
                    </span>{" "}
                    vào{" "}
                    {ticket.resolvedAt &&
                      format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Internal Note */}
          {ticket.internalNote && (
            <div className="p-4 rounded-xl bg-amber-50/30 border border-amber-200/30 flex gap-4 animate-in fade-in duration-700">
              <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center shrink-0">
                <StickyNote className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-600 mb-1.5">
                  Ghi chú nội bộ
                </p>
                <p className="text-[13px] font-bold text-amber-900/80 italic leading-snug">
                  {ticket.internalNote}
                </p>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {!ticket.replyMessage && (
            <div className="space-y-6 pt-4 border-t border-zinc-100">
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-zinc-400">
                    Nội dung phản hồi khách hàng
                  </label>
                  <span className="text-[10px] font-bold text-zinc-300 italic">
                    * Nội dung này sẽ được gửi qua email
                  </span>
                </div>
                <Textarea
                  placeholder="Nhập nội dung phản hồi chính thức gửi đến email khách hàng..."
                  className="min-h-[140px] rounded-xl bg-zinc-50/50 border border-zinc-950/5 px-5 py-4 font-semibold text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-red-600/30 focus:ring-4 focus:ring-red-600/5 transition-all duration-300 resize-none shadow-dash-card leading-relaxed"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 ml-1">
                  Ghi chú nội bộ (không gửi khách)
                </label>
                <Input
                  placeholder="VD: Đã liên hệ trực tiếp, khách hàng đồng ý với phương án..."
                  className="h-12 rounded-xl bg-zinc-50/50 border border-zinc-950/5 px-5 font-semibold text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-red-600/30 focus:ring-4 focus:ring-red-600/5 transition-all duration-300 shadow-dash-card"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Close button if already replied */}
          {ticket.replyMessage && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-11 px-8 rounded-xl border border-zinc-200 bg-white text-zinc-400 font-bold text-sm hover:bg-zinc-50 hover:text-zinc-950 transition-all duration-200"
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
