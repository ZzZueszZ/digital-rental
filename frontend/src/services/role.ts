import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { IBackendRes } from "@/types/global";
import type { RoleResponse, RoleRequest, RoleAssignPermissionRequest } from "@/types/role";

export const ROLE_KEYS = {
  all: ["roles"] as const,
  lists: () => [...ROLE_KEYS.all, "list"] as const,
  list: (page: number, size: number) => [...ROLE_KEYS.lists(), page, size] as const,
  detail: (id: number) => [...ROLE_KEYS.all, "detail", id] as const,
};

export const useRoles = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ROLE_KEYS.list(page, size),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<RoleResponse[]>>("/roles", {
        params: { page, size }
      });
      return data;
    },
  });
};

export const useRole = (id: number) => {
  return useQuery({
    queryKey: ROLE_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<RoleResponse>>(`/roles/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RoleRequest) =>
      http.post<IBackendRes<RoleResponse>>("/roles", request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.lists() });
    },
  });
};

export const useUpdateRole = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RoleRequest) =>
      http.put<IBackendRes<RoleResponse>>(`/roles/${id}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete<IBackendRes<void>>(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
    },
  });
};

export const useAssignRolePermissions = (roleId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: RoleAssignPermissionRequest) =>
      http.post<IBackendRes<RoleResponse>>(`/roles/${roleId}/permissions`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
    },
  });
};
