import { http as api } from "@/lib/http";
import { 
  ReviewResponse, 
  ReviewCreateRequest, 
  ReviewUpdateRequest 
} from "@/types/review";
import { IBackendRes } from "@/types/global.d";

export const reviewService = {
  // Create review (supports Multipart if images are provided)
  create: async (data: ReviewCreateRequest, images?: File[]) => {
    if (images && images.length > 0) {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      images.forEach((image) => formData.append("images", image));
      const response = await api.post<IBackendRes<ReviewResponse>>("/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    const response = await api.post<IBackendRes<ReviewResponse>>("/reviews", data);
    return response.data;
  },

  // Update review
  update: async (id: number, data: ReviewUpdateRequest, images?: File[]) => {
    if (images) {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      images.forEach((image) => formData.append("images", image));
      const response = await api.put<IBackendRes<ReviewResponse>>(`/reviews/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }
    const response = await api.put<IBackendRes<ReviewResponse>>(`/reviews/${id}`, data);
    return response.data;
  },

  // Delete review
  delete: async (id: number) => {
    const response = await api.delete<IBackendRes<void>>(`/reviews/${id}`);
    return response.data;
  },

  // List by product (Public)
  listByProduct: async (productId: number, page = 0, size = 10) => {
    const response = await api.get<IBackendRes<ReviewResponse[]>>(`/reviews/product/${productId}`, {
      params: { page, size },
    });
    return response.data;
  },

  // List my reviews by product
  listMyReviewsByProduct: async (productId: number, page = 0, size = 10) => {
    const response = await api.get<IBackendRes<ReviewResponse[]>>(`/reviews/my/product/${productId}`, {
      params: { page, size },
    });
    return response.data;
  },

  // Admin: List all
  listAll: async (page = 0, size = 10) => {
    const response = await api.get<IBackendRes<ReviewResponse[]>>("/reviews", {
      params: { page, size },
    });
    return response.data;
  },

  // Admin: List reported
  listReported: async (page = 0, size = 10) => {
    const response = await api.get<IBackendRes<ReviewResponse[]>>("/reviews/reported", {
      params: { page, size },
    });
    return response.data;
  },

  // Admin: List hidden
  listHidden: async (page = 0, size = 10) => {
    const response = await api.get<IBackendRes<ReviewResponse[]>>("/reviews/hidden", {
      params: { page, size },
    });
    return response.data;
  },

  // Report a review
  report: async (id: number) => {
    const response = await api.post<IBackendRes<void>>(`/reviews/${id}/report`);
    return response.data;
  },

  // Admin: Hide
  hide: async (id: number) => {
    const response = await api.patch<IBackendRes<void>>(`/reviews/${id}/hide`);
    return response.data;
  },

  // Admin: Unhide
  unhide: async (id: number) => {
    const response = await api.patch<IBackendRes<void>>(`/reviews/${id}/unhide`);
    return response.data;
  },
};
