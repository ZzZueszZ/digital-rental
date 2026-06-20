import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { IBackendRes } from "@/types/global";
import { 
  CartItemResponse, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  RemoveCartItemsRequest,
  ICartRes,
  ICartItemRes
} from "@/types/cart";

export const CART_KEYS = {
  all: ["cart"] as const,
};

export const useMyCart = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: CART_KEYS.all,
    queryFn: () => http.get<ICartRes>("/carts").then(res => res.data),
    enabled: options?.enabled ?? true,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddToCartRequest) => 
      http.post<ICartItemRes>("/carts", data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCartItemRequest }) => 
      http.put<ICartItemRes>(`/carts/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => 
      http.delete<IBackendRes<void>>(`/carts/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

export const useRemoveCartItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RemoveCartItemsRequest) => 
      http.delete<IBackendRes<void>>("/carts/items", { data }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => 
      http.delete<IBackendRes<void>>("/carts/clear").then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
};
