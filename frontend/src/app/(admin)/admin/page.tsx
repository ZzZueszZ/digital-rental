"use client";

import { DollarSign, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import {
  useRevenueStats,
  useOrderStats,
  useUserSummaryStats,
  useTopProductsStats,
  useLowStockStats,
  useDailyOrderStats,
} from "@/services/dashboard";
import { StatCard } from "./components/StatCard";
import { DashboardCharts } from "./components/DashboardCharts";
import { TopProductsCard } from "./components/TopProductsCard";
import { LowStockCard } from "./components/LowStockCard";
import { RecentActivityCard } from "./components/RecentActivityCard";

export default function AdminDashboardPage() {
  // Fetch data
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

  return (
    <div className="flex-1 space-y-6 lg:space-y-8">
      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Doanh thu (30 ngày)"
          value={revenueData?.totalRevenue
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(revenueData.totalRevenue)
            : "0 ₫"}
          trend={revenueData?.growthRate ?? 0}
          icon={DollarSign}
          accent="bg-red-500"
        />
        <StatCard
          title="Người dùng mới"
          value={`+${userSummary?.newUsersToday || 0}`}
          trend={12}
          icon={Users}
          accent="bg-zinc-950"
        />
        <StatCard
          title="Tổng đơn hàng"
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

      {/* Charts Section */}
      <DashboardCharts revenueData={revenueData} dailyOrders={dailyOrders} />

      {/* Bottom Grid */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Recent Activity - 2/3 width for better detail visibility */}
        <div className="xl:col-span-2">
          <RecentActivityCard />
        </div>
        
        {/* Sidebar Cards - Stacked 1/3 width */}
        <div className="xl:col-span-1 space-y-6">
          <TopProductsCard products={topProducts} />
          <LowStockCard products={lowStock} />
        </div>
      </div>
    </div>
  );
}
