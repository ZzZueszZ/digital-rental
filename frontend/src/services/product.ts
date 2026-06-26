import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { uploadFileAsset } from "@/services/files";
import type { IBackendRes } from "@/types/global.d";
import type {
  ProductResponse,
  ProductCriteria,
  ProductRequest,
  ProductInfoUpdateRequest,
  ProductPriceUpdateRequest,
  GalleryImageResponse,
  PriceHistoryResponse,
} from "@/types/product";

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  lists: () => [...PRODUCT_KEYS.all, "list"] as const,
  list: (criteria: ProductCriteria, page: number, size: number) =>
    [...PRODUCT_KEYS.lists(), criteria, page, size] as const,
  trashed: (page: number, size: number) =>
    [...PRODUCT_KEYS.all, "trashed", page, size] as const,
  detail: (id: number) => [...PRODUCT_KEYS.all, "detail", id] as const,
  priceHistory: (id: number) => [...PRODUCT_KEYS.detail(id), "price-history"] as const,
};

export const useProducts = (
  criteria: ProductCriteria,
  page: number = 0,
  size: number = 10
) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(criteria, page, size),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<ProductResponse[]>>("/products", {
        params: { ...criteria, page, size },
      });
      return data;
    },
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<ProductResponse>>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      request,
      image,
    }: {
      request: ProductRequest;
      image?: File | null;
    }) => {
      const formData = new FormData();
      const mainImageAssetId = image ? (await uploadFileAsset(image, "PRODUCT_IMAGE")).id : undefined;
      
      // Append primitives
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'specifications') {
          formData.append(key, value.toString());
        }
      });

      // Append specifications as JSON string to avoid part overhead, using a unique name to bypass default binding
      if (request.specifications && request.specifications.length > 0) {
        formData.append("specificationsData", JSON.stringify(request.specifications));
      }

      // Append image
      if (image) {
        formData.append("mainImageAssetId", mainImageAssetId!);
      }

      const { data } = await http.post<IBackendRes<ProductResponse>>("/products", formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() });
    },
  });
};

export const useUpdateProductInfo = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      request,
      image,
    }: {
      request: ProductInfoUpdateRequest;
      image?: File | null;
    }) => {
      const formData = new FormData();
      const mainImageAssetId = image ? (await uploadFileAsset(image, "PRODUCT_IMAGE")).id : undefined;
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'specifications') {
          formData.append(key, value.toString());
        }
      });
      if (request.specifications && request.specifications.length > 0) {
        formData.append("specificationsData", JSON.stringify(request.specifications));
      }
      if (image) {
        formData.append("mainImageAssetId", mainImageAssetId!);
      }

      const { data } = await http.put<IBackendRes<ProductResponse>>(
        `/products/${id}/info`,
        formData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useUpdateProductPrice = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: ProductPriceUpdateRequest) => {
      const formData = new FormData();
      Object.entries(request).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const { data } = await http.put<IBackendRes<ProductResponse>>(
        `/products/${id}/price`,
        formData
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await http.delete<IBackendRes<void>>(`/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useTrashedProducts = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: PRODUCT_KEYS.trashed(page, size),
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<ProductResponse[]>>("/products/trashed", {
        params: { page, size },
      });
      return data;
    },
  });
};

export const useRestoreProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await http.put<IBackendRes<void>>(`/products/${id}/restore`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useHardDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await http.delete<IBackendRes<void>>(`/products/${id}/hard`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const usePriceHistory = (id: number, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: [...PRODUCT_KEYS.priceHistory(id), { page, size }],
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<PriceHistoryResponse[]>>(`/products/${id}/price-history`, {
        params: { page, size }
      });
      return data;
    },
    enabled: !!id,
  });
};

export const useAddGallery = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (images: File[]) => {
      const assetIds = await Promise.all(images.map(async (file) =>
        (await uploadFileAsset(file, "PRODUCT_IMAGE")).id,
      ));

      const { data } = await http.post<IBackendRes<GalleryImageResponse[]>>(
        `/products/${productId}/gallery-assets`,
        assetIds,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useDeleteGalleryImage = (productId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: number) => {
      const { data } = await http.delete<IBackendRes<void>>(`/products/${productId}/gallery/${imageId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};
