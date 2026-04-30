import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import type { IBackendRes } from '@/types/global';
import type { UserProfileResponse, UserProfileUpdateRequest } from '@/types/user';

export const PROFILE_KEYS = {
  all: ['profiles'] as const,
  detail: (userId: number) => ['profiles', 'detail', userId] as const,
};

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

export const getAdminUserProfile = async (userId: number) => {
  const { data } = await http.get<IBackendRes<UserProfileResponse>>(`/users/${userId}/profile`);
  return data;
};

export const updateAdminUserProfile = async (userId: number, payload: UserProfileUpdateRequest) => {
  const { data } = await http.put<IBackendRes<UserProfileResponse>>(`/users/${userId}/profile`, payload);
  return data;
};

export const uploadAdminUserAvatar = async (userId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await http.post<IBackendRes<UserProfileResponse>>(
    `/users/${userId}/profile/avatar`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const deleteAdminUserAvatar = async (userId: number) => {
  const { data } = await http.delete<IBackendRes<void>>(`/users/${userId}/profile/avatar`);
  return data;
};

// ─── HOOKS ────────────────────────────────────────────────────────────────────

export const useAdminUserProfile = (userId: number) => {
  return useQuery({
    queryKey: PROFILE_KEYS.detail(userId),
    queryFn: () => getAdminUserProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateAdminUserProfile = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserProfileUpdateRequest) => updateAdminUserProfile(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(userId) });
    },
  });
};

export const useUploadAdminUserAvatar = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAdminUserAvatar(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(userId) });
    },
  });
};

export const useDeleteAdminUserAvatar = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteAdminUserAvatar(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(userId) });
    },
  });
};
