'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle,
  Camera,
  Layers,
  TrendingUp,
  Tag,
  Eye,
  Edit2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProductsAdminPage() {
  const [search, setSearch] = useState('');

  // Mock data for initial design
  const products = [
    { id: 1, name: 'Sony Alpha A7 IV', category: 'Mirrorless', price: '45.000.000 ₫', rent: '800.000 ₫', stock: 12, status: 'ACTIVE', image: '/api/uploads/sony-a7.jpg' },
    { id: 2, name: 'Canon EOS R6 Mark II', category: 'Mirrorless', price: '52.000.000 ₫', rent: '950.000 ₫', stock: 5, status: 'ACTIVE', image: '/api/uploads/canon-r6.jpg' },
    { id: 3, name: 'Fujifilm X-T5', category: 'Mirrorless', price: '38.000.000 ₫', rent: '650.000 ₫', stock: 0, status: 'OUT_OF_STOCK', image: '/api/uploads/fuji-xt5.jpg' },
    { id: 4, name: 'Nikkor Z 24-70mm f/2.8 S', category: 'Lenses', price: '42.000.000 ₫', rent: '700.000 ₫', stock: 8, status: 'ACTIVE', image: '/api/uploads/nikon-2470.jpg' },
    { id: 5, name: 'DJI RS 3 Pro Combo', category: 'Accessories', price: '21.000.000 ₫', rent: '400.000 ₫', stock: 15, status: 'ACTIVE', image: '/api/uploads/dji-rs3.jpg' },
  ];

  return (
    <div className="flex-1 space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Kho hàng <span className="text-red-600 italic">Thiết bị.</span>
          </h2>
          <p className="text-zinc-500 font-medium mt-2">Quản lý kho máy ảnh, ống kính và phụ kiện cao cấp.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-14 px-8 rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold transition-all duration-300">
            Nhập kho excel
          </Button>
          <Button className="h-14 px-8 rounded-xl bg-zinc-950 text-white hover:bg-red-600 transition-all duration-300 font-bold flex items-center gap-2 group shadow-xl shadow-zinc-950/20">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-500" />
            Đăng sản phẩm mới
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Tổng sản phẩm', value: '458', icon: Package, color: 'zinc' },
          { label: 'Thiết bị cho thuê', value: '185', icon: Camera, color: 'red' },
          { label: 'Sắp hết hàng', value: '24', icon: TrendingUp, color: 'amber' },
          { label: 'Danh mục', value: '18', icon: Layers, color: 'zinc' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                stat.color === 'red' ? "bg-red-50 text-red-600" :
                stat.color === 'amber' ? "bg-amber-50 text-amber-600" :
                "bg-zinc-100 text-zinc-900"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold text-zinc-950">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-50 p-8 pt-10">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-zinc-950">Danh sách thiết bị</CardTitle>
                <CardDescription className="text-zinc-500 font-medium mt-1">Quản lý tình trạng, giá bán và tồn kho.</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  placeholder="Tìm thiết bị..." 
                  className="pl-11 h-12 rounded-xl border-zinc-200 bg-zinc-50/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 px-5 rounded-xl border-zinc-200 font-bold gap-2">
                <Filter className="w-4 h-4" />
                Lọc nhanh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Thông tin sản phẩm</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Danh mục</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Bán / Thuê</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tồn kho</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {products.map((p) => (
                  <tr key={p.id} className="group hover:bg-zinc-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center overflow-hidden p-2 group-hover:scale-105 transition-transform">
                          <div className="w-full h-full bg-zinc-50 rounded-lg flex items-center justify-center">
                            <Camera className="w-6 h-6 text-zinc-300" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-zinc-950 tracking-tight group-hover:text-red-600 transition-colors">{p.name}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">ID: #{p.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-zinc-600 font-mono tracking-tight">{p.category}</td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-950">{p.price}</p>
                        <p className="text-[10px] text-red-600 font-bold">{p.rent} <span className="text-zinc-400 font-medium">/ ngày</span></p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            p.stock > 10 ? "bg-green-500" : p.stock > 0 ? "bg-amber-400" : "bg-red-500"
                          )} />
                          <span className="text-xs font-bold text-zinc-900">{p.stock} sản phẩm</span>
                        </div>
                        <div className="w-24 h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            p.stock > 10 ? "bg-green-500 w-[80%]" : p.stock > 0 ? "bg-amber-400 w-[30%]" : "bg-red-500 w-[0%]"
                          )} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white hover:shadow-sm border-transparent hover:border-zinc-100 border transition-all hover:text-red-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white hover:shadow-sm border-transparent hover:border-zinc-100 border transition-all text-zinc-400 hover:text-zinc-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t border-zinc-50 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 tracking-widest uppercase">Hiển thị 5 của 458 sản phẩm</span>
            <div className="flex gap-2">
              <Button disabled variant="outline" className="h-10 px-5 rounded-xl border-zinc-200">Trang trước</Button>
              <Button variant="outline" className="h-10 px-5 rounded-xl border-zinc-200 hover:bg-zinc-950 hover:text-white transition-all">Trang sau</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
