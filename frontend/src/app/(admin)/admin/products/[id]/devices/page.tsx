"use client";

import { use, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Cpu,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  XCircle,
  PackageSearch,
  Tag,
  Boxes,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProduct } from "@/services/product";
import {
  useGetDevicesByProduct,
  useCreateDevice,
  useUpdateDevice,
  useDeleteDevice,
  useUpdateDeviceStatus,
  DeviceResponse,
  DeviceStatus,
} from "@/services/rental";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { Textarea } from "@/components/ui/textarea";

const STATUS_CONFIG: Record<
  DeviceStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  AVAILABLE: {
    label: "Sẵn sàng",
    bg: "bg-emerald-50/60",
    text: "text-emerald-700",
    border: "border-emerald-100/80",
    icon: CheckCircle2,
  },
  RESERVED: {
    label: "Đặt trước",
    bg: "bg-amber-50/60",
    text: "text-amber-700",
    border: "border-amber-100/80",
    icon: Clock,
  },
  RENTED: {
    label: "Đang thuê",
    bg: "bg-blue-50/60",
    text: "text-blue-700",
    border: "border-blue-100/80",
    icon: RefreshCw,
  },
  MAINTENANCE: {
    label: "Bảo trì",
    bg: "bg-zinc-50/60",
    text: "text-zinc-600",
    border: "border-zinc-200/60",
    icon: Wrench,
  },
  DAMAGED: {
    label: "Hỏng hóc",
    bg: "bg-rose-50/60",
    text: "text-rose-700",
    border: "border-rose-100/80",
    icon: AlertCircle,
  },
  LOST: {
    label: "Bị mất",
    bg: "bg-red-50/60",
    text: "text-red-700",
    border: "border-red-100/80",
    icon: XCircle,
  },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as DeviceStatus[];

interface DeviceFormState {
  serialNumber: string;
  conditionDetails: string;
}

