'use client';

import { useState } from 'react';
import { 
  Tag, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Ticket,
  Percent,
  Calendar,
  MoreHorizontal,
  ChevronRight,
  Gift
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function VouchersAdminPage() {
  const [search, setSearch] = useState('');

  // Mock data for initial design
  const vouchers = [
    { id: 1, code: 'LENS-NEW-2024', discount: '15%', type: 'PERCENT', status: 'ACTIVE', expiry: '2024-12-31', used: 45, limit: 100 },
    { id: 2, code: 'SUMMER-VIBE', discount: '500.000 ₫', type: 'FIXED', status: 'ACTIVE', expiry: '2024-06-30', used: 120, limit: 200 },
    { id: 3, code: 'VIP-GIFT-X', discount: '30%', type: 'PERCENT', status: 'EXPIRED', expiry: '2024-03-01', used: 50, limit: 50 },
    { id: 4, code: 'FREESHIP-247', discount: '50.000 ₫', type: 'SHIPPING', status: 'ACTIVE', expiry: '2024-12-31', used: 892, limit: 1000 },
    { id: 5, code: 'WELCOME-BACK', discount: '10%', type: 'PERCENT', status: 'PAUSED', expiry: '2024-09-15', used: 12, limit: 500 },
  ];

  return (
    <div className="flex-1 space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Ưu đãi & <span className="text-red-600 italic">Vouchers.</span>
          </h2>
          <p className="text-zinc-500 font-medium mt-2">Chiến dịch marketing, mã giảm giá và tri ân khách hàng.</p>
        </div>
        <Button className="h-14 px-8 rounded-xl bg-red-600 text-white hover:bg-zinc-950 transition-all duration-300 font-bold flex items-center gap-2 group shadow-xl shadow-red-600/20">
          <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
          Tạo mã giảm giá mới
        </Button>
      </div>

      {/* Campaign Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-950 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Percent className="w-48 h-48 text-white rotate-12" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-red-600 text-white border-none rounded-full px-4 mb-6">Running Now</Badge>
            <h3 className="text-3xl font-bold text-white mb-2 italic">Mùa cưới rực rỡ</h3>
            <p className="text-zinc-400 font-medium mb-8 max-w-sm">Giảm 20% cho tất cả các combo máy ảnh cưới Canon/Sony trong tháng 5.</p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800" />
                ))}
              </div>
              <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">124 users active</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-8 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Gift className="w-48 h-48 text-zinc-950 -rotate-12" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-zinc-100 text-zinc-900 border-none rounded-full px-4 mb-6 uppercase tracking-tighter font-black">Upcoming</Badge>
            <h3 className="text-3xl font-bold text-zinc-950 mb-2 italic">Giải cứu mùa hè</h3>
            <p className="text-zinc-500 font-medium mb-8 max-w-sm">Tặng gói bảo hiểm thiết bị trị giá 2.000.000đ cho mỗi đơn thuê trên 7 ngày.</p>
            <Button variant="outline" className="rounded-xl h-12 px-6 font-bold border-zinc-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">Thiết lập ngay</Button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-50 p-8 pt-10">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-lg shadow-zinc-950/20">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-zinc-950">Quản lý mã (Voucher Codes)</CardTitle>
                <CardDescription className="text-zinc-500 font-medium mt-1">Danh sách tất cả các mã đang lưu hành.</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-600" />
                <Input 
                  placeholder="Tìm mã voucher..." 
                  className="pl-11 h-12 rounded-xl border-zinc-200 bg-zinc-50/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Mã Voucher</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Mức giảm</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Hiệu lực</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Sử dụng</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {vouchers.map((v) => (
                  <tr key={v.id} className="group hover:bg-zinc-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-zinc-100 p-2 rounded-lg group-hover:bg-red-50 transition-colors">
                          <Ticket className="w-4 h-4 text-zinc-400 group-hover:text-red-600 transition-colors" />
                        </div>
                        <span className="font-black text-zinc-950 tracking-tighter">{v.code}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-zinc-900">{v.discount}</span>
                        <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">{v.type === 'PERCENT' ? 'Giảm %' : v.type === 'FIXED' ? 'Giảm tiền' : 'Vận chuyển'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold tracking-tight">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(v.expiry).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black text-zinc-400">
                          <span>{v.used} LƯỢT</span>
                          <span>{v.limit} MAX</span>
                        </div>
                        <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-zinc-950 rounded-full group-hover:bg-red-600 transition-all duration-1000" 
                            style={{ width: `${(v.used / v.limit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black tracking-widest border-none",
                        v.status === 'ACTIVE' ? "bg-green-100 text-green-700" :
                        v.status === 'EXPIRED' ? "bg-red-50 text-red-600" :
                        "bg-zinc-100 text-zinc-400"
                      )}>
                        {v.status}
                      </Badge>
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
          <div className="p-8 border-t border-zinc-50 flex items-center justify-between">
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Hiển thị toàn bộ 5 chiến dịch hiện hữu</p>
            <Button variant="link" className="text-red-600 font-black text-xs tracking-widest uppercase flex items-center gap-2 group">
              Xem lịch sử voucher
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
