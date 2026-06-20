"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  User,
} from "lucide-react";
import {
  SupportStatus,
  SupportSubject,
  SupportTicketResponse,
} from "@/types/support";
import { useSupportTickets, useUpdateTicketStatus } from "@/services/support";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SupportTicketDialog from "@/app/(admin)/admin/support/components/SupportTicketDialog";
import { Pagination } from "../../components/Pagination";
import { EmptyState } from "../../users/components/EmptyState";
import { SUPPORT_STATUS_CONFIG, SUPPORT_SUBJECT_LABELS } from "./supportUi";

interface SupportTicketListProps {
  status?: SupportStatus;
  keyword?: string;
  page: number;
  onPageChange: (page: number) => void;
}

interface TicketItemProps {
  ticket: SupportTicketResponse;
  onOpen: (id: number) => void;
  onUpdateStatus: (id: number, status: SupportStatus) => void;
}

function StatusChip({ status }: { status: SupportStatus }) {
  const statusCfg = SUPPORT_STATUS_CONFIG[status];
  const StatusIcon = statusCfg.icon;

  return (
    <span
      className={cn(
        "inline-flex w-fit min-w-max shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium leading-none whitespace-nowrap",
        statusCfg.color,
      )}
    >
      <StatusIcon className="h-3.5 w-3.5" />
      {statusCfg.label}
    </span>
  );
}

function SubjectChip({ subject }: { subject: SupportSubject }) {
  return (
    <Badge
      variant="outline"
      className="w-fit rounded-full border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 shadow-none"
    >
      {SUPPORT_SUBJECT_LABELS[subject]}
    </Badge>
  );
}

function TicketActionMenu({ ticket, onOpen, onUpdateStatus }: TicketItemProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 outline-none transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[100] w-56 rounded-xl border-zinc-100 bg-white p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-1.5 text-xs font-medium text-zinc-500">
            Quản lý hỗ trợ
          </DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2.5 text-zinc-700"
            onClick={() => onOpen(ticket.id)}
          >
            <Eye className="mr-2.5 h-4 w-4 text-zinc-400" />
            Xem & phản hồi
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2.5 text-blue-600 focus:bg-blue-50 focus:text-blue-600"
            onClick={() => onUpdateStatus(ticket.id, SupportStatus.IN_PROGRESS)}
          >
            <Loader2 className="mr-2.5 h-4 w-4" />
            Đang xử lý
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer rounded-xl py-2.5 text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600"
            onClick={() => onUpdateStatus(ticket.id, SupportStatus.RESOLVED)}
          >
            <CheckCircle2 className="mr-2.5 h-4 w-4" />
            Đã giải quyết
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TicketTableRow({ ticket, onOpen, onUpdateStatus }: TicketItemProps) {
  return (
    <tr
      onClick={() => onOpen(ticket.id)}
      className="group cursor-pointer border-zinc-50 transition-all duration-300 hover:bg-zinc-50/60"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200/60 bg-zinc-50 transition-colors group-hover:border-red-200">
            <User className="h-4.5 w-4.5 text-zinc-400 group-hover:text-red-600" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950 transition-colors group-hover:text-red-600">
              {ticket.name}
            </p>
            <p className="truncate text-xs font-medium text-zinc-400">
              {ticket.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <SubjectChip subject={ticket.subject} />
      </td>
      <td className="px-6 py-4 text-center">
        <StatusChip status={ticket.status} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none text-zinc-900">
              {format(new Date(ticket.createdAt), "dd/MM/yyyy", {
                locale: vi,
              })}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-400">
              {format(new Date(ticket.createdAt), "HH:mm", { locale: vi })}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <TicketActionMenu
          ticket={ticket}
          onOpen={onOpen}
          onUpdateStatus={onUpdateStatus}
        />
      </td>
    </tr>
  );
}

function TicketMobileCard({ ticket, onOpen, onUpdateStatus }: TicketItemProps) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusChip status={ticket.status} />
            <SubjectChip subject={ticket.subject} />
          </div>
          <p className="truncate text-sm font-semibold text-zinc-950">
            {ticket.name}
          </p>
          <p className="mt-1 text-xs font-medium text-zinc-400">
            #{ticket.id} •{" "}
            {format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", {
              locale: vi,
            })}
          </p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <TicketActionMenu
            ticket={ticket}
            onOpen={onOpen}
            onUpdateStatus={onUpdateStatus}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-xl bg-zinc-50/70 p-3 text-xs font-medium text-zinc-600">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-zinc-400" />
          <span className="truncate">{ticket.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-zinc-400" />
          <span>{ticket.phone || "Chưa cập nhật"}</span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-zinc-600">
        {ticket.message}
      </p>

      <button
        type="button"
        onClick={() => onOpen(ticket.id)}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        Xem chi tiết
      </button>
    </div>
  );
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

  const handleUpdateStatus = (id: number, nextStatus: SupportStatus) => {
    updateStatus({ id, status: nextStatus });
  };

  return (
    <div className="flex flex-col">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-sm font-medium text-zinc-400">
                Khách hàng
              </th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-400">
                Chủ đề
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-zinc-400">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-sm font-medium text-zinc-400">
                Ngày gửi
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-zinc-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6">
                    <div className="h-12 w-full rounded-xl bg-zinc-50" />
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title="Chưa có yêu cầu"
                    description={
                      keyword
                        ? "Không tìm thấy yêu cầu hỗ trợ nào khớp với từ khóa."
                        : "Hiện chưa có yêu cầu hỗ trợ nào."
                    }
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <TicketTableRow
                  key={ticket.id}
                  ticket={ticket}
                  onOpen={handleOpenTicket}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-4 lg:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-zinc-100 bg-zinc-50"
            />
          ))
        ) : tickets.length === 0 ? (
          <EmptyState
            title="Chưa có yêu cầu"
            description={
              keyword
                ? "Không tìm thấy yêu cầu hỗ trợ nào khớp với từ khóa."
                : "Hiện chưa có yêu cầu hỗ trợ nào."
            }
          />
        ) : (
          tickets.map((ticket) => (
            <TicketMobileCard
              key={ticket.id}
              ticket={ticket}
              onOpen={handleOpenTicket}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </div>

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
