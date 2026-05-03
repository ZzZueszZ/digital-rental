'use client';

import { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  Truck, 
  CreditCard,
  ExternalLink,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function OrdersAdminPage() {
  const [search, setSearch] = useState('');

  // Mock data for initial design
  const orders = [
    { id: 'ORD-8921', customer: 'Nguyễn Văn A', type: 'RENTAL', total: '1.600.000 ₫', status: 'PENDING', date: '2024-04-18 14:30' },
    { id: 'ORD-8920', customer: 'Trần Thị B', type: 'SALE', total: '45.000.000 ₫', status: 'COMPLETED', date: '2024-04-18 12:15' },
    { id: 'ORD-8919', customer: 'Lê Văn C', type: 'RENTAL', total: '800.000 ₫', status: 'SHIPPING', date: '2024-04-17 09:45' },
    { id: 'ORD-8918', customer: 'Phạm Minh D', type: 'SALE', total: '12.500.000 ₫', status: 'CANCELLED', date: '2024-04-17 08:20' },
    { id: 'ORD-8917', customer: 'Hoàng Thị E', type: 'RENTAL', total: '2.400.000 ₫', status: 'OVERDUE', date: '2024-04-16 16:50' },
  ];

  return (
    <div className="flex-1 space-y-6 lg:space-y-10">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button variant="outline" className="h-12 w-full sm:w-auto px-8 rounded-xl border-zinc-200 hover:bg-zinc-50 font-semibold transition-all duration-300 gap-2 flex items-center justify-center text-sm">
          <Download className="w-5 h-5" />
          Báo cáo tháng
        </Button>
        <Button className="h-12 w-full sm:w-auto px-8 rounded-xl bg-red-600 text-white hover:bg-zinc-950 transition-all duration-300 font-semibold flex items-center justify-center gap-2 group shadow-xl shadow-red-600/20 text-sm">
          Trình quản lý thuê máy
          <ExternalLink className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Tổng đơn hàng', value: '8,245', icon: ShoppingCart, color: 'zinc' },
          { label: 'Chờ xử lý', value: '18', icon: Clock, color: 'amber' },
          { label: 'Đang giao hàng', value: '42', icon: Truck, color: 'blue' },
          { label: 'Quá hạn thuê', value: '05', icon: AlertCircle, color: 'red' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-4 sm:p-6 flex items-center gap-4">
              <div className={cn(
                "p-2.5 sm:p-3 rounded-xl",
                stat.color === 'red' ? "bg-red-50 text-red-600" :
                stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                stat.color === 'blue' ? "bg-blue-50 text-blue-600" :
                "bg-zinc-100 text-zinc-900"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-0.5">{stat.label}</p>
                <p className="text-xl font-bold text-zinc-950">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-50 p-4 sm:p-8 pt-6 sm:pt-10">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-zinc-950">Giao dịch gần đây</CardTitle>
              <div className="flex items-center gap-1 sm:gap-2 bg-zinc-100/50 p-1 rounded-lg w-full sm:w-auto overflow-x-auto no-scrollbar">
                <Button variant="ghost" size="sm" className="h-8 rounded-md bg-white shadow-xs text-xs font-semibold px-3 min-w-fit">Tất cả</Button>
                <Button variant="ghost" size="sm" className="h-8 rounded-md text-xs font-semibold px-3 text-zinc-500 min-w-fit">Thuê máy</Button>
                <Button variant="ghost" size="sm" className="h-8 rounded-md text-xs font-semibold px-3 text-zinc-500 min-w-fit">Mua đứt</Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  placeholder="Mã đơn, tên..." 
                  className="pl-11 h-12 rounded-xl border-zinc-200 bg-zinc-50/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 px-5 rounded-xl border-zinc-200 font-semibold gap-2 text-sm">
                <Filter className="w-4 h-4" />
                Bộ lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-5 text-xs font-semibold text-zinc-400">Mã đơn & Thời gian</th>
                  <th className="px-8 py-5 text-xs font-semibold text-zinc-400">Khách hàng</th>
                  <th className="px-8 py-5 text-xs font-semibold text-zinc-400">Loại</th>
                  <th className="px-8 py-5 text-xs font-semibold text-zinc-400">Tổng tiền</th>
                  <th className="px-8 py-5 text-xs font-semibold text-zinc-400">Trạng thái</th>
                  <th className="px-8 py-5 text-xs font-semibold text-zinc-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {orders.map((o) => (
                  <tr key={o.id} className="group hover:bg-zinc-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-zinc-950 tracking-tight text-sm">{o.id}</span>
                        <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {o.date}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 text-xs shadow-inner">
                          {o.customer.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-zinc-900">{o.customer}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-semibold border-none",
                        o.type === 'RENTAL' ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {o.type === 'RENTAL' ? "Thuê máy" : "Mua đứt"}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 font-bold text-zinc-950 text-sm italic">{o.total}</td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                        o.status === 'COMPLETED' ? "bg-green-50 text-green-600" :
                        o.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                        o.status === 'SHIPPING' ? "bg-blue-50 text-blue-600" :
                        o.status === 'CANCELLED' ? "bg-zinc-100 text-zinc-400" :
                        "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      )}>
                        {o.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : o.status === 'OVERDUE' ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                        {o.status === 'COMPLETED' ? "Hoàn tất" : 
                         o.status === 'PENDING' ? "Chờ xử lý" :
                         o.status === 'SHIPPING' ? "Đang giao" :
                         o.status === 'CANCELLED' ? "Đã hủy" : "Quá hạn"}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white border-transparent hover:border-zinc-100 border transition-all">
                        <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t border-zinc-50 bg-zinc-50/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CreditCard className="w-5 h-5 text-zinc-300" />
              <p className="text-xs text-zinc-400 font-semibold">Hiển thị 5 của 8,245 giao dịch</p>
            </div>
            <div className="flex gap-2">
              <Button disabled variant="outline" className="h-11 px-6 rounded-xl border-zinc-200">Trang trước</Button>
              <Button variant="outline" className="h-11 px-6 rounded-xl bg-zinc-950 text-white border-none shadow-lg shadow-zinc-950/20 hover:bg-red-600 transition-all">Tiếp theo</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
