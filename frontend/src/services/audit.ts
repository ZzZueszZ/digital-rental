import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { AuditLogResponse } from "@/types/audit";

export const useAuditLogs = (page: number = 0, size: number = 10) => {
  return useQuery<AuditLogResponse>({
    queryKey: ["audit-logs", page, size],
    queryFn: async () => {
      const response = await http.get(`/audit-logs`, {
        params: { page, size },
      });
      return response.data;
    },
  });
};
