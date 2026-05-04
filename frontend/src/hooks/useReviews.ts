import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/review";
import { ReviewCreateRequest, ReviewUpdateRequest } from "@/types/review";

export const REVIEW_KEYS = {
  all: ["reviews"] as const,
  lists: () => [...REVIEW_KEYS.all, "list"] as const,
  list: (page: number, size: number) => [...REVIEW_KEYS.lists(), page, size] as const,
  reported: (page: number, size: number) => [...REVIEW_KEYS.all, "reported", page, size] as const,
  hidden: (page: number, size: number) => [...REVIEW_KEYS.all, "hidden", page, size] as const,
  product: (productId: number, page: number, size: number) => [...REVIEW_KEYS.all, "product", productId, page, size] as const,
};

export const useReviews = (page = 0, size = 10) => {
  return useQuery({
    queryKey: REVIEW_KEYS.list(page, size),
    queryFn: () => reviewService.listAll(page, size),
  });
};

export const useReportedReviews = (page = 0, size = 10) => {
  return useQuery({
    queryKey: REVIEW_KEYS.reported(page, size),
    queryFn: () => reviewService.listReported(page, size),
  });
};

export const useHiddenReviews = (page = 0, size = 10) => {
  return useQuery({
    queryKey: REVIEW_KEYS.hidden(page, size),
    queryFn: () => reviewService.listHidden(page, size),
  });
};

export const useProductReviews = (productId: number, page = 0, size = 10) => {
  return useQuery({
    queryKey: REVIEW_KEYS.product(productId, page, size),
    queryFn: () => reviewService.listByProduct(productId, page, size),
    enabled: !!productId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, images }: { data: ReviewCreateRequest; images?: File[] }) =>
      reviewService.create(data, images),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, images }: { id: number; data: ReviewUpdateRequest; images?: File[] }) =>
      reviewService.update(id, data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};

export const useHideReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewService.hide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};

export const useUnhideReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewService.unhide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};

export const useReportReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reviewService.report(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEW_KEYS.all });
    },
  });
};
