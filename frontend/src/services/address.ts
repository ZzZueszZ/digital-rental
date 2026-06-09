import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { IBackendRes } from "@/types/global";
import { 
  ShippingAddressResponse, 
  ShippingAddressRequest, 
  IAddressesRes, 
  IAddressRes 
} from "@/types/address";

export const ADDRESS_KEYS = {
  all: ["addresses"] as const,
  mine: () => [...ADDRESS_KEYS.all, "mine"] as const,
  user: (userId: number) => [...ADDRESS_KEYS.all, "user", userId] as const,
};

export const useMyAddresses = () => {
  return useQuery({
    queryKey: ADDRESS_KEYS.mine(),
    queryFn: () => http.get<IAddressesRes>("/addresses").then(res => res.data),
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShippingAddressRequest) => 
      http.post<IAddressRes>("/addresses", data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.mine() });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShippingAddressRequest }) => 
      http.put<IAddressRes>(`/addresses/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.mine() });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      http.delete<IBackendRes<void>>(`/addresses/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.mine() });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      http.patch<IAddressRes>(`/addresses/${id}/default`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.mine() });
    },
  });
};

// Admin hooks
export const useUserAddresses = (userId: number) => {
  return useQuery({
    queryKey: ADDRESS_KEYS.user(userId),
    queryFn: () => http.get<IAddressesRes>(`/addresses/user/${userId}`).then(res => res.data),
    enabled: !!userId,
  });
};

export const useCreateUserAddress = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ShippingAddressRequest) => 
      http.post<IAddressRes>(`/addresses/user/${userId}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.user(userId) });
    },
  });
};
export const useUpdateUserAddress = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShippingAddressRequest }) => 
      http.put<IAddressRes>(`/addresses/${id}/user/${userId}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.user(userId) });
    },
  });
};

export const useDeleteUserAddress = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      http.delete<IBackendRes<void>>(`/addresses/${id}/user/${userId}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.user(userId) });
    },
  });
};

export const useSetDefaultUserAddress = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      http.patch<IAddressRes>(`/addresses/${id}/default/user/${userId}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_KEYS.user(userId) });
    },
  });
};
