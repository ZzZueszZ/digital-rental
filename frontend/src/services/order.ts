import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http as axios } from "@/lib/http";
import { 
  CheckoutRequest, 
  CheckoutFromCartRequest, 
  IOrderRes, 
  IOrderListRes,
  OrderStatus,
  PaymentStatus
} from "@/types/order";

export const orderService = {
  // USER: Checkout from specific items
  checkout: async (data: CheckoutRequest): Promise<IOrderRes> => {
    const response = await axios.post<IOrderRes>("/orders/checkout", data);
    return response.data;
  },

  // USER: Checkout from cart items
  checkoutFromCart: async (data: CheckoutFromCartRequest): Promise<IOrderRes> => {
    const response = await axios.post<IOrderRes>("/orders/checkout/carts", data);
    return response.data;
  },

  // USER: Get my orders
  getMyOrders: async (params: { 
    page?: number; 
    size?: number; 
    status?: OrderStatus; 
    paymentStatus?: PaymentStatus 
  }): Promise<IOrderListRes> => {
    const response = await axios.get<IOrderListRes>("/orders/my", { params });
    return response.data;
  },

  // USER: Get order detail
  getOrderDetail: async (id: number): Promise<IOrderRes> => {
    const response = await axios.get<IOrderRes>(`/orders/${id}`);
    return response.data;
  },

  // USER: Confirm received
  confirmReceived: async (id: number): Promise<IOrderRes> => {
    const response = await axios.post<IOrderRes>(`/orders/my/${id}/confirm-received`);
    return response.data;
  },

  // USER: Cancel own order before shipping
  cancelMyOrder: async (id: number, reason: string): Promise<IOrderRes> => {
    const response = await axios.post<IOrderRes>(`/orders/my/${id}/cancel`, { reason });
    return response.data;
  },

  // ADMIN/STAFF: Get all orders
  getAllOrders: async (params: { page?: number; size?: number }): Promise<IOrderListRes> => {
    const response = await axios.get<IOrderListRes>("/orders/admin", { params });
    return response.data;
  },

  // ADMIN/STAFF: Get order detail for admin
  getOrderForAdmin: async (id: number): Promise<IOrderRes> => {
    const response = await axios.get<IOrderRes>(`/orders/admin/${id}`);
    return response.data;
  },

  // ADMIN/STAFF: Update order status
  updateStatus: async (id: number, status: OrderStatus): Promise<IOrderRes> => {
    const response = await axios.patch<IOrderRes>(`/orders/${id}/status`, { status });
    return response.data;
  },

  // VNPAY: Create payment URL
  createVnPayUrl: async (orderId: number): Promise<{ data: string }> => {
    const response = await axios.post<{ data: string }>(`/payments/vnpay/create`, null, {
      params: { orderId }
    });
    return response.data;
  }
};

export const useMyOrders = (params: { 
  page?: number; 
  size?: number; 
  status?: OrderStatus; 
  paymentStatus?: PaymentStatus 
}) => {
  return useQuery({
    queryKey: ["orders", "my", params],
    queryFn: () => orderService.getMyOrders(params)
  });
};

export const useOrderDetail = (id: number) => {
  return useQuery({
    queryKey: ["orders", "detail", id],
    queryFn: () => orderService.getOrderDetail(id),
    enabled: !!id
  });
};

export const useConfirmReceived = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orderService.confirmReceived(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
};

export const useCancelMyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      orderService.cancelMyOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
};

export const useAllOrders = (params: { page?: number; size?: number }) => {
  return useQuery({
    queryKey: ["orders", "admin", params],
    queryFn: () => orderService.getAllOrders(params)
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) => 
      orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });
};
