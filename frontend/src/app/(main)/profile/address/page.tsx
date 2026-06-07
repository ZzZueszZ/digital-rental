"use client";

import { useState } from "react";
import {
  useMyAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/services/address";
import {
  City,
  ShippingAddressResponse,
  ShippingAddressRequest,
  CITY_LABELS,
} from "@/types/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, MoreVertical, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { cn } from "@/lib/utils";
import { isAxiosError } from "axios";

export default function AddressPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddressResponse | null>(null);
  const { data: addressesRes } = useMyAddresses();
  const { mutateAsync: deleteAddress } = useDeleteAddress();
  const { mutateAsync: setDefault } = useSetDefaultAddress();

  const addresses = addressesRes?.data || [];

  const handleOpenDialog = (address?: ShippingAddressResponse) => {
    setSelectedAddress(address || null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight mb-2">
            Địa chỉ nhận hàng
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Lưu trữ các điểm giao nhận để thanh toán nhanh hơn
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="h-10 px-5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 transition-all duration-200 font-semibold text-[14px] flex items-center gap-2 shadow-lg shadow-zinc-200 whitespace-nowrap active:scale-95"
        >
          <Plus className="w-4 h-4" /> Thêm địa chỉ mới
        </Button>
      </div>

      <AddressDialog
        key={selectedAddress?.id || "new"}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        address={selectedAddress}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={cn(
              "bg-white border p-6 rounded-xl shadow-sm transition-all group relative",
              addr.isDefault
                ? "border-red-600/30 bg-red-50/10 shadow-red-600/5"
                : "border-zinc-100 hover:border-red-600/20",
            )}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    addr.isDefault
                      ? "bg-red-600 text-white shadow-lg shadow-red-100 scale-105"
                      : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white",
                  )}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                {addr.isDefault && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-red-600">
                      Địa chỉ chính
                    </span>
                    <span className="text-xs font-medium text-zinc-400">
                      Mặc định
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleOpenDialog(addr)}
                className="h-10 w-10 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-300 hover:text-zinc-900 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-zinc-400 leading-none">
                  Thông tin liên hệ
                </p>
                <p className="text-[18px] font-semibold text-zinc-950 leading-tight">
                  {addr.receiverName} • {addr.receiverPhone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-zinc-400 leading-none">
                  Vị trí địa lý
                </p>
                <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                  {addr.fullAddress}
                </p>
              </div>
            </div>

            {!addr.isDefault && (
              <div className="mt-10 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={() => setDefault(addr.id)}
                  className="text-xs font-bold text-red-600 hover:text-zinc-950 transition-colors"
                >
                  Sử dụng làm mặc định
                </button>
                <div className="w-1 h-1 rounded-full bg-zinc-200" />
                <button
                  onClick={() => {
                    if (confirm("Gỡ bỏ địa chỉ này khỏi danh sách?"))
                      deleteAddress(addr.id);
                  }}
                  className="text-xs font-bold text-zinc-400 hover:text-red-600 transition-colors"
                >
                  Xóa bỏ
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => handleOpenDialog()}
          className="border-2 border-dashed border-zinc-100 rounded-xl p-12 flex flex-col items-center justify-center gap-4 text-zinc-300 hover:border-red-600/30 hover:text-red-600 hover:bg-red-50/30 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-xl transition-all">
            <Plus className="w-8 h-8" />
          </div>
          <span className="text-base font-semibold">Thiết lập địa chỉ mới</span>
        </button>
      </div>
    </div>
  );
}

function AddressDialog({
  isOpen,
  onClose,
  address,
}: {
  isOpen: boolean;
  onClose: () => void;
  address: ShippingAddressResponse | null;
}) {
  const { mutateAsync: createAddress, isPending: isCreating } =
    useCreateAddress();
  const { mutateAsync: updateAddress, isPending: isUpdating } =
    useUpdateAddress();

  const [formData, setFormData] = useState<ShippingAddressRequest>(() => {
    if (address) {
      return {
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        fullAddress: address.fullAddress,
        province: address.province as City,
        district: address.district,
        ward: address.ward,
        detailAddress: address.detailAddress,
        setAsDefault: address.isDefault,
      };
    }
    return {
      receiverName: "",
      receiverPhone: "",
      fullAddress: "",
      province: "",
      district: "",
      ward: "",
      detailAddress: "",
      setAsDefault: false,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (address) {
        await updateAddress({ id: address.id, data: formData });
        toast.success("Cập nhật địa chỉ thành công");
      } else {
        await createAddress(formData);
        toast.success("Thêm địa chỉ mới thành công");
      }
      onClose();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : "Đã xảy ra lỗi không xác định";
      toast.error(message);
    }
  };

  return (
    <AdminFormDialog
      open={isOpen}
      onOpenChange={onClose}
      title={address ? "Cập nhật địa chỉ" : "Địa chỉ mới"}
      description="Vui lòng điền chính xác thông tin để quá trình giao hàng diễn ra thuận lợi"
      icon={MapPin}
      onSubmit={handleSubmit}
      isPending={isCreating || isUpdating}
      submitText={address ? "Cập nhật ngay" : "Lưu địa chỉ"}
      submitIcon={address ? Check : Plus}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Người nhận
            </label>
            <Input
              value={formData.receiverName}
              onChange={(e) =>
                setFormData({ ...formData, receiverName: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              placeholder="Họ và tên"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Số điện thoại
            </label>
            <Input
              value={formData.receiverPhone}
              onChange={(e) =>
                setFormData({ ...formData, receiverPhone: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              placeholder="09xx xxx xxx"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Tỉnh / Thành phố
            </label>
            <Select
              value={formData.province as string}
              onValueChange={(v) =>
                setFormData({ ...formData, province: v as City })
              }
            >
              <SelectTrigger className="w-full h-10! bg-white! border-black/5! rounded-xl px-4 font-semibold text-[14px] focus:border-red-600/30! transition-all duration-200 text-left shadow-dash-card outline-none">
                <span
                  className={cn(
                    formData.province ? "text-zinc-900" : "text-zinc-400",
                  )}
                >
                  {formData.province
                    ? CITY_LABELS[formData.province]
                    : "Chọn Tỉnh/Thành phố"}
                </span>
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-dash-overlay border-black/5 max-h-72 bg-white p-1">
                {Object.entries(CITY_LABELS).map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="font-semibold py-3 text-zinc-950 focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white data-[state=checked]:bg-red-50 data-[state=checked]:text-red-600 cursor-pointer transition-colors"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Quận / Huyện
            </label>
            <Input
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              placeholder="Nhập Quận/Huyện"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Phường / Xã
            </label>
            <Input
              value={formData.ward}
              onChange={(e) =>
                setFormData({ ...formData, ward: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              placeholder="Nhập Phường/Xã"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Địa chỉ chi tiết
            </label>
            <Input
              value={formData.detailAddress}
              onChange={(e) =>
                setFormData({ ...formData, detailAddress: e.target.value })
              }
              className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
              placeholder="Số nhà, ngõ, tên đường..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 ml-1">
            Địa chỉ đầy đủ (Tự động cập nhật)
          </label>
          <Input
            value={formData.fullAddress}
            onChange={(e) =>
              setFormData({ ...formData, fullAddress: e.target.value })
            }
            className="h-10 bg-white border border-black/5 rounded-xl px-4 font-semibold text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none"
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
          />
        </div>

        <div className="flex items-center gap-3 p-3 bg-zinc-50/50 rounded-xl border border-zinc-100">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.setAsDefault}
            onChange={(e) =>
              setFormData({ ...formData, setAsDefault: e.target.checked })
            }
            className="w-5 h-5 rounded-md border-zinc-200 text-zinc-950 focus:ring-zinc-950 cursor-pointer"
          />
          <label
            htmlFor="isDefault"
            className="text-sm font-medium text-zinc-500 cursor-pointer"
          >
            Đặt làm địa chỉ giao hàng mặc định
          </label>
        </div>
      </div>
    </AdminFormDialog>
  );
}
