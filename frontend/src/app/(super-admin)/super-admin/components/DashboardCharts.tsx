"use client";

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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  RevenueDashboardResponse,
  DailyOrderStatResponse,
} from "@/services/dashboard";

interface DashboardChartsProps {
  revenueData: RevenueDashboardResponse | undefined;
  dailyOrders: DailyOrderStatResponse[];
}

export function DashboardCharts({
  revenueData,
  dailyOrders,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-5 sm:gap-6 grid-cols-1 xl:grid-cols-7">
      {/* Revenue Area Chart */}
      <Card className="xl:col-span-4 rounded-xl border-zinc-200 overflow-hidden bg-white shadow-sm">
        <CardHeader className="border-b border-zinc-50 py-4 px-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-[22px] font-semibold tracking-tight text-zinc-950">
                Biểu đồ dòng tiền
              </CardTitle>
              <CardDescription className="text-[14px] font-medium text-zinc-500">
                Hoạt động doanh thu 30 ngày qua
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl h-10 px-5 text-[14px] font-semibold border-zinc-200 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all duration-150"
            >
              Xuất báo cáo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="h-[280px] sm:h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData?.dailyStats || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
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
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                    padding: "12px 16px",
                  }}
                  itemStyle={{
                    color: "#18181b",
                    fontWeight: 800,
                    fontSize: "14px",
                  }}
                  labelStyle={{
                    color: "#71717a",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
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
      <Card className="xl:col-span-3 rounded-xl border-zinc-200 overflow-hidden bg-white shadow-sm">
        <CardHeader className="border-b border-zinc-50 py-4 px-5">
          <CardTitle className="text-[22px] font-semibold tracking-tight text-zinc-950">
            Đơn hàng mới
          </CardTitle>
          <CardDescription className="text-[14px] font-medium text-zinc-500">
            Tần suất giao dịch mỗi ngày
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
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
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)",
                    padding: "12px 16px",
                  }}
                  itemStyle={{
                    color: "#18181b",
                    fontWeight: 800,
                    fontSize: "14px",
                  }}
                  labelStyle={{
                    color: "#71717a",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
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
  );
}
