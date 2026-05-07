"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  useSupportTicket, 
  useReplyTicket 
} from "@/services/support";
import { 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2,
  Calendar,
  History,
  ShieldCheck,
  StickyNote
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SupportTicketDialogProps {
  ticketId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportTicketDialog({ ticketId, isOpen, onClose }: SupportTicketDialogProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const { data: ticketRes, isLoading } = useSupportTicket(ticketId);
  const { mutate: replyTicket, isPending } = useReplyTicket();

  const ticket = ticketRes?.data;

  const handleReply = () => {
    if (!replyMessage.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    replyTicket(
      { 
        id: ticketId, 
        request: { replyMessage, internalNote, markAsResolved: true } 
      },
      {
        onSuccess: () => {
          toast.success("Đã gửi phản hồi thành công");
          setReplyMessage("");
          setInternalNote("");
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-dash-lg border-zinc-100 shadow-dash-overlay max-h-[90vh] flex flex-col bg-white">
        <DialogHeader className="p-6 bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl border border-zinc-200 flex items-center justify-center shadow-sm">
              <MessageSquare className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight leading-tight">
                Chi tiết yêu cầu #{ticketId}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                 <Badge variant="outline" className="rounded-full bg-white font-bold text-[10px] uppercase tracking-widest px-2.5">
                   {ticket?.subject}
                 </Badge>
                 <span className="text-[11px] font-bold text-zinc-400">
                    {ticket && format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                 </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Spinner className="w-10 h-10 border-4 border-zinc-100 border-t-red-600" />
              <p className="text-sm font-bold text-zinc-400">Đang tải thông tin...</p>
            </div>
          ) : ticket ? (
            <>
              {/* Customer Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: User, label: "Khách hàng", value: ticket.name },
                  { icon: Mail, label: "Email", value: ticket.email },
                  { icon: Phone, label: "Số điện thoại", value: ticket.phone }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-dash-md border border-zinc-100 bg-zinc-50/30">
                    <div className="flex items-center gap-2 mb-2">
                       <item.icon className="w-3.5 h-3.5 text-zinc-400" />
                       <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-[14px] font-bold text-zinc-900 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Message Block */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                   <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Nội dung yêu cầu</h3>
                </div>
                <div className="p-6 rounded-dash-md bg-zinc-50 border border-zinc-100">
                  <p className="text-[15px] font-medium text-zinc-700 leading-relaxed whitespace-pre-wrap italic">
                    &quot;{ticket.message}&quot;
                  </p>
                </div>
              </div>

              {/* Existing Reply if any */}
              {ticket.replyMessage && (
                <div className="space-y-3">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                      <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Phản hồi của hệ thống</h3>
                   </div>
                   <div className="p-6 rounded-dash-md bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                         <ShieldCheck className="w-24 h-24 text-emerald-600 rotate-12" />
                      </div>
                      <p className="text-[15px] font-bold text-emerald-900 leading-relaxed whitespace-pre-wrap">
                        {ticket.replyMessage}
                      </p>
                      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-emerald-100/50">
                         <History className="w-3.5 h-3.5 text-emerald-600/50" />
                         <span className="text-[11px] font-bold text-emerald-600/70">
                            Phản hồi bởi {ticket.processedByName || "Admin"} vào {ticket.resolvedAt && format(new Date(ticket.resolvedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                         </span>
                      </div>
                   </div>
                </div>
              )}

              {/* Internal Note if any */}
              {ticket.internalNote && (
                <div className="p-4 rounded-dash-md bg-amber-50/50 border border-amber-100/50 flex gap-3">
                  <StickyNote className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                     <p className="text-[11px] font-black text-amber-600/70 uppercase tracking-widest mb-1">Ghi chú nội bộ</p>
                     <p className="text-[13px] font-bold text-amber-900/80">{ticket.internalNote}</p>
                  </div>
                </div>
              )}

              {/* Reply Form (only if not resolved or admin wants to update) */}
              {!ticket.replyMessage && (
                <div className="space-y-6 pt-4 border-t border-zinc-100">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nội dung phản hồi khách hàng</label>
                    <Textarea 
                      placeholder="Nhập nội dung phản hồi chính thức gửi đến email khách hàng..."
                      className="min-h-[120px] bg-zinc-50 border-none rounded-dash-md px-5 py-4 font-bold text-zinc-950 placeholder:text-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 transition-all resize-none"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest ml-1">Ghi chú nội bộ (không gửi khách)</label>
                    <Input 
                      placeholder="VD: Đã liên hệ trực tiếp, cần kiểm tra thêm..."
                      className="h-12 bg-zinc-50 border-none rounded-dash-md px-5 font-bold text-zinc-950 placeholder:text-zinc-300 focus:bg-white focus:ring-2 focus:ring-zinc-100 transition-all"
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        <DialogFooter className="p-6 bg-zinc-50/50 border-t border-zinc-100">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-12 px-6 rounded-dash-sm font-black uppercase text-[12px] tracking-widest text-zinc-400 hover:text-zinc-950 transition-all"
          >
            Đóng
          </Button>
          {!ticket?.replyMessage && (
            <Button 
              disabled={isPending || !ticket}
              onClick={handleReply}
              className="h-12 px-8 rounded-dash-sm bg-zinc-950 text-white font-black uppercase text-[12px] tracking-widest hover:bg-red-600 transition-all shadow-dash-lg active:scale-95 flex gap-2"
            >
              {isPending ? (
                <Spinner className="w-4 h-4 border-2 border-white/30 border-t-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Gửi phản hồi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Spinner({ className }: { className?: string }) {
  return <div className={cn("rounded-full animate-spin", className)} />;
}
