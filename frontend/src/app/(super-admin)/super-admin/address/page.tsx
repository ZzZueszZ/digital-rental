"use client";

import { useState, useMemo } from "react";
import {
  useUserAddresses,
  useCreateUserAddress,
  useUpdateUserAddress,
  useDeleteUserAddress,
  useSetDefaultUserAddress,
} from "@/services/address";
import { useUsers } from "@/services/user";
import {
  City,
  ShippingAddressResponse,
  ShippingAddressRequest,
  CITY_LABELS,
} from "@/types/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Plus,
  MoreVertical,
  Trash2,
  Check,
  User as UserIcon,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "../users/components/EmptyState";
import { isAxiosError } from "axios";

export default function AdminAddressPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    fullName: string;
    email: string;
  } | null>(null);

  // Fetch users for the selector
  const { data: usersRes, isLoading: isSearching } = useUsers(
    { keyword: searchQuery },
    0,
    5,
  );
  const users = usersRes?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* User Selector Section */}
      <div className="bg-white border border-zinc-100 rounded-xl p-5 shadow-sm">
        <div className="max-w-2xl">
          <label className="text-sm font-medium text-zinc-500 mb-4 block ml-1">
            Chọn người dùng để quản lý địa chỉ
          </label>

          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-red-600 transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <Input
              placeholder="Tìm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-zinc-50/50 border border-zinc-950/5 rounded-xl focus:bg-white focus:border-red-600/30 transition-all duration-200 font-semibold text-[15px] shadow-dash-card"
            />

            {/* Search Results Dropdown */}
            {searchQuery && users.length > 0 && !selectedUser && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser({
                        id: user.id,
                        fullName: user.email.split("@")[0],
                        email: user.email,
                      });
                      setSearchQuery("");
                    }}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50 transition-all group/item text-left border-b border-zinc-50 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover/item:bg-red-600 group-hover/item:text-white transition-all">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-950">
                          {user.email}
                        </p>
                        <p className="text-xs font-medium text-zinc-400">
                          ID: #{user.id}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-200 group-hover/item:text-red-600 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="mt-5 flex items-center justify-between p-3.5 bg-red-50/50 border border-red-100 rounded-xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-red-600 mb-0.5">
                    Đang quản lý
                  </p>
                  <p className="text-[22px] font-semibold text-zinc-950 tracking-tight leading-tight">
                    {selectedUser.fullName}{" "}
                    <span className="text-zinc-400 font-medium text-sm ml-1">
                      ({selectedUser.email})
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white hover:text-red-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Address Management Section */}
      {selectedUser ? (
        <AdminAddressManagement userId={selectedUser.id} />
      ) : (
        <div className="bg-white border border-zinc-100 border-dashed rounded-xl overflow-hidden">
          <EmptyState
            title="Vui lòng chọn một người dùng"
            description="Sử dụng thanh tìm kiếm phía trên để bắt đầu quản lý địa chỉ."
            icon={Search}
          />
        </div>
      )}
    </div>
  );
}

