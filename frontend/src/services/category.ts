import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { IBackendRes } from "@/types/global";
import type { 
  CategoryResponse, 
  CategoryCreateRequest, 
  CategoryUpdateRequest,
  CategoryCriteria
} from "@/types/category";

export const CATEGORY_KEYS = {
  all: ["categories"] as const,
  lists: () => [...CATEGORY_KEYS.all, "list"] as const,
  list: (criteria: CategoryCriteria, page: number, size: number) => 
    [...CATEGORY_KEYS.lists(), criteria, page, size] as const,
  deleted: (page: number, size: number) => [...CATEGORY_KEYS.all, "deleted", page, size] as const,
  detail: (id: number) => [...CATEGORY_KEYS.all, "detail", id] as const,
};

export const useCategories = (criteria: CategoryCriteria, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(criteria, page, size),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<CategoryResponse[]>>("/categories", {
        params: { ...criteria, page, size }
      });
      return data;
    },
  });
};

export const useDeletedCategories = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.deleted(page, size),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<CategoryResponse[]>>("/categories/deleted", {
        params: { page, size }
      });
      return data;
    },
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<CategoryResponse>>(`/categories/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CategoryCreateRequest) => 
      http.post<IBackendRes<CategoryResponse>>("/categories", request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
    },
  });
};

export const useUpdateCategory = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CategoryUpdateRequest) => 
      http.put<IBackendRes<CategoryResponse>>(`/categories/${id}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.delete<IBackendRes<void>>(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.put<IBackendRes<void>>(`/categories/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};
