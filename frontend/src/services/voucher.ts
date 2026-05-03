import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { IBackendRes } from "@/types/global";
import { 
  VoucherResponse, 
  VoucherCreateRequest, 
  VoucherUpdateRequest 
} from "@/types/voucher";

const VOUCHER_URL = "/vouchers";

export const useVouchers = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["vouchers", page, size],
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<VoucherResponse[]>>(`${VOUCHER_URL}?page=${page}&size=${size}`);
      return data;
    },
  });
};

export const useVoucher = (id: number) => {
  return useQuery({
    queryKey: ["voucher", id],
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<VoucherResponse>>(`${VOUCHER_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VoucherCreateRequest) => {
      const res = await http.post<IBackendRes<VoucherResponse>>(VOUCHER_URL, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};

export const useUpdateVoucher = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VoucherUpdateRequest) => {
      const res = await http.put<IBackendRes<VoucherResponse>>(`${VOUCHER_URL}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["voucher", id] });
    },
  });
};

export const useDeactivateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await http.delete<IBackendRes<void>>(`${VOUCHER_URL}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};

export const useActivateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await http.put<IBackendRes<void>>(`${VOUCHER_URL}/${id}/activate`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
  });
};
export const useActiveVouchers = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["vouchers", "active", page, size],
    queryFn: async () => {
      const { data } = await http.get<IBackendRes<VoucherResponse[]>>(`${VOUCHER_URL}/active?page=${page}&size=${size}`);
      return data;
    },
  });
};
