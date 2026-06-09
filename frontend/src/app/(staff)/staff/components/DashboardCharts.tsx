"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DailyOrderStatResponse,
  RevenueDashboardResponse,
} from "@/services/dashboard";

interface DashboardChartsProps {
  revenueData: RevenueDashboardResponse | undefined;
  dailyOrders: DailyOrderStatResponse[];
}

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid #e4e4e7",
  boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
  padding: "10px 12px",
};

export function DashboardCharts({
  revenueData,
  dailyOrders,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-7">
      <Card className="overflow-hidden rounded-xl border-zinc-200/80 bg-white shadow-none xl:col-span-4">
        <CardHeader className="border-b border-zinc-100 px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight text-zinc-950">
                Dòng tiền
              </CardTitle>
              <CardDescription className="text-sm font-medium text-zinc-500">
                Doanh thu trong 30 ngày gần nhất
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 hover:bg-zinc-950 hover:text-white"
            >
              Xuất báo cáo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="mt-2 h-[280px] w-full sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData?.dailyStats || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.16} />
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
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#a1a1aa"
                  fontSize={11}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                />
                <RechartsTooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{
                    color: "#18181b",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                  labelStyle={{
                    color: "#71717a",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-xl border-zinc-200/80 bg-white shadow-none xl:col-span-3">
        <CardHeader className="border-b border-zinc-100 px-5 py-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-zinc-950">
            Đơn hàng mới
          </CardTitle>
          <CardDescription className="text-sm font-medium text-zinc-500">
            Tần suất giao dịch mỗi ngày
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="mt-2 h-[280px] w-full sm:h-[350px]">
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
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#a1a1aa"
                  fontSize={11}
                />
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#e4e4e7"
                />
                <RechartsTooltip
                  cursor={{ fill: "#f4f4f5", radius: 8 }}
                  contentStyle={tooltipStyle}
                  itemStyle={{
                    color: "#18181b",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                  labelStyle={{
                    color: "#71717a",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#18181b"
                  radius={[6, 6, 0, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
