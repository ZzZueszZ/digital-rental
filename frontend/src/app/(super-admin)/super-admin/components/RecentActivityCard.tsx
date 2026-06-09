"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Coins,
  CreditCard,
  FileCheck,
  FilePlus,
  FileText,
  History,
  Key,
  Lock,
  LucideIcon,
  Mail,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Settings,
  Trash2,
  Truck,
  Unlock,
  User,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/services/audit";
import { cn } from "@/lib/utils";

const ACTION_ICONS: Record<string, LucideIcon> = {
  CREATE_USER: User,
  UPDATE_USER: Settings,
  LOCK_USER: Lock,
  UNLOCK_USER: Unlock,
  BATCH_SOFT_DELETE: Trash2,
  BATCH_RESTORE: RotateCcw,
  RESET_PASSWORD: Key,
  UPDATE_PASSWORD: Key,
  DELETE_AVATAR: Trash2,
  UPLOAD_AVATAR: RefreshCw,
  CREATE_ORDER: FilePlus,
  SEND_OTP: Mail,
  SIGN_CONTRACT: FileCheck,
  PAY_DEPOSIT: CreditCard,
  PREPARE_RENTAL: PackageCheck,
  REJECT_RENTAL: XCircle,
  CREATE_HANDOVER_REPORT: FileText,
  COLLECT_DEPOSIT: Coins,
  HANDOVER_DEVICES: Truck,
  CREATE_RETURN_REPORT: ArrowLeftRight,
  COMPLETE_RENTAL: CheckCircle2,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_USER: "text-emerald-700 bg-emerald-50",
  UPDATE_USER: "text-blue-700 bg-blue-50",
  LOCK_USER: "text-amber-700 bg-amber-50",
  UNLOCK_USER: "text-emerald-700 bg-emerald-50",
  BATCH_SOFT_DELETE: "text-red-700 bg-red-50",
  BATCH_RESTORE: "text-indigo-700 bg-indigo-50",
  RESET_PASSWORD: "text-amber-700 bg-amber-50",
  CREATE_ORDER: "text-indigo-700 bg-indigo-50",
  SEND_OTP: "text-amber-700 bg-amber-50",
  SIGN_CONTRACT: "text-emerald-700 bg-emerald-50",
  PAY_DEPOSIT: "text-blue-700 bg-blue-50",
  PREPARE_RENTAL: "text-teal-700 bg-teal-50",
  REJECT_RENTAL: "text-red-700 bg-red-50",
  CREATE_HANDOVER_REPORT: "text-sky-700 bg-sky-50",
  COLLECT_DEPOSIT: "text-orange-700 bg-orange-50",
  HANDOVER_DEVICES: "text-emerald-700 bg-emerald-50",
  CREATE_RETURN_REPORT: "text-purple-700 bg-purple-50",
  COMPLETE_RENTAL: "text-emerald-700 bg-emerald-50",
};

export function RecentActivityCard() {
  const router = useRouter();
  const { data, isLoading } = useAuditLogs(0, 8);
  const logs = data?.data || [];

  return (
    <div className="admin-card flex h-full flex-col !p-0">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-zinc-500" />
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Hoạt động hệ thống
          </span>
        </div>
        <Button
          onClick={() => router.push("/super-admin/audit-logs")}
          variant="ghost"
          size="sm"
          className="h-8 gap-1 rounded-xl border border-transparent px-3 text-[13px] font-medium text-zinc-500 transition-colors hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
        >
          Tất cả <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="divide-y divide-zinc-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse items-start gap-3 p-3.5"
              >
                <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-zinc-50" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded-xl bg-zinc-50" />
                  <div className="h-2.5 w-2/3 rounded-xl bg-zinc-50" />
                </div>
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-sm font-medium text-zinc-400">
              Chưa có dữ liệu hoạt động
            </div>
          ) : (
            logs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || History;
              const colorClass =
                ACTION_COLORS[log.action] || "text-zinc-500 bg-zinc-50";

              return (
                <div
                  key={log.id}
                  className="group flex items-start gap-3 p-3.5 transition-colors hover:bg-zinc-50/70"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                      colorClass,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-semibold text-zinc-900">
                        {log.actorEmail}
                      </p>
                      <span className="whitespace-nowrap text-[11px] font-medium text-zinc-400">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[12px] font-medium leading-snug text-zinc-500">
                      {log.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                        {log.action.split("_").pop()}
                      </span>
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                        {log.targetType} #{log.targetId}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
