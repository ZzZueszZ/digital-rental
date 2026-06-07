"use client";

import { useState, useRef } from "react";
import {
  useMyProfile,
  useUpdateMyProfile,
  useUploadMyAvatar,
} from "@/services/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function InfoPage() {
  const { data: profileRes } = useMyProfile();
  const profile = profileRes?.data;

  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateMyProfile();
  const { mutateAsync: uploadAvatar } = useUploadMyAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    fullName: profile?.fullName || "",
    gender: (profile?.gender || "OTHER") as "MALE" | "FEMALE" | "OTHER",
    dateOfBirth: profile?.dateOfBirth || "",
    occupation: profile?.occupation || "",
    companyName: profile?.companyName || "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success("Hồ sơ đã được lưu thành công");
    } catch {
      toast.error("Không thể lưu thay đổi");
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-[0_2px_6px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight leading-tight">
            Thông tin chi tiết
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Quản lý các thiết bị nhiếp ảnh và các thiết lập bảo mật định danh
          </p>
        </div>
        <div className="relative group">
          <Avatar className="w-32 h-32 border-8 border-zinc-50 shadow-inner">
            <AvatarImage
              src={
                profile?.avatarUrl
                  ? `http://localhost:8080${profile.avatarUrl}`
                  : undefined
              }
            />
            <AvatarFallback className="bg-zinc-100 text-zinc-300 font-black text-2xl">
              {profile?.fullName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await uploadAvatar(file);
                toast.success("Avatar updated");
              }
            }}
          />
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Họ và tên đệm
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Tên
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Giới tính
            </label>
            <Select
              value={formData.gender}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  gender: v as "MALE" | "FEMALE" | "OTHER",
                })
              }
            >
              <SelectTrigger className="w-full h-10! bg-white! border-black/5! rounded-xl px-4 font-semibold text-[14px] focus:border-red-600/30! transition-all duration-200 text-left shadow-dash-card outline-none">
                <span
                  className={cn(
                    formData.gender ? "text-zinc-900" : "text-zinc-400",
                  )}
                >
                  {formData.gender
                    ? formData.gender === "MALE"
                      ? "Nam"
                      : formData.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác"
                    : "Chọn giới tính"}
                </span>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-dash-overlay border-black/5 p-1 bg-white z-[100]">
                <SelectItem
                  value="MALE"
                  className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-all outline-none"
                >
                  Nam
                </SelectItem>
                <SelectItem
                  value="FEMALE"
                  className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-all outline-none"
                >
                  Nữ
                </SelectItem>
                <SelectItem
                  value="OTHER"
                  className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-all outline-none"
                >
                  Khác
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Ngày sinh nhật
            </label>
            <DateInput
              value={formData.dateOfBirth}
              onChange={(v) =>
                setFormData({ ...formData, dateOfBirth: v })
              }
              className="h-10 text-[14px] px-4"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Lĩnh vực hoạt động
            </label>
            <Input
              value={formData.occupation}
              onChange={(e) =>
                setFormData({ ...formData, occupation: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Công ty / Studio
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
            />
          </div>
        </div>

        <div className="pt-10 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5 rounded-xl border border-zinc-100 bg-white text-zinc-500 font-semibold text-[14px] hover:bg-zinc-50 hover:text-zinc-950 transition-all active:scale-95 shadow-sm"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={isUpdating}
            className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95 disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Lưu hồ sơ"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
