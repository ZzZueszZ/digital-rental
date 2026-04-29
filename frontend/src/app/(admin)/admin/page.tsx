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
    <div className="flex-1 space-y-6 lg:space-y-10">
      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
            trend: 12,
            icon: <Users className="h-5 w-5" />,
            color: "zinc",
          },
          {
            title: "Tổng đơn hàng",
            value: orderData?.totalOrders || 0,
            trend: -5,
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
            className="rounded-2xl border-zinc-200 bg-white overflow-hidden group hover:shadow-2xl shadow-sm transition-all duration-500 hover:-translate-y-1 relative"
          >
            <div className={cn("absolute top-0 left-0 w-full h-1 transition-all duration-500", stat.color === "red" ? "bg-red-600 opacity-0 group-hover:opacity-100" : stat.color === "amber" ? "bg-amber-500 opacity-0 group-hover:opacity-100" : "bg-zinc-950 opacity-0 group-hover:opacity-100")} />
            <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 p-4 sm:p-5">
              <CardTitle className="text-[10px] sm:text-xs font-bold text-zinc-400 tracking-widest">
                {stat.title}
              </CardTitle>
              <div
                className={cn(
                  "p-2 sm:p-2.5 rounded-xl transition-all duration-500",
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
            <CardContent className="p-4 sm:p-5 pt-0">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mb-1 truncate">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5">
                {stat.trend !== undefined && (
                  <span
                    className={cn(
                      "text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center",
                      stat.trend >= 0
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600",
                    )}
                  >
                    {stat.trend >= 0 ? "+" : ""}
                    {stat.trend}%
                  </span>
                )}
                <span className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-tight truncate">
                  so với tháng trước
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-4 rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm">
          <CardHeader className="border-b border-zinc-50 pb-6 px-4 sm:px-8 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
                  Biểu đồ dòng tiền
                </CardTitle>
                <CardDescription className="text-sm font-medium text-zinc-500">
                  Hoạt động doanh thu 30 ngày qua
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 px-5 text-[10px] font-bold uppercase tracking-widest border-zinc-200 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all duration-300"
              >
                Xuất báo cáo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="h-[280px] sm:h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData?.dailyStats || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                    fontSize={10}
                    fontWeight={600}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#a1a1aa"
                    fontSize={10}
                    fontWeight={600}
                    tickFormatter={(val) => `${val / 1000000}M`}
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e4e4e7"
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    itemStyle={{ color: '#18181b', fontWeight: 800, fontSize: '14px' }}
                    labelStyle={{ color: '#71717a', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Orders Bar Chart */}
        <Card className="lg:col-span-3 rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm">
          <CardHeader className="border-b border-zinc-50 pb-6 px-4 sm:px-8 pt-6 sm:pt-8">
            <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
              Đơn hàng mới
            </CardTitle>
            <CardDescription className="text-sm font-medium text-zinc-500">
              Tần suất giao dịch mỗi ngày
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="h-[280px] sm:h-[350px] w-full mt-4">
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
                    fontSize={10}
                    fontWeight={600}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="#a1a1aa"
                    fontSize={10}
                    fontWeight={600}
                  />
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e4e4e7"
                  />
                  <RechartsTooltip 
                    cursor={{ fill: "#f4f4f5", radius: 8 }} 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    itemStyle={{ color: '#18181b', fontWeight: 800, fontSize: '14px' }}
                    labelStyle={{ color: '#71717a', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#18181b"
                    radius={[4, 4, 0, 0]}
                    barSize={15}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Sections Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Products */}
        <Card className="rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm">
          <CardHeader className="px-5 sm:px-8 pt-6 sm:pt-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
                Sản phẩm tiêu biểu
              </CardTitle>
            </div>
            <PackageOpen className="w-6 h-6 text-zinc-200" />
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="space-y-4 sm:space-y-5">
              {topProducts.map((p, i) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between group p-3 rounded-2xl transition-all border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 hover:shadow-sm"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-zinc-200 overflow-hidden relative flex-shrink-0 bg-white shadow-sm">
                      {p.imageUrl ? (
                        <Image
                          src={getImageUrl(p.imageUrl)}
                          alt={p.productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400">
                          {i + 1}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-sm sm:text-[15px] font-bold text-zinc-950 group-hover:text-red-600 transition-colors truncate">
                        {p.productName}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 truncate mt-0.5">
                        {p.brand}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="font-black text-md sm:text-lg text-zinc-950 leading-none">
                      {p.totalSold}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                      Đã bán
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Warning */}
        <Card className="rounded-2xl border-zinc-200 overflow-hidden bg-white shadow-sm relative group">
          <CardHeader className="px-5 sm:px-8 pt-6 sm:pt-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                Cảnh báo kho
              </CardTitle>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <div className="space-y-4">
              {lowStock.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white border border-red-100 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-300 group/item relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 pl-1">
                    <div className="w-12 h-12 rounded-xl border border-zinc-200 bg-white overflow-hidden flex-shrink-0 relative">
                      {p.imageUrl ? (
                        <Image
                          src={getImageUrl(p.imageUrl)}
                          alt={p.productName}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                          <PackageOpen className="w-5 h-5 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-bold text-zinc-950 truncate">
                        {p.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="inline-flex px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-[0.15em]">
                          Còn {p.stock}
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          Cần nhập thêm
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover/item:opacity-100 transition-all text-red-600 hover:bg-red-50 hover:text-red-700">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 h-12 sm:h-14 bg-zinc-950 text-white hover:bg-red-600 rounded-xl font-bold transition-all">
              Quản lý kho hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
