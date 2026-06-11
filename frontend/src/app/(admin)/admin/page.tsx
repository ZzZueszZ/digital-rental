"use client";

import { useState } from "react";
import { AlertTriangle, DollarSign, ShoppingCart, Users } from "lucide-react";
import {
  type RevenueMode,
  useDailyOrderStats,
  useLowStockStats,
  useOrderStats,
  useRevenueStats,
  useTopProductsStats,
  useUserSummaryStats,
} from "@/services/dashboard";
import { DashboardCharts } from "./components/DashboardCharts";
import { LowStockCard } from "./components/LowStockCard";
import { RecentActivityCard } from "./components/RecentActivityCard";
import { StatCard } from "./components/StatCard";
import { TopProductsCard } from "./components/TopProductsCard";

export default function AdminDashboardPage() {
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("total");
  const { data: revenueRes } = useRevenueStats();
  const { data: orderRes } = useOrderStats();
  const { data: userSummaryRes } = useUserSummaryStats();
  const { data: topProductsRes } = useTopProductsStats();
  const { data: lowStockRes } = useLowStockStats();
  const { data: dailyOrdersRes } = useDailyOrderStats();

  const revenueData = revenueRes?.data;
  const orderData = orderRes?.data;
  const userSummary = userSummaryRes?.data;
  const topProducts = topProductsRes?.data || [];
  const lowStock = lowStockRes?.data || [];
  const dailyOrders = dailyOrdersRes?.data || [];
  const selectedRevenue = {
    total: {
      title: "Tổng doanh thu 30 ngày",
      value: revenueData?.totalRevenue ?? 0,
      trend: revenueData?.growthRate ?? 0,
    },
    purchase: {
      title: "Doanh thu bán hàng",
      value: revenueData?.purchaseRevenue ?? 0,
      trend: revenueData?.purchaseGrowthRate ?? 0,
    },
    rental: {
      title: "Doanh thu cho thuê",
      value: revenueData?.rentalRevenue ?? 0,
      trend: revenueData?.rentalGrowthRate ?? 0,
    },
  }[revenueMode];

  return (
    <div className="flex-1 space-y-5 lg:space-y-6">
      <section className="rounded-xl border border-zinc-200/80 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[13px] font-medium text-red-600">
              Bảng điều phối
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Theo dõi vận hành Digital Rental.
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">
              Nắm nhanh doanh thu, đơn hàng, người dùng và tình trạng kho trong
              một màn hình gọn gàng.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:min-w-[320px]">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
              <p className="text-xs font-medium text-zinc-500">Đơn mua</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">
                {orderData?.totalOrders || 0}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
              <p className="text-xs font-medium text-zinc-500">Chờ duyệt</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">
                {userSummary?.pendingUsers || 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={selectedRevenue.title}
          value={new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(selectedRevenue.value)}
          trend={selectedRevenue.trend}
          icon={DollarSign}
          accent="bg-red-600"
        />
        <StatCard
          title="Người dùng mới"
          value={`+${userSummary?.newUsersToday || 0}`}
          trend={12}
          icon={Users}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Tổng đơn mua"
          value={orderData?.totalOrders || 0}
          trend={-5}
          icon={ShoppingCart}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Tài khoản chờ duyệt"
          value={userSummary?.pendingUsers || 0}
          trend={0}
          icon={AlertTriangle}
          accent="bg-amber-500"
        />
      </div>

      <DashboardCharts
        revenueData={revenueData}
        dailyOrders={dailyOrders}
        revenueMode={revenueMode}
        onRevenueModeChange={setRevenueMode}
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <LowStockCard products={lowStock} />
        <TopProductsCard products={topProducts} />
      </div>

      <RecentActivityCard />
    </div>
  );
}