function AdminAddressManagement({ userId }: { userId: number }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddressResponse | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  const { data: addressesRes, isLoading } = useUserAddresses(userId);
  const { mutateAsync: deleteAddress } = useDeleteUserAddress(userId);
  const { mutateAsync: setDefault } = useSetDefaultUserAddress(userId);

  const addresses = addressesRes?.data || [];

  const handleOpenDialog = (address?: ShippingAddressResponse) => {
    setSelectedAddress(address || null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-400">
          Đang tải danh sách địa chỉ...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            Danh sách địa chỉ ({addresses.length})
          </h2>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="h-11 px-6 rounded-xl bg-red-600 text-white font-semibold text-[14px] flex items-center gap-2.5 hover:bg-zinc-950 transition-all shadow-lg shadow-red-100"
        >
          <Plus className="w-4 h-4" /> Thêm địa chỉ mới
        </Button>
      </div>

      <AdminAddressDialog
        key={isDialogOpen ? `${userId}-${selectedAddress?.id || "new"}` : "closed"}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        address={selectedAddress}
        userId={userId}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xóa địa chỉ"
        description="Bạn có chắc chắn muốn xóa địa chỉ này khỏi tài khoản của người dùng? Thao tác này không thể hoàn tác."
        onConfirm={async () => {
          if (addressToDelete) {
            await deleteAddress(addressToDelete);
            setDeleteConfirmOpen(false);
            setAddressToDelete(null);
            toast.success("Đã xóa địa chỉ");
          }
        }}
        variant="danger"
      />

      {addresses.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden">
          <EmptyState
            title="Chưa có địa chỉ nào"
            description="Người dùng này hiện chưa có thông tin địa chỉ giao hàng trong hệ thống."
            icon={MapPin}
            actionText="Thêm địa chỉ ngay"
            onAction={() => handleOpenDialog()}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "bg-white border p-6 rounded-xl shadow-dash-card transition-all group relative",
                addr.isDefault
                  ? "border-red-600/30 bg-red-50/10"
                  : "border-zinc-950/5 hover:border-red-600/20 hover:shadow-dash-hover hover:-translate-y-0.5",
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      addr.isDefault
                        ? "bg-red-600 text-white shadow-lg shadow-red-100"
                        : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white",
                    )}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  {addr.isDefault && (
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-red-600">
                        Địa chỉ mặc định
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDialog(addr)}
                    className="h-8 w-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-300 hover:text-zinc-950 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div>
                  <p className="text-[13px] font-medium text-zinc-400 mb-2 ml-0.5">
                    Người nhận
                  </p>
                  <p className="text-[20px] font-semibold text-zinc-950 leading-tight tracking-tight">
                    {addr.receiverName}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-zinc-400 mb-2 ml-0.5">
                    Số điện thoại
                  </p>
                  <p className="text-[16px] font-semibold text-zinc-700">
                    {addr.receiverPhone}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-zinc-400 mb-2 ml-0.5">
                    Địa chỉ chi tiết
                  </p>
                  <p className="text-[16px] font-normal text-zinc-500 leading-relaxed">
                    {addr.fullAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-zinc-50">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="text-[12px] font-bold text-red-600 hover:text-zinc-950 transition-colors"
                  >
                    Thiết lập mặc định
                  </button>
                )}
                <button
                  onClick={() => {
                    setAddressToDelete(addr.id);
                    setDeleteConfirmOpen(true);
                  }}
                  className="text-[12px] font-bold text-zinc-400 hover:text-red-600 transition-colors ml-auto"
                >
                  Xóa địa chỉ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminAddressDialog({
  isOpen,
  onClose,
  address,
  userId,
}: {
  isOpen: boolean;
  onClose: () => void;
  address: ShippingAddressResponse | null;
  userId: number;
}) {
  const { mutateAsync: createAddress, isPending: isCreating } =
    useCreateUserAddress(userId);
  const { mutateAsync: updateAddress, isPending: isUpdating } =
    useUpdateUserAddress(userId);

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
      province: "" as City | "",
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
      title={address ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
      description="Quản lý thông tin giao nhận cho tài khoản người dùng"
      icon={MapPin}
      onSubmit={handleSubmit}
      isPending={isCreating || isUpdating}
      submitText={address ? "Lưu thay đổi" : "Thêm địa chỉ"}
      submitIcon={address ? Check : Plus}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Người nhận
            </label>
            <Input
              value={formData.receiverName}
              onChange={(e) =>
                setFormData({ ...formData, receiverName: e.target.value })
              }
              className="h-12 rounded-xl border border-zinc-950/5 bg-zinc-50/50 font-semibold text-[15px] focus:bg-white focus:border-red-600/30 transition-all duration-200 shadow-dash-card"
              placeholder="Nhập tên người nhận"
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
              className="h-12 rounded-xl border border-zinc-950/5 bg-zinc-50/50 font-semibold text-[15px] focus:bg-white focus:border-red-600/30 transition-all duration-200 shadow-dash-card"
              placeholder="09xx xxx xxx"
            />
          </div>
        </div>

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
            <SelectTrigger className="w-full !h-12 px-4 rounded-xl !border-zinc-950/5 !bg-zinc-50/50 font-semibold text-[15px] focus:!bg-white focus:!border-red-600/30 transition-all duration-200 !shadow-dash-card">
              <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-zinc-100 shadow-dash-overlay max-h-64 bg-white">
              {Object.entries(CITY_LABELS).map(([value, label]) => (
                <SelectItem
                  key={value}
                  value={value}
                  className="font-medium py-2.5"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Quận / Huyện
            </label>
            <Input
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
              className="h-12 rounded-xl border border-zinc-950/5 bg-zinc-50/50 font-semibold text-[15px] focus:bg-white focus:border-red-600/30 transition-all duration-200 shadow-dash-card"
              placeholder="Nhập quận/huyện"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 ml-1">
              Phường / Xã
            </label>
            <Input
              value={formData.ward}
              onChange={(e) =>
                setFormData({ ...formData, ward: e.target.value })
              }
              className="h-12 rounded-xl border border-zinc-950/5 bg-zinc-50/50 font-semibold text-[15px] focus:bg-white focus:border-red-600/30 transition-all duration-200 shadow-dash-card"
              placeholder="Nhập phường/xã"
            />
          </div>
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
            className="h-12 rounded-xl border border-zinc-950/5 bg-zinc-50/50 font-semibold text-[15px] focus:bg-white focus:border-red-600/30 transition-all duration-200 shadow-dash-card"
            placeholder="Số nhà, tên đường..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-500 ml-1">
            Địa chỉ đầy đủ
          </label>
          <Input
            value={formData.fullAddress}
            onChange={(e) =>
              setFormData({ ...formData, fullAddress: e.target.value })
            }
            className="h-12 rounded-xl border border-zinc-950/5 bg-zinc-50/50 font-semibold text-[15px] focus:bg-white focus:border-red-600/30 transition-all duration-200 shadow-dash-card"
            placeholder="VD: 123 Đường ABC, Phường X, Quận Y, Tỉnh Z"
          />
          <p className="text-[11px] text-zinc-400 font-medium italic ml-1">
            * Địa chỉ này sẽ được hiển thị trên hóa đơn và vận đơn
          </p>
        </div>
      </div>
    </AdminFormDialog>
  );
}
