import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { IBackendRes } from "@/types/global.d";
import { InventoryAuditResponse, AdjustStockRequest } from "@/types/inventory";

export const INVENTORY_KEYS = {
  all: ["inventory"] as const,
  logs: (params: { productId?: number; page?: number; size?: number }) => [...INVENTORY_KEYS.all, "logs", params] as const,
};

export const useInventoryLogs = (productId?: number, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: INVENTORY_KEYS.logs({ productId, page, size }),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<InventoryAuditResponse[]>>("/inventory/audit-logs", {
        params: { productId, page, size },
      });
      return data;
    },
  });
};

export const useAdjustStock = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: AdjustStockRequest) => {
      const { data } = await http.put<IBackendRes<InventoryAuditResponse>>(`/inventory/products/${productId}/stock`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Also invalidate product detail to update quantity
    },
  });
};
