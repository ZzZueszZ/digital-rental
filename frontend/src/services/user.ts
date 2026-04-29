import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import type { IBackendRes } from '@/types/global';
import type { 
  UserResponse, 
  UserCriteria, 
  UserUpdateRequest, 
  UserStatusUpdateRequest 
} from '@/types/user';

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (criteria: UserCriteria, page: number, size: number) => 
    [...USER_KEYS.lists(), criteria, page, size] as const,
  deleted: (criteria: UserCriteria, page: number, size: number) => 
    [...USER_KEYS.all, 'deleted', criteria, page, size] as const,
  detail: (id: number) => [...USER_KEYS.all, 'detail', id] as const,
};

// API calls
export const getUsers = async (criteria: UserCriteria, page = 0, size = 20) => {
  const { data } = await http.get<IBackendRes<UserResponse[]>>('/users', {
    params: { ...criteria, page, size },
  });
  return data;
};

export const getDeletedUsers = async (criteria: UserCriteria, page = 0, size = 20) => {
  const { data } = await http.get<IBackendRes<UserResponse[]>>('/users/deleted', {
    params: { ...criteria, page, size },
  });
  return data;
};

export const getUserById = async (id: number) => {
  const { data } = await http.get<IBackendRes<UserResponse>>(`/users/${id}`);
  return data;
};

export const updateStatus = async (id: number, status: string) => {
  const { data } = await http.patch<IBackendRes<UserResponse>>(`/users/${id}/status`, { status });
  return data;
};

export const lockUser = async (id: number) => {
  const { data } = await http.put<IBackendRes<UserResponse>>(`/users/${id}/lock`);
  return data;
};

export const unlockUser = async (id: number) => {
  const { data } = await http.put<IBackendRes<UserResponse>>(`/users/${id}/unlock`);
  return data;
};

export const resetPassword = async (id: number) => {
  const { data } = await http.put<IBackendRes<void>>(`/users/${id}/reset-password`);
  return data;
};

export const deleteUser = async (id: number) => {
  const { data } = await http.delete<IBackendRes<void>>(`/users/${id}`);
  return data;
};

export const restoreUser = async (id: number) => {
  const { data } = await http.put<IBackendRes<void>>(`/users/${id}/restore`);
  return data;
};

// Custom Hooks
export const useUsers = (criteria: UserCriteria, page = 0, size = 20) => {
  return useQuery({
    queryKey: USER_KEYS.list(criteria, page, size),
    queryFn: () => getUsers(criteria, page, size),
  });
};

export const useDeletedUsers = (criteria: UserCriteria, page = 0, size = 20) => {
  return useQuery({
    queryKey: USER_KEYS.deleted(criteria, page, size),
    queryFn: () => getDeletedUsers(criteria, page, size),
  });
};

export const useUserDetail = (id: number) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

export const useLockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => lockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

export const useUnlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unlockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (id: number) => resetPassword(id),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
};
