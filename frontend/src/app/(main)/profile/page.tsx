"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import {
  useMyProfile,
  useUpdateMyProfile,
  useUploadMyAvatar,
  useDeleteMyAvatar,
} from "@/services/profile";
import { UserProfileResponse } from "@/types/user";
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
} from "@/types/address";
import {
  useMyCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/services/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  Trash2,
  Loader2,
  ShieldCheck,
  Check,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Settings,
  Plus,
  MoreVertical,
  Star,
  ChevronRight,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth";
import { cn } from "@/lib/utils";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { isAxiosError } from "axios";

type Section = "overview" | "info" | "address" | "orders" | "cart";

export default function ProfileDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSection = (searchParams.get("section") as Section) || "overview";
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onNavigate = (section: Section) => {
    router.replace(`/profile?section=${section}`, { scroll: false });
    setIsSidebarOpen(false);
  };

  const { accessToken } = useAuthStore();
  const { data: profileRes, isLoading: isFetchingProfile } = useMyProfile();
  const { data: addressesRes } = useMyAddresses();
  const { data: cartRes } = useMyCart();

  const profile = profileRes?.data;
  const addresses = addressesRes?.data || [];
  const cartItemsCount = cartRes?.data?.length || 0;

  const pageInfo = useMemo(() => {
    switch (activeSection) {
      case "overview":
        return { title: "Tổng quan", subtitle: "Trung tâm điều khiển của bạn" };
      case "info":
        return {
          title: "Hồ sơ cá nhân",
          subtitle: "Quản lý thông tin định danh",
        };
      case "address":
        return { title: "Sổ địa chỉ", subtitle: "Các điểm giao nhận hàng" };
      case "orders":
        return { title: "Đơn hàng", subtitle: "Lịch sử giao dịch & Thuê máy" };
      case "cart":
        return {
          title: "Giỏ hàng",
          subtitle: "Danh sách sản phẩm chờ thanh toán",
        };
      default:
        return { title: "LensHub", subtitle: "Tài khoản khách hàng" };
    }
  }, [activeSection]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đã đăng xuất");
      router.push("/login");
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  if (isFetchingProfile) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          <p className="text-[11px] font-bold text-zinc-400">
            Đang đồng bộ dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 flex selection:bg-red-100 overflow-x-hidden">
      {/* Sidebar Backdrop - Mobile only */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 shrink-0 border-r border-zinc-100 bg-white flex flex-col fixed h-full z-50 transition-all duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="h-16 sm:h-20 flex items-center justify-between px-6 border-b border-zinc-50">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100 group-hover:rotate-12 transition-transform">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-zinc-950 group-hover:text-red-600 transition-colors">
              LENSHUB<span className="text-red-600">.</span>
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex-1 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-sm font-bold text-zinc-400 mb-5 ml-1">
              Menu chính
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Tổng quan"
                active={activeSection === "overview"}
                onClick={() => onNavigate("overview")}
              />
              <SidebarItem
                icon={<User className="w-4 h-4" />}
                label="Hồ sơ cá nhân"
                active={activeSection === "info"}
                onClick={() => onNavigate("info")}
              />
              <SidebarItem
                icon={<MapPin className="w-4 h-4" />}
                label="Sổ địa chỉ"
                active={activeSection === "address"}
                onClick={() => onNavigate("address")}
              />
              <SidebarItem
                icon={<ShoppingBag className="w-4 h-4" />}
                label="Đơn hàng"
                active={activeSection === "orders"}
                onClick={() => onNavigate("orders")}
              />
              <SidebarItem
                icon={<ShoppingCart className="w-4 h-4" />}
                label="Giỏ hàng"
                active={activeSection === "cart"}
                onClick={() => onNavigate("cart")}
                badge={cartItemsCount > 0 ? cartItemsCount : undefined}
              />
            </nav>
          </div>

          <div>
            <p className="text-[11px] font-bold text-zinc-400 mb-4 ml-1">
              Hỗ trợ
            </p>
            <nav className="space-y-1">
              <SidebarItem
                icon={<Settings className="w-4 h-4" />}
                label="Cài đặt"
                active={false}
                onClick={() => toast.info("Tính năng đang phát triển")}
              />
              <SidebarItem
                icon={<ShieldCheck className="w-4 h-4" />}
                label="Bảo mật"
                active={false}
                onClick={() => toast.info("Tính năng đang phát triển")}
              />
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-50 bg-zinc-50/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Replicated from Admin Style */}
        <header className="sticky top-0 z-30 flex h-16 sm:h-20 w-full items-center justify-between border-b border-zinc-100 bg-white/95 px-4 sm:px-6 backdrop-blur-xl lg:pl-[272px] transition-all duration-300">
          <div className="flex items-center gap-4 lg:gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-12 w-12 rounded-xl hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-zinc-600" />
            </Button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-[28px] font-bold tracking-tight text-zinc-950 truncate max-w-[140px] sm:max-w-none leading-tight">
                  {pageInfo.title}
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />
              </div>
              <span className="text-xs font-medium text-zinc-400 mt-0.5 uppercase tracking-wider">
                {pageInfo.subtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex relative w-64 mr-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <Input
                placeholder="Tìm kiếm nhanh..."
                className="pl-9 h-11 text-xs rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl hover:bg-zinc-100 relative group hidden md:flex"
            >
              <Bell className="h-5 w-5 text-zinc-500 group-hover:text-red-600 transition-colors" />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white" />
            </Button>

            <div className="h-8 w-px bg-zinc-100 mx-1 hidden sm:block" />

            {/* User Dropdown Profile */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={cn(
                  "flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all duration-300 border border-transparent",
                  isUserMenuOpen
                    ? "bg-zinc-100 border-zinc-200"
                    : "hover:bg-zinc-100 hover:border-zinc-200",
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-black shadow-lg">
                  {profile?.fullName?.charAt(0) || "U"}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-black text-zinc-950 tracking-tight leading-none mb-1">
                    {profile?.fullName?.split(" ").pop()}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-bold leading-none">
                    Khách hàng
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-zinc-400 transition-transform duration-300",
                    isUserMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-zinc-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-5 border-b border-zinc-50 flex items-center gap-4 bg-zinc-50/30">
                      <Avatar className="w-10 h-10 rounded-xl">
                        <AvatarImage
                          src={
                            profile?.avatarUrl
                              ? `http://localhost:8080${profile.avatarUrl}`
                              : undefined
                          }
                        />
                        <AvatarFallback className="font-black">
                          {profile?.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate font-black text-zinc-950 text-sm">
                          {profile?.fullName}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-bold truncate">
                          {profile?.email}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                      >
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="w-full">
            {activeSection === "overview" && (
              <OverviewSection
                profile={profile}
                stats={{ addresses, cartItemsCount }}
                onNavigate={onNavigate}
              />
            )}
            {activeSection === "info" && (
              <InfoSection
                key={profile?.id || "info-loading"}
                profile={profile}
              />
            )}
            {activeSection === "address" && <AddressSection />}
            {activeSection === "orders" && <OrdersSection />}
            {activeSection === "cart" && <CartSection />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function CartSection() {
  const { data: cartRes, isLoading } = useMyCart();
  const { mutateAsync: updateItem } = useUpdateCartItem();
  const { mutateAsync: removeItem } = useRemoveCartItem();
  const { mutateAsync: clearCart, isPending: isClearing } = useClearCart();
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<number | null>(null);

  const items = cartRes?.data || [];

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((acc, item) => {
    const price = item.salePrice || item.rentPricePerDay || 0;
    return acc + price * item.quantity;
  }, 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleUpdateQuantity = async (id: number, newQty: number) => {
    if (newQty < 1) {
      setItemToRemove(id);
      setRemoveConfirmOpen(true);
      return;
    }
    try {
      await updateItem({ id, data: { quantity: newQty } });
    } catch (error) {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setClearConfirmOpen(false);
      toast.success("Đã xóa sạch giỏ hàng");
    } catch (error) {
      toast.error("Lỗi khi xóa giỏ hàng");
    }
  };

  const handleRemoveItem = async () => {
    if (!itemToRemove) return;
    try {
      await removeItem(itemToRemove);
      setRemoveConfirmOpen(false);
      setItemToRemove(null);
      toast.success("Đã xóa sản phẩm");
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-400">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-zinc-100 rounded-xl p-16 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-6 border border-zinc-100">
          <ShoppingCart className="w-8 h-8 text-zinc-200" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-950 tracking-tight mb-2">
          Giỏ hàng đang trống
        </h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed font-medium">
          Có vẻ như bạn chưa chọn sản phẩm nào. Hãy khám phá kho thiết bị nhiếp ảnh của chúng tôi ngay!
        </p>
        <Button 
          onClick={() => router.push("/#product-section")}
          className="h-10 px-8 rounded-lg bg-red-600 text-white font-bold hover:bg-zinc-900 transition-all shadow-md shadow-red-100 border-none"
        >
          Khám phá thiết bị
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSelectAll}
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-all",
              selectedIds.length === items.length && items.length > 0
                ? "bg-red-600 border-red-600 text-white"
                : "border-zinc-300 hover:border-red-600 bg-white"
            )}
          >
            {selectedIds.length === items.length && items.length > 0 && <Check className="w-3.5 h-3.5" />}
          </button>
          <h2 className="text-[22px] font-semibold text-zinc-950 tracking-tight">
            Giỏ hàng của bạn ({items.length})
          </h2>
        </div>
        <button
          onClick={() => setClearConfirmOpen(true)}
          disabled={isClearing}
          className="text-[13px] font-medium text-zinc-400 hover:text-red-600 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa toàn bộ
        </button>
      </div>

      <ConfirmDialog
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title="Xóa giỏ hàng"
        description="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng? Thao tác này không thể hoàn tác."
        onConfirm={handleClearCart}
        isLoading={isClearing}
        variant="danger"
      />

      <ConfirmDialog
        open={removeConfirmOpen}
        onOpenChange={setRemoveConfirmOpen}
        title="Xóa sản phẩm"
        description="Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?"
        onConfirm={handleRemoveItem}
        variant="danger"
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "bg-white border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 group transition-all shadow-sm",
                selectedIds.includes(item.id)
                  ? "border-red-600/40 ring-1 ring-red-600/5"
                  : "border-zinc-100",
              )}
            >
              <button
                onClick={() => toggleSelect(item.id)}
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                  selectedIds.includes(item.id)
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-zinc-300 hover:border-red-600 bg-white",
                )}
              >
                {selectedIds.includes(item.id) && <Check className="w-3.5 h-3.5" />}
              </button>

              <div className="w-24 h-24 shrink-0 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 p-2 flex items-center justify-center group-hover:bg-white transition-colors">
                {item.productImage ? (
                  <img
                    src={`http://localhost:8080${item.productImage}`}
                    alt={item.productName}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-zinc-200" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h4 className="text-[18px] font-semibold text-zinc-950 tracking-tight mb-1 truncate leading-tight">
                  {item.productName}
                </h4>
                <p className="text-sm font-normal text-zinc-500 mb-4 leading-relaxed">
                  Đơn giá: {formatVND(Number(item.salePrice || item.rentPricePerDay || 0))}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-100">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:bg-white hover:text-red-600 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-zinc-950">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:bg-white hover:text-red-600 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setItemToRemove(item.id);
                      setRemoveConfirmOpen(true);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-medium text-zinc-400 uppercase tracking-widest mb-1">
                  Thành tiền
                </p>
                <p className="text-[20px] font-bold text-zinc-950 tracking-tight">
                  {formatVND(
                    Number(item.salePrice || item.rentPricePerDay || 0) * item.quantity,
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="xl:col-span-4">
          <div className="bg-white border border-zinc-100 rounded-xl p-6 sticky top-20 shadow-sm overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[20px] font-semibold tracking-tight text-zinc-950 mb-6">
                Tổng đơn hàng
              </h3>

              <div className="space-y-4 mb-8 pb-6 border-b border-zinc-100">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-normal text-sm">Tạm tính</span>
                  <span className="font-medium text-zinc-950 text-[15px]">{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-normal text-sm">Phí vận chuyển</span>
                  <span className="text-emerald-600 font-bold text-[11px] uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md">Miễn phí</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-normal text-sm">Bảo hiểm thiết bị</span>
                  <span className="font-medium text-zinc-950 text-[15px]">Đã bao gồm</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-zinc-400 text-[11px] font-semibold uppercase tracking-widest mb-1.5">Tổng thanh toán</p>
                  <p className="text-[28px] font-bold tracking-tight text-red-600 leading-none">
                    {formatVND(subtotal)}
                  </p>
                </div>
              </div>

              <Button 
                disabled={selectedIds.length === 0}
                className="w-full h-11 rounded-lg bg-red-600 hover:bg-zinc-900 text-white font-bold text-sm transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2 border-none group/btn disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
              >
                Tiếp tục thanh toán ({selectedIds.length})
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>

              <p className="mt-6 text-center text-[11px] text-zinc-500 font-medium leading-relaxed">
                Bằng cách tiếp tục, bạn đồng ý với các <br />
                <span className="text-zinc-400 underline cursor-pointer hover:text-zinc-950 transition-colors">Điều khoản dịch vụ</span> của LensHub.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-[14px] group",
        active
          ? "bg-red-600 text-white shadow-lg shadow-red-100"
          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "transition-transform group-hover:scale-110",
            active ? "text-white" : "text-zinc-400 group-hover:text-zinc-900",
          )}
        >
          {icon}
        </span>
        <span className="tracking-tight">{label}</span>
      </div>
      {badge !== undefined && (
        <span
          className={cn(
            "w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px]",
            active ? "bg-white text-red-600" : "bg-red-50 text-red-600",
          )}
        >
          {badge}
        </span>
      )}
      {active && <ChevronRight className="w-3 h-3 text-white/60" />}
    </button>
  );
}

function OverviewSection({
  profile,
  stats,
  onNavigate,
}: {
  profile: UserProfileResponse | undefined;
  stats: { addresses: ShippingAddressResponse[]; cartItemsCount: number };
  onNavigate: (s: Section) => void;
}) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-zinc-100 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-950 tracking-tight mb-3 leading-tight">
              Chào buổi chiều, <br className="hidden md:block" />{" "}
              {profile?.fullName || "Người dùng"}!
            </h1>
            <p className="text-sm text-zinc-500 font-medium max-w-md leading-relaxed">
              Chào mừng bạn quay trở lại. Hãy quản lý các thiết bị nhiếp ảnh và
              đơn hàng của bạn ngay tại đây.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => onNavigate("info")}
              className="h-10 px-5 rounded-lg bg-zinc-950 text-white font-semibold text-sm hover:bg-red-600 transition-all border-none shadow-lg shadow-zinc-200 hover:shadow-red-200"
            >
              Xem hồ sơ
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("orders")}
              className="h-10 px-5 rounded-lg border-zinc-200 bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm"
            >
              Đơn hàng
            </Button>
          </div>
        </div>
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] -mr-32 -mt-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          icon={<MapPin className="w-6 h-6" />}
          label="Sổ địa chỉ"
          value={`${stats.addresses.length} địa chỉ`}
          color="bg-blue-600"
          onClick={() => onNavigate("address")}
        />
        <OverviewCard
          icon={<ShoppingBag className="w-6 h-6" />}
          label="Đơn hàng"
          value="0 đơn hàng"
          color="bg-amber-500"
          onClick={() => onNavigate("orders")}
        />
        <OverviewCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label="Giỏ hàng"
          value={`${stats.cartItemsCount} sản phẩm`}
          color="bg-red-600"
          onClick={() => onNavigate("cart")}
        />
        <OverviewCard
          icon={<User className="w-6 h-6" />}
          label="Trust Level"
          value="Elite Member"
          color="bg-zinc-900"
          onClick={() => onNavigate("info")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-950 tracking-tight">
              Hoạt động gần đây
            </h3>
            <button
              onClick={() => onNavigate("orders")}
              className="text-sm font-semibold text-red-600 hover:text-zinc-950 transition-colors"
            >
              Xem toàn bộ nhật ký
            </button>
          </div>
          <div className="py-20 flex flex-col items-center justify-center text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
              <ShoppingBag className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-sm font-bold text-zinc-400">
              Chưa có hoạt động giao dịch nào được ghi nhận
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-xl p-8 text-zinc-950 shadow-xl shadow-zinc-200/50 relative overflow-hidden group hover:scale-[1.01] transition-all">
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-8 border border-amber-100 shadow-sm">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-xl font-black mb-2 leading-tight text-zinc-950">
              Hội viên <br /> LensHub Pro
            </h3>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-8">
              Mở khóa tất cả các đặc quyền: Miễn phí vận chuyển, Bảo hiểm thiết
              bị và Ưu tiên đặt lịch thuê máy.
            </p>
            <Button className="w-full h-10 bg-zinc-950 text-white font-semibold text-sm rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-zinc-200">
              Nâng cấp ngay
            </Button>
          </div>
          {/* Subtle decorative background elements */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-zinc-50 rounded-full blur-3xl group-hover:bg-red-50 transition-all" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group bg-white border border-zinc-100 rounded-xl p-6 shadow-sm hover:border-red-600/30 transition-all text-left flex flex-col justify-between h-44 active:scale-95"
    >
      <div
        className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-400 mb-1.5">{label}</p>
        <p className="text-xl font-black text-zinc-950 tracking-tight">
          {value}
        </p>
      </div>
    </button>
  );
}

function InfoSection({
  profile,
}: {
  profile: UserProfileResponse | undefined;
}) {
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
    } catch (error) {
      toast.error("Không thể lưu thay đổi");
    }
  };

  return (
    <div className="bg-white border border-zinc-100 rounded-xl p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-3xl font-black text-zinc-950 tracking-tight mb-2">
            Thông tin chi tiết
          </h1>
          <p className="text-[13px] text-zinc-500 font-medium">
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
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Họ và tên đệm
            </Label>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl focus:bg-white focus:border-red-600/30 font-bold transition-all px-5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Tên
            </Label>
            <Input
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl focus:bg-white focus:border-red-600/30 font-bold transition-all px-5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Giới tính
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(v) =>
                setFormData({
                  ...formData,
                  gender: v as "MALE" | "FEMALE" | "OTHER",
                })
              }
            >
              <SelectTrigger className="w-full h-11! bg-zinc-50/30 border-zinc-100 rounded-xl font-bold px-5 focus:border-red-600/30 transition-all">
                <SelectValue placeholder="Chọn giới tính" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-2xl border-zinc-100 p-1 bg-white">
                <SelectItem value="MALE" className="font-bold py-3">
                  Nam
                </SelectItem>
                <SelectItem value="FEMALE" className="font-bold py-3">
                  Nữ
                </SelectItem>
                <SelectItem value="OTHER" className="font-bold py-3">
                  Khác
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Ngày sinh nhật
            </Label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl focus:bg-white focus:border-red-600/30 font-bold transition-all px-5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Lĩnh vực hoạt động
            </Label>
            <Input
              value={formData.occupation}
              onChange={(e) =>
                setFormData({ ...formData, occupation: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl focus:bg-white focus:border-red-600/30 font-bold transition-all px-5"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Công ty / Studio
            </Label>
            <Input
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl focus:bg-white focus:border-red-600/30 font-bold transition-all px-5"
            />
          </div>
        </div>

        <div className="pt-10 flex items-center gap-4">
          <Button
            type="submit"
            disabled={isUpdating}
            className="flex-1 h-10 rounded-lg bg-red-600 text-white font-semibold text-sm shadow-lg shadow-red-100 hover:bg-zinc-950 transition-all disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Lưu cấu hình hồ sơ"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 px-6 rounded-lg border-zinc-200 bg-white text-zinc-400 font-semibold text-sm hover:bg-zinc-50 hover:text-zinc-950 transition-all"
          >
            Hủy bỏ
          </Button>
        </div>
      </form>
    </div>
  );
}

const CITY_LABELS: Record<City, string> = {
  [City.TUYEN_QUANG]: "Tỉnh Tuyên Quang",
  [City.LAO_CAI]: "Tỉnh Lào Cai",
  [City.THAI_NGUYEN]: "Tỉnh Thái Nguyên",
  [City.PHU_THO]: "Tỉnh Phú Thọ",
  [City.BAC_NINH]: "Tỉnh Bắc Ninh",
  [City.HUNG_YEN]: "Tỉnh Hưng Yên",
  [City.HAI_PHONG]: "Thành phố Hải Phòng",
  [City.NINH_BINH]: "Tỉnh Ninh Bình",
  [City.QUANG_TRI]: "Tỉnh Quảng Trị",
  [City.DA_NANG]: "Thành phố Đà Nẵng",
  [City.QUANG_NGAI]: "Tỉnh Quảng Ngãi",
  [City.GIA_LAI]: "Tỉnh Gia Lai",
  [City.KHANH_HOA]: "Tỉnh Khánh Hoà",
  [City.LAM_DONG]: "Tỉnh Lâm Đồng",
  [City.DAK_LAK]: "Tỉnh Đắk Lắk",
  [City.HO_CHI_MINH]: "Thành phố Hồ Chí Minh",
  [City.DONG_NAI]: "Tỉnh Đồng Nai",
  [City.TAY_NINH]: "Tỉnh Tây Ninh",
  [City.CAN_THO]: "Thành phố Cần Thơ",
  [City.VINH_LONG]: "Tỉnh Vĩnh Long",
  [City.DONG_THAP]: "Tỉnh Đồng Tháp",
  [City.CA_MAU]: "Tỉnh Cà Mau",
  [City.AN_GIANG]: "Tỉnh An Giang",
  [City.HA_NOI]: "Thành phố Hà Nội",
  [City.HUE]: "Thành phố Huế",
  [City.LAI_CHAU]: "Tỉnh Lai Châu",
  [City.DIEN_BIEN]: "Tỉnh Điện Biên",
  [City.SON_LA]: "Tỉnh Sơn La",
  [City.LANG_SON]: "Tỉnh Lạng Sơn",
  [City.QUANG_NINH]: "Tỉnh Quảng Ninh",
  [City.THANH_HOA]: "Tỉnh Thanh Hoá",
  [City.NGHE_AN]: "Tỉnh Nghệ An",
  [City.HA_TINH]: "Tỉnh Hà Tĩnh",
  [City.CAO_BANG]: "Tỉnh Cao Bằng",
};

function AddressSection() {
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
          <h1 className="text-4xl font-black text-zinc-950 tracking-tight mb-2">
            Địa chỉ nhận hàng
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Lưu trữ các điểm giao nhận để thanh toán nhanh hơn
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="h-10 px-5 rounded-lg bg-zinc-950 text-white font-semibold text-sm flex items-center gap-2 hover:bg-red-600 border-none transition-all shadow-lg shadow-zinc-200"
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
                <p className="text-sm font-semibold text-zinc-400 leading-none">
                  Thông tin liên hệ
                </p>
                <p className="text-lg font-bold text-zinc-950 leading-tight">
                  {addr.receiverName} • {addr.receiverPhone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-400 leading-none">
                  Vị trí địa lý
                </p>
                <p className="text-xs font-bold text-zinc-500 leading-relaxed">
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
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Người nhận
            </Label>
            <Input
              value={formData.receiverName}
              onChange={(e) =>
                setFormData({ ...formData, receiverName: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl px-5 font-bold focus:bg-white focus:border-red-600/30 transition-all"
              placeholder="Họ và tên"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Số điện thoại
            </Label>
            <Input
              value={formData.receiverPhone}
              onChange={(e) =>
                setFormData({ ...formData, receiverPhone: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl px-5 font-bold focus:bg-white focus:border-red-600/30 transition-all"
              placeholder="09xx xxx xxx"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Tỉnh / Thành phố
            </Label>
            <Select
              value={formData.province as string}
              onValueChange={(v) =>
                setFormData({ ...formData, province: v as City })
              }
            >
              <SelectTrigger className="w-full! p-5! h-11 bg-zinc-50/30 border-zinc-100 rounded-xl px-5 font-bold focus:border-red-600/30 transition-all text-left">
                <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-2xl border-zinc-100 max-h-72">
                {Object.entries(CITY_LABELS).map(([value, label]) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className="font-bold py-3"
                  >
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Quận / Huyện
            </Label>
            <Input
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl px-5 font-bold focus:bg-white focus:border-red-600/30 transition-all"
              placeholder="Nhập Quận/Huyện"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Phường / Xã
            </Label>
            <Input
              value={formData.ward}
              onChange={(e) =>
                setFormData({ ...formData, ward: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl px-5 font-bold focus:bg-white focus:border-red-600/30 transition-all"
              placeholder="Nhập Phường/Xã"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-400 ml-1">
              Địa chỉ chi tiết
            </Label>
            <Input
              value={formData.detailAddress}
              onChange={(e) =>
                setFormData({ ...formData, detailAddress: e.target.value })
              }
              className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl px-5 font-bold focus:bg-white focus:border-red-600/30 transition-all"
              placeholder="Số nhà, ngõ, tên đường..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-bold text-zinc-400 ml-1">
            Địa chỉ đầy đủ (Tự động cập nhật)
          </Label>
          <Input
            value={formData.fullAddress}
            onChange={(e) =>
              setFormData({ ...formData, fullAddress: e.target.value })
            }
            className="h-11 bg-zinc-50/30 border-zinc-100 rounded-xl px-5 font-bold focus:bg-white focus:border-red-600/30 transition-all"
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
            className="text-xs font-bold text-zinc-500 cursor-pointer"
          >
            Đặt làm địa chỉ giao hàng mặc định
          </label>
        </div>
      </div>
    </AdminFormDialog>
  );
}

function OrdersSection() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-zinc-950 tracking-tight mb-2">
          Đơn hàng của bạn
        </h1>
        <p className="text-sm text-zinc-500 font-medium">
          Theo dõi lịch trình vận chuyển và trạng thái thuê thiết bị
        </p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-24 h-24 rounded-full bg-zinc-50 flex items-center justify-center mb-10 shadow-inner">
          <ShoppingBag className="w-12 h-12 text-zinc-200" />
        </div>
        <h3 className="text-2xl font-black text-zinc-950 tracking-tight mb-3">
          Danh sách đơn hàng rỗng
        </h3>
        <p className="text-sm text-zinc-400 font-medium max-w-sm leading-relaxed mb-12">
          Hiện chưa có dữ liệu giao dịch nào được đồng bộ với tài khoản của bạn.
        </p>
        <Button className="h-10 px-6 rounded-lg bg-zinc-950 text-white font-semibold text-sm hover:bg-red-600 border-none shadow-lg shadow-zinc-200 transition-all">
          Bắt đầu mua sắm ngay
        </Button>
      </div>
    </div>
  );
}
