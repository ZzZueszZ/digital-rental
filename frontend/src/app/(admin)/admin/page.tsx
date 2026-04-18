"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useAuthSession } from "@/components/auth/Guards";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Users,
  PackageOpen,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  useRevenueStats,
  useOrderStats,
  useUserSummaryStats,
  useTopProductsStats,
  useLowStockStats,
  useDailyOrderStats,
} from "@/services/dashboard";

export default function AdminDashboardPage() {
  const { user } = useAuthSession();

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

  const getImageUrl = (url: string | null) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = "http://localhost:8080";
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}${normalizedUrl}`;
  };

  return (
    <div className="flex-1 space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Hệ thống <span className="text-red-600 italic">quản trị.</span>
          </h2>
          <p className="text-zinc-500 font-medium mt-2">
            Dữ liệu vận hành thời gian thực từ LensHub Ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl border border-zinc-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold text-zinc-900">
            {user?.email?.split("@")[0]}{" "}
            <span className="text-zinc-400 mx-2">|</span>{" "}
            <span className="text-red-600">{user?.roles?.[0]}</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Doanh thu (30 ngày)",
            value: revenueData?.totalRevenue
              ? new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(revenueData.totalRevenue)
              : "0 ₫",
            trend: revenueData?.growthRate,
            icon: <DollarSign className="h-5 w-5" />,
            color: "red",
          },
          {
            title: "Người dùng mới",
            value: `+${userSummary?.newUsersToday || 0}`,
            trend: 12, // Placeholder for trend
            icon: <Users className="h-5 w-5" />,
            color: "zinc",
          },
          {
            title: "Tổng đơn hàng",
            value: orderData?.totalOrders || 0,
            trend: -5, // Placeholder for trend
            icon: <ShoppingCart className="h-5 w-5" />,
            color: "zinc",
          },
          {
            title: "Tài khoản chờ duyệt",
            value: userSummary?.pendingUsers || 0,
            trend: 0,
            icon: <AlertTriangle className="h-5 w-5" />,
            color: "amber",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="rounded-2xl border-zinc-200 bg-white overflow-hidden group hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-zinc-500">
                {stat.title}
              </CardTitle>
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-500",
                  stat.color === "red"
                    ? "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                    : stat.color === "amber"
                      ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
                      : "bg-zinc-100 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white",
                )}
              >
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-zinc-950 mb-2">
                {stat.value}
              </div>
              <div className="flex items-center gap-2">
                {stat.trend !== undefined && (
                  <span
                    className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center",
                      stat.trend >= 0
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600",
                    )}
                  >
                    {stat.trend >= 0 ? "+" : ""}
                    {stat.trend}%
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 font-medium">
                  So với kỳ trước
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-4 rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm">
          <CardHeader className="border-b border-zinc-50 pb-6 px-8 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-zinc-950">
                  Biểu đồ dòng tiền
                </CardTitle>
                <CardDescription className="font-medium text-zinc-500">
                  Hoạt động doanh thu 30 ngày qua
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 px-4 text-xs font-semibold transition-all hover:bg-zinc-900 hover:text-white"
                >
                  Xuất báo cáo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData?.dailyStats || []}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.split("-").slice(2).join("/")}
                    stroke="#a1a1aa"
                    fontSize={11}
                    fontWeight={600}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#a1a1aa"
                    fontSize={11}
                    fontWeight={600}
                    tickFormatter={(val) => `${val / 1000000}M`}
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e4e4e7"
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "0.75rem",
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                      fontWeight: "semibold",
                    }}
                    formatter={(value: any) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(value || 0))
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ef4444"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Orders Bar Chart */}
        <Card className="lg:col-span-3 rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm">
          <CardHeader className="border-b border-zinc-50 pb-6 px-8 pt-8">
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-950">
              Đơn hàng mới
            </CardTitle>
            <CardDescription className="font-medium text-zinc-500">
              Tần suất giao dịch mỗi ngày
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyOrders}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val.split("-").slice(2).join("/")}
                    stroke="#a1a1aa"
                    fontSize={11}
                    fontWeight={600}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#a1a1aa"
                    fontSize={11}
                    fontWeight={600}
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e4e4e7"
                  />
                  <RechartsTooltip cursor={{ fill: "#f4f4f5", radius: 8 }} />
                  <Bar
                    dataKey="count"
                    fill="#18181b"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                    animationDuration={2500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products Table-style */}
        <Card className="rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm">
          <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-zinc-950">
                Sản phẩm tiêu biểu
              </CardTitle>
              <CardDescription className="font-semibold text-zinc-400 text-xs mt-1">
                Top 5 thiết bị được quan tâm nhất
              </CardDescription>
            </div>
            <PackageOpen className="w-8 h-8 text-zinc-200" />
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-5">
              {topProducts.map((p, i) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between group cursor-pointer hover:bg-zinc-50 p-2 rounded-xl transition-all border border-transparent hover:border-zinc-100"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl border border-zinc-200 overflow-hidden relative flex-shrink-0">
                      {p.imageUrl ? (
                        <Image
                          src={getImageUrl(p.imageUrl)}
                          alt={p.productName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                          0{i + 1}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-md font-semibold tracking-tight text-zinc-900 group-hover:text-red-600 transition-colors">
                        {p.productName}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-medium mt-1">
                        {p.brand || "LensHub Original"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg tracking-tight text-zinc-950">
                      {p.totalSold}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-semibold">
                      Lượt thuê/mua
                    </div>
                  </div>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-sm text-zinc-500 font-medium text-center py-10">
                  Dữ liệu đang được cập nhật...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Sectors */}
        <Card className="rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 opacity-50 blur-[100px] pointer-events-none group-hover:bg-red-600/10 transition-all duration-700" />

          <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-zinc-950 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse outline outline-4 outline-red-600/20" />
                Cảnh báo kho hàng
              </CardTitle>
              <CardDescription className="font-semibold text-zinc-400 text-xs mt-2">
                Thiết bị sắp hết số lượng
              </CardDescription>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="p-8 pb-10">
            <div className="space-y-4">
              {lowStock.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 border border-zinc-100 hover:border-red-600/20 hover:bg-white hover:shadow-lg transition-all duration-500 group/item"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden flex-shrink-0 relative">
                      {p.imageUrl ? (
                        <Image
                          src={getImageUrl(p.imageUrl)}
                          alt={p.productName}
                          fill
                          className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                          <PackageOpen className="w-6 h-6 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-md font-bold text-zinc-900 tracking-tight leading-none mb-2">
                        {p.productName}
                      </p>
                      <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-bold">
                        Còn {p.stock} sản phẩm
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              ))}
              {lowStock.length === 0 && (
                <div className="text-center py-10">
                  <PackageOpen className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                    Kho hàng hiện tại an toàn
                  </p>
                </div>
              )}
            </div>

            <Button className="w-full mt-6 h-14 bg-zinc-950 text-white hover:bg-red-600 rounded-xl font-bold text-sm transition-all duration-300">
              Mở quản lý kho hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
