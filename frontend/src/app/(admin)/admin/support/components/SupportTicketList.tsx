"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Reply,
  Loader2,
  User,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  SupportStatus,
  SupportSubject,
  SupportTicketResponse,
} from "@/types/support";
import { useSupportTickets, useUpdateTicketStatus } from "@/services/support";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import SupportTicketDialog from "@/app/(admin)/admin/support/components/SupportTicketDialog";
import { Pagination } from "../../components/Pagination";
import { EmptyState } from "../../users/components/EmptyState";

const STATUS_CONFIG = {
  [SupportStatus.PENDING]: {
    color: "bg-amber-50 text-amber-600 ring-amber-500/10",
    label: "Chờ xử lý",
    icon: Clock,
  },
  [SupportStatus.IN_PROGRESS]: {
    color: "bg-blue-50 text-blue-600 ring-blue-500/10",
    label: "Đang xử lý",
    icon: Loader2,
  },
  [SupportStatus.RESOLVED]: {
    color: "bg-emerald-50 text-emerald-600 ring-emerald-500/10",
    label: "Đã giải quyết",
    icon: CheckCircle2,
  },
  [SupportStatus.CLOSED]: {
    color: "bg-zinc-50 text-zinc-500 ring-zinc-500/10",
    label: "Đã đóng",
    icon: AlertCircle,
  },
};

const SUBJECT_LABELS = {
  [SupportSubject.PRODUCT_INQUIRY]: "Sản phẩm",
  [SupportSubject.ORDER_ISSUE]: "Đơn hàng",
  [SupportSubject.PAYMENT_ISSUE]: "Thanh toán",
  [SupportSubject.TECHNICAL_SUPPORT]: "Kỹ thuật",
  [SupportSubject.OTHER]: "Khác",
};

interface SupportTicketListProps {
  status?: SupportStatus;
  keyword?: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function SupportTicketList({
  status,
  keyword,
  page,
  onPageChange,
}: SupportTicketListProps) {
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
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">
                Khách hàng
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">
                Chủ đề
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400 text-center">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400">
                Ngày gửi
              </th>
              <th className="px-6 py-4 text-[13px] font-medium text-zinc-400 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6">
                    <div className="h-12 bg-zinc-50 rounded-xl w-full" />
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title="Trống"
                    description={
                      keyword
                        ? "Không tìm thấy yêu cầu hỗ trợ nào khớp với tìm kiếm."
                        : "Hiện chưa có yêu cầu hỗ trợ nào."
                    }
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const statusCfg = STATUS_CONFIG[ticket.status];
                const StatusIcon = statusCfg.icon;

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => handleOpenTicket(ticket.id)}
                    className="group transition-all duration-300 hover:bg-zinc-50/50 cursor-pointer border-zinc-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50 shadow-sm group-hover:border-red-200 transition-colors">
                          <User className="w-4.5 h-4.5 text-zinc-400 group-hover:text-red-600" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-bold text-zinc-950 tracking-tight group-hover:text-red-600 transition-colors truncate">
                            {ticket.name}
                          </span>
                          <span className="text-[12px] text-zinc-400 font-medium truncate italic">
                            {ticket.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="rounded-xl border-zinc-200 font-bold text-[11px] px-2.5 py-1 text-zinc-600 bg-white shadow-sm ring-1 ring-zinc-950/[0.02]"
                        >
                          {SUBJECT_LABELS[ticket.subject]}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border-0 ring-1",
                          statusCfg.color,
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-zinc-900 leading-none mb-1">
                            {format(new Date(ticket.createdAt), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {format(new Date(ticket.createdAt), "HH:mm", {
                              locale: vi,
                            })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 rounded-xl hover:bg-zinc-100 inline-flex items-center justify-center outline-none transition-all duration-200">
                          <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white z-[100]"
                        >
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-bold text-zinc-500 px-3 py-1.5">
                              Quản lý hỗ trợ
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                              className="py-2.5 cursor-pointer rounded-xl text-zinc-700"
                              onClick={() => handleOpenTicket(ticket.id)}
                            >
                              <Eye className="w-4 h-4 mr-2.5 text-zinc-400" />{" "}
                              Xem & Phản hồi
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="py-2.5 cursor-pointer text-blue-600 rounded-xl focus:bg-blue-50 focus:text-blue-600"
                              onClick={() =>
                                updateStatus({
                                  id: ticket.id,
                                  status: SupportStatus.IN_PROGRESS,
                                })
                              }
                            >
                              <Loader2 className="w-4 h-4 mr-2.5" />
                              Đang xử lý
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="py-2.5 cursor-pointer text-emerald-600 rounded-xl focus:bg-emerald-50 focus:text-emerald-600"
                              onClick={() =>
                                updateStatus({
                                  id: ticket.id,
                                  status: SupportStatus.RESOLVED,
                                })
                              }
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2.5" />
                              Đã xong
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
          key={selectedTicketId}
          ticketId={selectedTicketId}
          isOpen={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedTicketId(null);
          }}
        />
      )}
    </div>
  );
}
