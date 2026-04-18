'use client';

import { useState } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  ShieldCheck,
  Mail,
  Calendar,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function UsersAdminPage() {
  const [search, setSearch] = useState('');

  // Mock data for initial design
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'ADMIN', status: 'ACTIVE', joined: '2024-03-15' },
    { id: 2, name: 'Trần Thị B', email: 'thib@gmail.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2024-04-01' },
    { id: 3, name: 'Lê Văn C', email: 'vanc@gmail.com', role: 'STAFF', status: 'PENDING', joined: '2024-04-10' },
    { id: 4, name: 'Phạm Minh D', email: 'minhd@gmail.com', role: 'CUSTOMER', status: 'BANNED', joined: '2024-01-20' },
    { id: 5, name: 'Hoàng Thị E', email: 'thie@gmail.com', role: 'CUSTOMER', status: 'ACTIVE', joined: '2024-02-28' },
  ];

  return (
    <div className="flex-1 space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 pb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950">
            Quản lý <span className="text-red-600 italic">người dùng.</span>
          </h2>
          <p className="text-zinc-500 font-medium mt-2">Phân quyền, kiểm soát và theo dõi hoạt động thành viên.</p>
        </div>
        <Button className="h-14 px-8 rounded-xl bg-zinc-950 text-white hover:bg-red-600 transition-all duration-300 font-bold flex items-center gap-2 group shadow-xl shadow-zinc-950/20">
          <UserPlus className="w-5 h-5 transition-transform group-hover:scale-110" />
          Thêm người dùng mới
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Tổng người dùng', value: '1,280', icon: UsersIcon, color: 'zinc' },
          { label: 'Đang hoạt động', value: '1,245', icon: UserCheck, color: 'green' },
          { label: 'Yêu cầu chờ duyệt', value: '12', icon: ShieldCheck, color: 'amber' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                stat.color === 'zinc' ? "bg-zinc-100 text-zinc-900" :
                stat.color === 'green' ? "bg-green-50 text-green-600" :
                "bg-amber-50 text-amber-600"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-950">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Card */}
      <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="border-b border-zinc-50 p-8 pt-10">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div>
              <CardTitle className="text-2xl font-bold text-zinc-950">Danh sách thành viên</CardTitle>
              <CardDescription className="text-zinc-500 font-medium mt-1">Lọc và tìm kiếm người dùng trong hệ thống.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  placeholder="Tìm theo tên, email..." 
                  className="pl-11 h-12 rounded-xl border-zinc-200 focus:border-red-600/50 focus:ring-red-600/5 bg-zinc-50/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 px-5 rounded-xl border-zinc-200 hover:bg-zinc-50 font-bold gap-2">
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
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Thành viên</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Vai trò</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Ngày tham gia</th>
                  <th className="px-8 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {users.map((u) => (
                  <tr key={u.id} className="group hover:bg-zinc-50/80 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-950 tracking-tight group-hover:text-red-600 transition-colors uppercase-none">{u.name}</p>
                          <p className="text-xs text-zinc-400 font-medium flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant="outline" className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-bold border-none",
                        u.role === 'ADMIN' ? "bg-red-50 text-red-600" :
                        u.role === 'STAFF' ? "bg-amber-50 text-amber-600" :
                        "bg-zinc-100 text-zinc-600"
                      )}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          u.status === 'ACTIVE' ? "bg-green-500" :
                          u.status === 'PENDING' ? "bg-amber-400" :
                          "bg-red-500"
                        )} />
                        <span className="text-xs font-bold text-zinc-900">{u.status === 'ACTIVE' ? 'Hoạt động' : u.status === 'PENDING' ? 'Chờ duyệt' : 'Đã khóa'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(u.joined).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm border-transparent hover:border-zinc-100 border transition-all">
                        <MoreHorizontal className="w-5 h-5 text-zinc-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 border-t border-zinc-50 flex items-center justify-between text-xs font-bold text-zinc-400 tracking-widest uppercase">
            <span>Hiển thị 1-5 của 1,280 thành viên</span>
            <div className="flex gap-2">
              <Button disabled variant="outline" className="h-10 px-4 rounded-xl border-zinc-200">Trước</Button>
              <Button variant="outline" className="h-10 px-4 rounded-xl border-zinc-200 hover:bg-zinc-950 hover:text-white transition-all">Tiếp</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
