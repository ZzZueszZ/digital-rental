import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { IBackendRes } from "@/types/global.d";
import type {
  SupportTicketRequest,
  SupportTicketResponse,
  SupportTicketReplyRequest,
  SupportStatus,
  SupportSubject,
} from "@/types/support";

export const SUPPORT_KEYS = {
  all: ["support"] as const,
  lists: () => [...SUPPORT_KEYS.all, "list"] as const,
  list: (
    filters: {
      subject?: SupportSubject;
      status?: SupportStatus;
      processedById?: number;
      keyword?: string;
    },
    page: number,
    size: number
  ) => [...SUPPORT_KEYS.lists(), filters, page, size] as const,
  detail: (id: number) => [...SUPPORT_KEYS.all, "detail", id] as const,
};

// Public
export const useSubmitTicket = () => {
  return useMutation({
    mutationFn: async (request: SupportTicketRequest) => {
      console.log("Calling API POST /support/tickets with:", request);
      const { data } = await http.post<IBackendRes<void>>("/support/tickets", request);
      return data;
    },
  });
};

// Admin/Staff
export const useSupportTickets = (
  filters: {
    subject?: SupportSubject;
    status?: SupportStatus;
    processedById?: number;
    keyword?: string;
  },
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdAt",
  direction: string = "DESC"
) => {
  return useQuery({
    queryKey: SUPPORT_KEYS.list(filters, page, size),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<SupportTicketResponse[]>>("/admin/support/tickets", {
        params: { ...filters, page, size, sortBy, direction },
      });
      return data;
    },
  });
};

export const useSupportTicket = (id: number) => {
  return useQuery({
    queryKey: SUPPORT_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<SupportTicketResponse>>(`/admin/support/tickets/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: SupportStatus }) => {
      const { data } = await http.put<IBackendRes<void>>(`/admin/support/tickets/${id}/status`, null, {
        params: { status },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.all });
    },
  });
};

export const useReplyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, request }: { id: number; request: SupportTicketReplyRequest }) => {
      const { data } = await http.put<IBackendRes<void>>(`/admin/support/tickets/${id}/reply`, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEYS.all });
    },
  });
};
