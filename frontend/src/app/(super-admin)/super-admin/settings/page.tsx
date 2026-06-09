"use client";

import {
  Settings as SettingsIcon,
  Shield,
  Globe,
  Database,
  Bell,
  Mail,
  Lock,
  Eye,
  Save,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SettingsAdminPage() {
  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* Header Section */}
      <div className="flex justify-end">
        <Button className="h-10 px-6 rounded-xl bg-zinc-950 text-white hover:bg-red-600 transition-all duration-150 font-semibold flex items-center gap-2 group shadow-sm text-xs">
          <Save className="w-4 h-4" />
          Lưu tất cả thay đổi
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* General Settings */}
          <Card className="rounded-xl border-zinc-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-5 py-4 border-b border-zinc-50">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-red-600" />
                <CardTitle className="text-lg font-semibold">
                  Thông tin chung
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-400">
                    Tên nền tảng
                  </Label>
                  <Input
                    placeholder="LensHub Ecosystem"
                    className="h-10 rounded-xl bg-zinc-50/50 text-xs font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-400">
                    Email hệ thống
                  </Label>
                  <Input
                    placeholder="admin@lenshub.pro"
                    className="h-10 rounded-xl bg-zinc-50/50 text-xs font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-zinc-400">
                  Mô tả ngắn
                </Label>
                <Input
                  placeholder="Nền tảng thuê và bán thiết bị nhiếp ảnh hàng đầu."
                  className="h-10 rounded-xl bg-zinc-50/50 text-xs font-medium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card className="rounded-xl border-zinc-200 bg-white shadow-sm overflow-hidden border-l-4 border-l-amber-400">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900">Chế độ bảo trì</p>
                  <p className="text-xs text-zinc-500 font-medium">
                    Tạm đóng cửa hàng để nâng cấp hệ thống.
                  </p>
                </div>
              </div>
              <Switch />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* Security Summary */}
          <Card className="rounded-xl border-zinc-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="px-5 py-4 border-b border-zinc-50">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-green-600" />
                <CardTitle className="text-lg font-semibold">Bảo mật</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-zinc-900 italic">
                    Xác thực 2 lớp
                  </p>
                  <p className="text-xs text-zinc-400 font-medium">
                    Bắt buộc cho Admin/Staff
                  </p>
                </div>
                <Switch checked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-zinc-900 italic">
                    Khóa IP lạ
                  </p>
                  <p className="text-xs text-zinc-400 font-medium">
                    Tự động chặn khi có 5 lần login sai
                  </p>
                </div>
                <Switch checked />
              </div>
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl border-zinc-200 font-semibold gap-2 text-xs"
              >
                <Lock className="w-4 h-4" />
                Nhật ký đăng nhập
              </Button>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="rounded-xl border-zinc-950 bg-zinc-950 shadow-none overflow-hidden text-white">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center mb-5 border border-white/10">
                <Database className="w-7 h-7 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold mb-1.5">Trạng thái Database</h4>
              <p className="text-zinc-500 text-xs font-medium mb-6">
                Mọi thứ đang vận hành ổn định trên Cloud Engine.
              </p>
              <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-xs font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Healthy
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
