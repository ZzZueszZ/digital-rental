"use client";

import { useState } from "react";
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  Shield,
  ExternalLink,
  Terminal,
  Cpu,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuditLogs } from "@/services/audit";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { EmptyState } from "../users/components/EmptyState";

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const { data, isLoading } = useAuditLogs(page, size);

  const logs = data?.data || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-zinc-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center shadow-sm">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-950 tracking-tight">
              Nhật ký hệ thống
            </h2>
          </div>
          <p className="text-xs text-zinc-500 font-medium ml-10.5">
            Theo dõi mọi thay đổi và hoạt động trên nền tảng
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Tìm theo email, hành động..."
            className="pl-9 h-10 rounded-xl bg-zinc-50 border-zinc-100 text-sm font-medium focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400">
                  Người thực hiện
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400">
                  Hành động
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400">
                  Đối tượng
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400">
                  Địa chỉ IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-zinc-50 rounded-xl w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="Chưa có nhật ký nào"
                      description="Hệ thống chưa ghi nhận hoạt động nào tương ứng."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">
                            {log.actorEmail}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono">
                            ID: {log.actorUserId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex px-2 py-0.5 rounded-xl bg-zinc-950 text-white text-[10px] font-semibold">
                          {log.action}
                        </span>
                        <p
                          className="text-xs text-zinc-600 font-medium line-clamp-1"
                          title={log.description}
                        >
                          {log.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-xl">
                          {log.targetType}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          #{log.targetId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-900">
                          {format(new Date(log.createdAt), "HH:mm:ss", {
                            locale: vi,
                          })}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {format(new Date(log.createdAt), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Cpu className="w-3.5 h-3.5" />
                        <span className="text-xs font-mono font-medium">
                          {log.ipAddress}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 tracking-tight">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 rounded-xl border-zinc-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 rounded-xl border-zinc-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
