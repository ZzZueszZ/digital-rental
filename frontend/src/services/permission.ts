import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { IBackendRes } from "@/types/global";
import type { PermissionResponse, PermissionRequest } from "@/types/permission";

export const PERMISSION_KEYS = {
  all: ["permissions"] as const,
  lists: () => [...PERMISSION_KEYS.all, "list"] as const,
  list: (page: number, size: number) => [...PERMISSION_KEYS.lists(), page, size] as const,
  detail: (id: number) => [...PERMISSION_KEYS.all, "detail", id] as const,
};

export const usePermissions = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: PERMISSION_KEYS.list(page, size),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<PermissionResponse[]>>("/permissions", {
        params: { page, size }
      });
      return data;
    },
  });
};

export const usePermission = (id: number) => {
  return useQuery({
    queryKey: PERMISSION_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<PermissionResponse>>(`/permissions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PermissionRequest) =>
      http.post<IBackendRes<PermissionResponse>>("/permissions", request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.lists() });
    },
  });
};

export const useUpdatePermission = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: PermissionRequest) =>
      http.put<IBackendRes<PermissionResponse>>(`/permissions/${id}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.all });
    },
  });
};

export const useDeletePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete<IBackendRes<void>>(`/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.all });
    },
  });
};
