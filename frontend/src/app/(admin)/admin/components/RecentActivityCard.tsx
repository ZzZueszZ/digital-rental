"use client";

import { useRouter } from "next/navigation";
import { 
  History, 
  User, 
  Settings, 
  Package, 
  Trash2, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Key, 
  RefreshCw, 
  ArrowRight,
  LucideIcon 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuditLogs } from "@/services/audit";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

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
};

const ACTION_COLORS: Record<string, string> = {
  CREATE_USER: "text-emerald-600 bg-emerald-50",
  UPDATE_USER: "text-blue-600 bg-blue-50",
  LOCK_USER: "text-amber-600 bg-amber-50",
  UNLOCK_USER: "text-emerald-600 bg-emerald-50",
  BATCH_SOFT_DELETE: "text-red-600 bg-red-50",
  BATCH_RESTORE: "text-indigo-600 bg-indigo-50",
  RESET_PASSWORD: "text-amber-600 bg-amber-50",
};

export function RecentActivityCard() {
  const router = useRouter();
  const { data, isLoading } = useAuditLogs(0, 5);
  const logs = data?.data || [];

  return (
    <Card className="rounded-xl border-zinc-200 overflow-hidden bg-white shadow-sm flex flex-col h-full">
      <CardHeader className="px-5 py-4 flex flex-row items-center justify-between border-b border-zinc-50 shrink-0">
        <div>
          <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
            Hoạt động hệ thống
          </CardTitle>
        </div>
        <History className="w-6 h-6 text-zinc-200" />
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        <div className="divide-y divide-zinc-50 overflow-y-auto flex-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 sm:p-6 flex items-start gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="p-10 text-center text-zinc-400 font-medium">
              Chưa có hoạt động nào
            </div>
          ) : (
            logs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || History;
              const colorClass = ACTION_COLORS[log.action] || "text-zinc-600 bg-zinc-50";

              return (
                <div key={log.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-zinc-50/50 transition-colors group">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm", colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {log.actorEmail}
                      </p>
                      <span className="text-xs font-medium text-zinc-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">
                        {log.action}
                      </span>
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-600">
                        {log.targetType} #{log.targetId}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 shrink-0">
          <Button 
            onClick={() => router.push("/admin/audit-logs")}
            variant="ghost" 
            className="w-full h-10 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-950 hover:bg-white border border-transparent hover:border-zinc-200 transition-all gap-2"
          >
            Xem tất cả nhật ký <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
