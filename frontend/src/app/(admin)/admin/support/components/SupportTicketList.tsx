"use client";

import { useState } from "react";
import { 
  MoreHorizontal, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Reply,
  Loader2
} from "lucide-react";
import { 
  SupportStatus, 
  SupportSubject, 
  SupportTicketResponse 
} from "@/types/support";
import { 
  useSupportTickets, 
  useUpdateTicketStatus 
} from "@/services/support";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import SupportTicketDialog from "@/app/(admin)/admin/support/components/SupportTicketDialog";
import { Pagination } from "../../components/Pagination";
import { EmptyState } from "../../users/components/EmptyState";

const STATUS_CONFIG = {
  [SupportStatus.PENDING]: { color: "text-amber-600 bg-amber-50 border-amber-100", label: "Chờ xử lý", icon: Clock },
  [SupportStatus.PROCESSING]: { color: "text-blue-600 bg-blue-50 border-blue-100", label: "Đang xử lý", icon: Loader2 },
  [SupportStatus.RESOLVED]: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", label: "Đã giải quyết", icon: CheckCircle2 },
  [SupportStatus.CLOSED]: { color: "text-zinc-500 bg-zinc-50 border-zinc-100", label: "Đã đóng", icon: AlertCircle },
};

const SUBJECT_LABELS = {
  [SupportSubject.TECHNICAL]: "Kỹ thuật",
  [SupportSubject.RENTAL_PROCESS]: "Quy trình thuê",
  [SupportSubject.PAYMENT]: "Thanh toán",
  [SupportSubject.EQUIPMENT_ISSUE]: "Sự cố thiết bị",
  [SupportSubject.OTHER]: "Khác",
};

interface SupportTicketListProps {
  status?: SupportStatus;
  keyword?: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function SupportTicketList({ status, keyword, page, onPageChange }: SupportTicketListProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading } = useSupportTickets({ status, keyword }, page, 10);
  const { mutate: updateStatus } = useUpdateTicketStatus();

  const tickets = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 0;
  const totalElements = pagination?.totalElements || 0;

  const handleOpenTicket = (id: number) => {
    setSelectedTicketId(id);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50/50 border-b border-zinc-100">
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">Khách hàng</th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">Chủ đề</th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">Trạng thái</th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">Ngày gửi</th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6">
                    <div className="h-10 bg-zinc-50 rounded-xl w-full" />
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState 
                    title="Trống" 
                    description={keyword ? "Không tìm thấy yêu cầu hỗ trợ nào khớp với tìm kiếm." : "Hiện chưa có yêu cầu hỗ trợ nào."}
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const statusCfg = STATUS_CONFIG[ticket.status];
                const StatusIcon = statusCfg.icon;

                return (
                  <tr key={ticket.id} className="group hover:bg-zinc-50/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-zinc-950">{ticket.name}</span>
                        <span className="text-[12px] text-zinc-400 font-medium">{ticket.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="rounded-lg border-zinc-200 font-bold text-[11px] px-2.5 py-1 text-zinc-600 bg-white shadow-sm">
                        {SUBJECT_LABELS[ticket.subject]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold border",
                        statusCfg.color
                      )}>
                        <StatusIcon className={cn("w-3 h-3", ticket.status === SupportStatus.PROCESSING && "animate-spin")} />
                        {statusCfg.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-zinc-500">
                      {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                          onClick={() => handleOpenTicket(ticket.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-9 w-9 rounded-xl hover:bg-zinc-100 inline-flex items-center justify-center outline-none transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-zinc-100 shadow-dash-overlay p-1 w-48 bg-white z-[100]">
                            <DropdownMenuItem className="font-bold py-2.5 cursor-pointer rounded-lg" onClick={() => handleOpenTicket(ticket.id)}>
                              <Reply className="w-4 h-4 mr-2" /> Phản hồi
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="font-bold py-2.5 cursor-pointer text-blue-600 rounded-lg"
                              onClick={() => updateStatus({ id: ticket.id, status: SupportStatus.PROCESSING })}
                            >
                              <Loader2 className="w-4 h-4 mr-2" /> Đang xử lý
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="font-bold py-2.5 cursor-pointer text-emerald-600 rounded-lg"
                              onClick={() => updateStatus({ id: ticket.id, status: SupportStatus.RESOLVED })}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Đã giải quyết
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        size={10}
        onPageChange={onPageChange}
      />

      {selectedTicketId !== null && (
        <SupportTicketDialog 
          ticketId={selectedTicketId}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedTicketId(null);
          }}
        />
      )}
    </div>
  );
}
