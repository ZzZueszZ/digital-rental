"use client";

import { useState } from "react";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  VoucherResponse, 
  VoucherCreateRequest, 
  VoucherType, 
} from "@/types/voucher";
import { Ticket, Calendar, Info, DollarSign, Users, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: VoucherResponse | null;
  onSubmit: (values: VoucherCreateRequest) => Promise<void>;
  isPending: boolean;
}

export function VoucherDialog({
  open,
  onOpenChange,
  voucher,
  onSubmit,
  isPending
}: VoucherDialogProps) {
  const [formData, setFormData] = useState<VoucherCreateRequest>({
    code: "",
    name: "",
    description: "",
    type: "PERCENTAGE",
    scope: "GLOBAL",
    discountValue: 0,
    maxDiscountAmount: undefined,
    minOrderValue: 0,
    maxUsagePerUser: 1,
    maxUsage: undefined,
    startDate: "",
    endDate: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VoucherCreateRequest, string>>>({});
  
  const [prevVoucher, setPrevVoucher] = useState<VoucherResponse | null | undefined>(undefined);
  const [prevOpen, setPrevOpen] = useState<boolean>(false);

  if (voucher !== prevVoucher || (open && !prevOpen)) {
    setPrevVoucher(voucher);
    setPrevOpen(open);
    if (voucher) {
      setFormData({
        code: voucher.code,
        name: voucher.name,
        description: voucher.description || "",
        type: voucher.type,
        scope: voucher.scope,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        minOrderValue: voucher.minOrderValue,
        maxUsagePerUser: voucher.maxUsagePerUser,
        maxUsage: voucher.maxUsage,
        startDate: voucher.startDate ? voucher.startDate.slice(0, 16) : "",
        endDate: voucher.endDate ? voucher.endDate.slice(0, 16) : "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        type: "PERCENTAGE",
        scope: "GLOBAL",
        discountValue: 0,
        maxDiscountAmount: undefined,
        minOrderValue: 0,
        maxUsagePerUser: 1,
        maxUsage: undefined,
        startDate: "",
        endDate: "",
      });
    }
    setErrors({});
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof VoucherCreateRequest, string>> = {};
    if (!formData.code.trim()) newErrors.code = "Mã voucher không được để trống";
    if (!formData.name.trim()) newErrors.name = "Tên voucher không được để trống";
    if (formData.discountValue <= 0) newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    if (formData.type === "PERCENTAGE" && formData.discountValue > 100) {
      newErrors.discountValue = "Phần trăm giảm không được quá 100%";
    }
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return "Chọn thời gian";
    const date = new Date(dateStr);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(-2);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${d}/${m}/${y} ${hh}:${mm}`;
  };

  return (
    <AdminFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Ticket}
      iconClassName="bg-red-600 text-white shadow-lg shadow-red-100"
      title={voucher ? "Cập nhật Voucher" : "Phát hành Voucher mới"}
      description={voucher ? `Đang chỉnh sửa mã: ${voucher.code}` : "Thiết lập chương trình khuyến mãi chuyên nghiệp"}
      onSubmit={handleSubmit}
      isPending={isPending}
      submitText={voucher ? "Lưu thay đổi" : "Phát hành"}
      submitIcon={ShieldCheck}
      maxWidth="max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Thông tin định danh</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-500 ml-1">Mã Voucher</label>
                <Input 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: PRO-PH-2024"
                  disabled={!!voucher}
                  className="h-12 rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-bold text-base shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5 tracking-wider"
                />
                {errors.code && <p className="text-[11px] font-medium text-red-600 ml-1">{errors.code}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-500 ml-1">Tên chiến dịch</label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Ưu đãi khách hàng thân thiết"
                  className="h-12 rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-[15px] shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5"
                />
                {errors.name && <p className="text-[11px] font-medium text-red-600 ml-1">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-500 ml-1">Ghi chú chi tiết</label>
                <Textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nội dung hiển thị cho khách hàng..."
                  className="rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-normal text-sm min-h-[100px] resize-none shadow-sm transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Discount Config Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Giá trị ưu đãi</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-500 ml-1">Loại chiết khấu</label>
                  <div className="flex p-1 bg-zinc-100 rounded-xl gap-1">
                    {(["PERCENTAGE", "FIXED_AMOUNT"] as VoucherType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: t, discountValue: 0 })}
                        className={cn(
                          "flex-1 py-2.5 rounded-lg text-[11px] font-bold tracking-wider transition-all",
                          formData.type === t ? "bg-red-600 text-white shadow-md shadow-red-100" : "text-zinc-500 hover:text-zinc-800"
                        )}
                      >
                        {t === "PERCENTAGE" ? "Phần trăm" : "Tiền mặt"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-500 ml-1">
                    Giá trị ({formData.type === "PERCENTAGE" ? "%" : "VNĐ"})
                  </label>
                  <Input 
                    type="number"
                    value={formData.discountValue || ""}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    placeholder="0"
                    className="h-12 rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-bold text-xl shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5 tracking-tight"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-500 ml-1">Giảm tối đa (VNĐ)</label>
                  <Input 
                    type="number"
                    value={formData.maxDiscountAmount || ""}
                    onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="∞ Không giới hạn"
                    disabled={formData.type === "FIXED_AMOUNT"}
                    className="h-12 rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-sm disabled:opacity-40 shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-500 ml-1">Đơn tối thiểu (VNĐ)</label>
                  <Input 
                    type="number"
                    value={formData.minOrderValue || ""}
                    onChange={e => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    placeholder="0"
                    className="h-12 rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-sm shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Usage Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Quy mô & Giới hạn</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-500 ml-1">Số lượt/Khách</label>
                  <Input 
                    type="number"
                    value={formData.maxUsagePerUser || ""}
                    onChange={e => setFormData({ ...formData, maxUsagePerUser: Number(e.target.value) })}
                    placeholder="1"
                    className="h-12 rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-sm shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-500 ml-1">Tổng lượt phát hành</label>
                  <Input 
                    type="number"
                    value={formData.maxUsage || ""}
                    onChange={e => setFormData({ ...formData, maxUsage: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="∞ Không giới hạn"
                    className="h-12 rounded-lg bg-zinc-50/50 border border-zinc-950/5 focus:bg-white focus:border-red-600/30 font-semibold text-sm shadow-dash-card transition-all duration-200 ease-in-out focus:ring-4 focus:ring-red-600/5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Thời gian triển khai</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-500 ml-1">Bắt đầu lúc</label>
                <div className="relative group">
                  <input 
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    onClick={(e) => (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.()}
                    className="absolute inset-0 opacity-0 z-20 cursor-pointer w-full h-full [color-scheme:light] accent-red-600"
                  />
                  <div className="h-12 px-4 rounded-lg bg-zinc-50/50 border border-zinc-950/5 flex items-center justify-between text-sm font-semibold text-zinc-900 group-hover:border-red-600/30 group-focus-within:bg-white group-focus-within:border-red-600/30 transition-all duration-200 shadow-dash-card focus-within:ring-4 focus-within:ring-red-600/5">
                    <span>{formatDateTime(formData.startDate)}</span>
                    <Calendar className="w-4 h-4 text-red-400" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-500 ml-1">Kết thúc lúc</label>
                <div className="relative group">
                  <input 
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    onClick={(e) => (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.()}
                    className="absolute inset-0 opacity-0 z-20 cursor-pointer w-full h-full [color-scheme:light] accent-red-600"
                  />
                  <div className="h-12 px-4 rounded-lg bg-zinc-50/50 border border-zinc-950/5 flex items-center justify-between text-sm font-semibold text-zinc-900 group-hover:border-red-600/30 group-focus-within:bg-white group-focus-within:border-red-600/30 transition-all duration-200 shadow-dash-card focus-within:ring-4 focus-within:ring-red-600/5">
                    <span>{formatDateTime(formData.endDate)}</span>
                    <Calendar className="w-4 h-4 text-red-400" />
                  </div>
                </div>
                {errors.endDate && <p className="text-[11px] font-medium text-red-600 ml-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Note Box */}
          <div className="mt-4 p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-100">
                <Info className="w-3 h-3 text-white" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-zinc-950 tracking-tight">Trạng thái phát hành</h4>
                <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                  Voucher mới tạo sẽ ở trạng thái <span className="font-bold text-red-600 underline underline-offset-2">Nháp</span>. Bạn cần kích hoạt thủ công để bắt đầu áp dụng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminFormDialog>
  );
}
