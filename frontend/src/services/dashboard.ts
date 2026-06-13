import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import type { IBackendRes } from '@/types/global';

export interface RevenueStatResponse {
  date: string;
  revenue: number;
  purchaseRevenue: number;
  rentalRevenue: number;
}
export interface RevenueDashboardResponse {
  totalRevenue: number;
  purchaseRevenue: number;
  rentalRevenue: number;
  growthRate: number;
  purchaseGrowthRate: number;
  rentalGrowthRate: number;
  dailyStats: RevenueStatResponse[];
}
export type RevenueMode = 'total' | 'purchase' | 'rental';
export interface RevenueReportFile {
  blob: Blob;
  filename: string;
}
export interface OrderStatResponse {
  totalOrders: number;
  byStatus: Record<string, number>;
}
export interface TopProductResponse {
  productId: number;
  productName: string;
  brand: string;
  imageUrl: string;
  totalSold: number;
  revenue: number;
}
export interface LowStockResponse {
  productId: number;
  productName: string;
  imageUrl: string;
  stock: number;
}
export interface DailyOrderStatResponse {
  date: string;
  count: number;
}
export interface UserStatResponse {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  disabledUsers: number;
  newUsersToday: number;
}

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  revenue: () => [...DASHBOARD_KEYS.all, 'revenue'] as const,
  orders: () => [...DASHBOARD_KEYS.all, 'orders'] as const,
  topProducts: () => [...DASHBOARD_KEYS.all, 'topProducts'] as const,
  lowStock: () => [...DASHBOARD_KEYS.all, 'lowStock'] as const,
  dailyOrders: () => [...DASHBOARD_KEYS.all, 'dailyOrders'] as const,
  users: () => [...DASHBOARD_KEYS.all, 'users'] as const,
};

// API calls
export const getRevenueStats = async () => {
  const { data } = await http.get<IBackendRes<RevenueDashboardResponse>>('/dashboard/revenue');
  return data;
};

export const exportRevenueReport = async (
  type: RevenueMode = 'total',
): Promise<RevenueReportFile> => {
  const response = await http.get<Blob>('/dashboard/revenue/export', {
    params: { type },
    responseType: 'blob',
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  });

  return {
    blob: response.data,
    filename: resolveDownloadFilename(
      response.headers['content-disposition'],
      `revenue-report-${type}.xlsx`,
    ),
  };
};

const resolveDownloadFilename = (
  contentDisposition: string | undefined,
  fallback: string,
) => {
  if (!contentDisposition) return fallback;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] || fallback;
};

export const getOrderStats = async () => {
  const { data } = await http.get<IBackendRes<OrderStatResponse>>('/dashboard/orders/summary');
  return data;
};

export const getTopSellingProducts = async () => {
  const { data } = await http.get<IBackendRes<TopProductResponse[]>>('/dashboard/top-products?limit=5');
  return data;
};

export const getLowStockProducts = async () => {
  const { data } = await http.get<IBackendRes<LowStockResponse[]>>('/dashboard/low-stock?threshold=10');
  return data;
};

export const getDailyOrderStats = async () => {
  const { data } = await http.get<IBackendRes<DailyOrderStatResponse[]>>('/dashboard/orders/daily-chart');
  return data;
};

export const getUserStats = async () => {
  const { data } = await http.get<IBackendRes<UserStatResponse>>('/dashboard/users/summary');
  return data;
};

// Custom Hooks
export const useRevenueStats = () => useQuery({ queryKey: DASHBOARD_KEYS.revenue(), queryFn: getRevenueStats });
export const useOrderStats = () => useQuery({ queryKey: DASHBOARD_KEYS.orders(), queryFn: getOrderStats });
export const useTopProductsStats = () => useQuery({ queryKey: DASHBOARD_KEYS.topProducts(), queryFn: getTopSellingProducts });
export const useLowStockStats = () => useQuery({ queryKey: DASHBOARD_KEYS.lowStock(), queryFn: getLowStockProducts });
export const useDailyOrderStats = () => useQuery({ queryKey: DASHBOARD_KEYS.dailyOrders(), queryFn: getDailyOrderStats });
export const useUserSummaryStats = () => useQuery({ queryKey: DASHBOARD_KEYS.users(), queryFn: getUserStats });