export default function DevicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const productId = parseInt(id);

  const { data: productRes } = useProduct(productId);
  const product = productRes?.data;

  const { data: devicesRes, isLoading } = useGetDevicesByProduct(productId);
  const devices: DeviceResponse[] = devicesRes?.data || [];

  const createMutation = useCreateDevice();
  const updateMutation = useUpdateDevice(productId);
  const updateStatusMutation = useUpdateDeviceStatus(productId);
  const deleteMutation = useDeleteDevice(productId);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<DeviceStatus | "ALL">("ALL");

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<DeviceFormState>({
    serialNumber: "",
    conditionDetails: "",
  });

  // Edit dialog
  const [editingDevice, setEditingDevice] = useState<DeviceResponse | null>(null);
  const [editForm, setEditForm] = useState<DeviceFormState>({
    serialNumber: "",
    conditionDetails: "",
  });

  // Status change dialog
  const [statusDevice, setStatusDevice] = useState<DeviceResponse | null>(null);
  const [newStatus, setNewStatus] = useState<DeviceStatus>(DeviceStatus.AVAILABLE);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = devices.filter((d) => {
    const matchSearch =
      d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (d.conditionDetails || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.serialNumber.trim()) {
      toast.error("Vui lòng nhập số serial");
      return;
    }
    try {
      await createMutation.mutateAsync({
        productId,
        serialNumber: createForm.serialNumber.trim(),
        conditionDetails: createForm.conditionDetails.trim(),
      });
      toast.success("Đã thêm thiết bị mới");
      setIsCreateOpen(false);
      setCreateForm({ serialNumber: "", conditionDetails: "" });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Không thể thêm thiết bị");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    if (!editForm.serialNumber.trim()) {
      toast.error("Vui lòng nhập số serial");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editingDevice.id,
        req: {
          serialNumber: editForm.serialNumber.trim(),
          conditionDetails: editForm.conditionDetails.trim(),
        },
      });
      toast.success("Đã cập nhật thiết bị");
      setEditingDevice(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Không thể cập nhật thiết bị");
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusDevice) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: statusDevice.id,
        req: { status: newStatus },
      });
      toast.success("Đã cập nhật trạng thái");
      setStatusDevice(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Đã xóa thiết bị");
      setDeletingId(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Không thể xóa thiết bị");
    }
  };

  const statusCounts = devices.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Header */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 sm:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            onClick={() => router.push(`/admin/products/${productId}`)}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-all shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-xl">
                Sản phẩm #{productId}
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-none">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Kho thuê: {devices.length} thiết bị
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight leading-tight truncate max-w-lg">
              {product?.name || "Đang tải sản phẩm..."}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-none h-11 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-semibold px-6 transition-all duration-200 gap-2  active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Thêm thiết bị
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          const count = statusCounts[s] || 0;
          const isSelected = filterStatus === s;

          return (
            <button
              key={s}
              onClick={() => setFilterStatus(isSelected ? "ALL" : s)}
              className={cn(
                "flex flex-col items-center gap-2.5 p-4 rounded-xl border bg-white text-center transition-all duration-300  hover:shadow-md active:scale-95 group",
                isSelected
                  ? "border-amber-300 ring-2 ring-amber-200/50 shadow-md"
                  : "border-zinc-100 shadow-sm",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                  isSelected
                    ? "bg-amber-100 text-amber-600"
                    : cn(cfg.bg, cfg.text),
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-semibold text-zinc-950 leading-none">
                  {count}
                </p>
                <p className="text-xs font-semibold text-zinc-400 tracking-tight">
                  {cfg.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters & Content Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm theo mã serial hoặc tình trạng thiết bị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 rounded-xl border-zinc-200 bg-white text-sm font-medium focus:border-red-500 focus:ring-red-500/20 focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-500 transition-all shadow-sm"
            />
          </div>
          {filterStatus !== "ALL" && (
            <Button
              onClick={() => setFilterStatus("ALL")}
              variant="outline"
              className="h-11 px-5 rounded-xl border-zinc-200 bg-white text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <XCircle className="w-4 h-4" />
              Bỏ bộ lọc
            </Button>
          )}
        </div>

        {/* Table List Container */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-400">
              <div className="w-10 h-10 border-3 border-zinc-100 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-sm font-medium">Đang tải danh sách thiết bị...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-400">
              <div className="w-16 h-16 rounded-xl bg-zinc-50 flex items-center justify-center border border-black/5">
                <PackageSearch className="w-8 h-8 text-zinc-300" />
              </div>
              <div className="text-center max-w-sm">
                <p className="text-sm font-semibold text-zinc-900">
                  {devices.length === 0 ? "Chưa có thiết bị nào" : "Không tìm thấy kết quả"}
                </p>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  {devices.length === 0
                    ? "Nhấn nút \"Thêm thiết bị\" ở góc trên để bắt đầu thêm các số serial cho kho cho thuê."
                    : "Không tìm thấy thiết bị nào khớp với từ khóa tìm kiếm của bạn. Hãy thử thay đổi từ khóa."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div className="grid grid-cols-[1.5fr_2fr_140px_100px] gap-4 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <span className="text-xs font-semibold text-zinc-400 tracking-wider ">Số Serial</span>
                <span className="text-xs font-semibold text-zinc-400 tracking-wider ">Mô tả tình trạng</span>
                <span className="text-xs font-semibold text-zinc-400 tracking-wider ">Trạng thái</span>
                <span className="text-xs font-semibold text-zinc-400 tracking-wider  text-right">Thao tác</span>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-zinc-100">
                {filtered.map((d) => {
                  const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG[DeviceStatus.AVAILABLE];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-[1.5fr_2fr_140px_100px] gap-4 px-6 py-4 items-center transition-colors hover:bg-zinc-50/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                          <Cpu className="w-4 h-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold text-zinc-900 truncate">
                          {d.serialNumber}
                        </span>
                      </div>

                      <span className="text-sm text-zinc-500 truncate pr-4">
                        {d.conditionDetails || (
                          <span className="text-zinc-300 italic font-medium">Chưa có thông tin tình trạng</span>
                        )}
                      </span>

                      <div>
                        <button
                          onClick={() => {
                            setStatusDevice(d);
                            setNewStatus(d.status);
                          }}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all duration-200 hover:opacity-85 hover:shadow-sm active:scale-95 w-fit shrink-0",
                            cfg.bg,
                            cfg.text,
                            cfg.border,
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </button>
                      </div>

                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingDevice(d);
                            setEditForm({
                              serialNumber: d.serialNumber,
                              conditionDetails: d.conditionDetails ?? "",
                            });
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 transition-all shadow-sm"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(d.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-red-100 bg-white text-red-500 hover:text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-sm"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Footer */}
              <div className="px-6 py-4 bg-zinc-50/30 flex items-center justify-between border-t border-zinc-100">
                <span className="text-xs font-semibold text-zinc-400">
                  Hiển thị {filtered.length} / {devices.length} thiết bị có sẵn
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Dialog ── */}
      <AdminFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        icon={Plus}
        iconClassName="bg-amber-50 text-amber-600"
        title="Thêm thiết bị mới"
        description="Nhập số serial để đăng ký thiết bị vào danh sách kho cho thuê."
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        submitText="Thêm thiết bị"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">
              Số Serial <span className="text-red-500">*</span>
            </label>
            <Input
              value={createForm.serialNumber}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, serialNumber: e.target.value }))
              }
              placeholder="Ví dụ: SN-2024-001"
              className="h-11 rounded-xl border-zinc-200 bg-zinc-50/70 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-red-500/40 focus:bg-white focus:ring-red-500/10 focus-visible:border-red-500/40 focus-visible:ring-2 focus-visible:ring-red-500/10"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700">Mô tả tình trạng</label>
              <span className="text-[11px] text-zinc-400 font-semibold">Tùy chọn</span>
            </div>
            <Textarea
              value={createForm.conditionDetails}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, conditionDetails: e.target.value }))
              }
              placeholder="Ví dụ: Mới 99%, chưa qua sử dụng..."
              className="min-h-[90px] resize-none rounded-xl border-zinc-200 bg-zinc-50/70 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-red-500/40 focus:bg-white focus:ring-red-500/10 focus-visible:border-red-500/40 focus-visible:ring-2 focus-visible:ring-red-500/10"
            />
          </div>
        </div>
      </AdminFormDialog>

      {/* ── Edit Dialog ── */}
      <AdminFormDialog
        open={!!editingDevice}
        onOpenChange={(open) => { if (!open) setEditingDevice(null); }}
        icon={Pencil}
        iconClassName="bg-zinc-50 text-zinc-600"
        title="Chỉnh sửa thiết bị"
        description={`Cập nhật thông tin chi tiết cho thiết bị: ${editingDevice?.serialNumber ?? ""}`}
        onSubmit={handleEdit}
        isPending={updateMutation.isPending}
        submitText="Lưu thay đổi"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700">
              Số Serial <span className="text-red-500">*</span>
            </label>
            <Input
              value={editForm.serialNumber}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, serialNumber: e.target.value }))
              }
              className="h-11 rounded-xl border-zinc-200 bg-zinc-50/70 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-red-500/40 focus:bg-white focus:ring-red-500/10 focus-visible:border-red-500/40 focus-visible:ring-2 focus-visible:ring-red-500/10"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700">Mô tả tình trạng</label>
              <span className="text-[11px] text-zinc-400 font-semibold">Tùy chọn</span>
            </div>
            <Textarea
              value={editForm.conditionDetails}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, conditionDetails: e.target.value }))
              }
              placeholder="Ví dụ: Mới 99%, có trầy nhẹ ở mặt kính..."
              className="min-h-[90px] resize-none rounded-xl border-zinc-200 bg-zinc-50/70 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-red-500/40 focus:bg-white focus:ring-red-500/10 focus-visible:border-red-500/40 focus-visible:ring-2 focus-visible:ring-red-500/10"
            />
          </div>
        </div>
      </AdminFormDialog>

      {/* ── Status Change Dialog ── */}
      <AdminFormDialog
        open={!!statusDevice}
        onOpenChange={(open) => { if (!open) setStatusDevice(null); }}
        icon={RefreshCw}
        iconClassName="bg-blue-50 text-blue-600 animate-spin-slow"
        title="Cập nhật trạng thái"
        description={`Thay đổi trạng thái vận hành của thiết bị: ${statusDevice?.serialNumber ?? ""}`}
        onSubmit={handleStatusChange}
        isPending={updateStatusMutation.isPending}
        submitText="Cập nhật trạng thái"
      >
        <div className="grid grid-cols-2 gap-3">
          {ALL_STATUSES.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const Icon = cfg.icon;
            const isSelected = newStatus === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setNewStatus(s)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-[0.98] text-left",
                  isSelected
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-md shadow-zinc-200"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50/50",
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isSelected ? "text-white" : cfg.text)} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </AdminFormDialog>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => { if (!open) setDeletingId(null); }}
        onConfirm={handleDelete}
        title="Xóa thiết bị?"
        description="Thiết bị này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu kho cho thuê. Hành động này không thể khôi phục."
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
