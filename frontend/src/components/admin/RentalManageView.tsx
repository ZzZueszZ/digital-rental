"use client";

import { useState } from "react";
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Loader2,
  AlertTriangle,
  User,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, formatVND, formatDate } from "@/lib/utils";
import { Pagination } from "@/app/(staff)/staff/components/Pagination";
import { EmptyState } from "@/app/(staff)/staff/users/components/EmptyState";
import { StatCard } from "@/app/(staff)/staff/components/StatCard";
import { RentalDetailDialog } from "@/components/common/RentalDetailDialog";
import {
  RentalOrderStatus,
  useStaffRentals,
  usePrepareRental,
  useCreateHandoverReport,
  useCollectDeposit,
  useHandoverDevices,
  useCreateReturnReport,
  useCompleteRental,
  rentalService,
  DeviceResponse,
  RiskLevel
} from "@/services/rental";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";

export function RentalManageView({ portalType }: { portalType: "admin" | "staff" | "super-admin" }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RentalOrderStatus | "ALL">("ALL");

  const { data: rentalsRes, isLoading, refetch } = useStaffRentals({
    page,
    size: 10,
    status: statusFilter === "ALL" ? undefined : statusFilter
  });

  const prepareMutation = usePrepareRental();
  const handoverReportMutation = useCreateHandoverReport();
  const collectDepositMutation = useCollectDeposit();
  const handoverMutation = useHandoverDevices();
  const returnReportMutation = useCreateReturnReport();
  const completeMutation = useCompleteRental();

  const rentals = rentalsRes?.data || [];
  const pagination = rentalsRes?.meta; // page/size/total info if present, otherwise default
  const totalPages = rentalsRes?.meta?.totalPages || 1;
  const totalElements = rentalsRes?.meta?.totalElements || rentals.length;

  const [selectedRental, setSelectedRental] = useState<any>(null);
  
  // Modals state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailRentalId, setDetailRentalId] = useState<number | null>(null);

  const handleOpenDetail = (id: number) => {
    setDetailRentalId(id);
    setIsDetailOpen(true);
  };

  // Form values
  const [rejectReason, setRejectReason] = useState("");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.LOW_RISK);
  const [deviceAssignments, setDeviceAssignments] = useState<Record<number, number>>({}); // itemId -> deviceId
  const [availableDevicesMap, setAvailableDevicesMap] = useState<Record<number, DeviceResponse[]>>({});
  const [loadingDevices, setLoadingDevices] = useState(false);

  const [inspectorName, setInspectorName] = useState("");
  const [itemConditions, setItemConditions] = useState<Record<number, string>>({});
  const [damageFee, setDamageFee] = useState<number>(0);

  const handleOpenApprove = async (rental: any) => {
    setSelectedRental(rental);
    setDepositAmount(rental.estimatedDepositAmount || 0);
    setRiskLevel(rental.riskLevel || RiskLevel.LOW_RISK);
    setDeviceAssignments({});
    setAvailableDevicesMap({});
    setIsApproveOpen(true);
    setLoadingDevices(true);

    try {
      const map: Record<number, DeviceResponse[]> = {};
      for (const item of rental.items) {
        const res = await rentalService.getAvailableDevices(item.productId);
        map[item.productId] = res.data || [];
      }
      setAvailableDevicesMap(map);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách thiết bị sẵn sàng");
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleApproveSubmit = async () => {
    // Validate assignments
    for (const item of selectedRental.items) {
      if (!deviceAssignments[item.id]) {
        toast.error(`Vui lòng chọn thiết bị cho sản phẩm: ${item.productName}`);
        return;
      }
    }

    try {
      await prepareMutation.mutateAsync({
        id: selectedRental.id,
        req: {
          itemDeviceAssignments: deviceAssignments,
          estimatedDepositAmount: depositAmount,
          riskLevel: riskLevel
        }
      });
      toast.success("Duyệt đơn thuê và gán thiết bị thành công!");
      setIsApproveOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi phê duyệt");
    }
  };

  // handleOpenReject and handleRejectSubmit removed because reject logic was removed

  const handlePayDeposit = async (id: number, amount: number) => {
    try {
      await collectDepositMutation.mutateAsync({
        id: id,
        req: {
          amount: amount,
          paymentMethod: "CASH"
        }
      });
      toast.success("Xác nhận thu tiền cọc offline thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thanh toán cọc");
    }
  };

  const handleOpenHandover = (rental: any) => {
    setSelectedRental(rental);
    setInspectorName("");
    const initConditions: Record<number, string> = {};
    rental.items.forEach((item: any) => {
      initConditions[item.id] = "Bình thường";
    });
    setItemConditions(initConditions);
    setIsHandoverOpen(true);
  };

  const handleHandoverSubmit = async () => {
    if (!inspectorName.trim()) {
      toast.error("Vui lòng nhập tên nhân viên bàn giao");
      return;
    }
    try {
      await handoverReportMutation.mutateAsync({
        id: selectedRental.id,
        req: {
          serialNumber: "HR-" + Date.now(),
          bodyCondition: "Bình thường",
          lensCondition: "Bình thường",
          batteryCondition: "Bình thường",
          accessoryCondition: "Bình thường",
          riskLevel: selectedRental.riskLevel || RiskLevel.LOW_RISK,
          finalDepositAmount: selectedRental.finalDepositAmount || 0,
          note: `Nhân viên kiểm tra: ${inspectorName}`,
          itemConditions: itemConditions
        }
      });
      toast.success("Đã tạo biên bản bàn giao thành công!");
      setIsHandoverOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi bàn giao");
    }
  };

  const handleOpenReturn = (rental: any) => {
    setSelectedRental(rental);
    setInspectorName("");
    setDamageFee(0);
    const initConditions: Record<number, string> = {};
    rental.items.forEach((item: any) => {
      initConditions[item.id] = item.conditionBeforeHandover || "Bình thường";
    });
    setItemConditions(initConditions);
    setIsReturnOpen(true);
  };

  const handleReturnSubmit = async () => {
    if (!inspectorName.trim()) {
      toast.error("Vui lòng nhập tên nhân viên nhận trả");
      return;
    }
    try {
      await returnReportMutation.mutateAsync({
        id: selectedRental.id,
        req: {
          returnDate: new Date().toISOString(),
          bodyConditionAfter: "Bình thường",
          lensConditionAfter: "Bình thường",
          batteryConditionAfter: "Bình thường",
          accessoryConditionAfter: "Bình thường",
          lateDays: 0,
          lateFee: 0,
          damageFee: damageFee,
          missingAccessoryFee: 0,
          note: `Nhân viên kiểm tra: ${inspectorName}`,
          itemConditions: itemConditions
        }
      });
      toast.success("Nhận trả thiết bị thành công!");
      setIsReturnOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi trả thiết bị");
    }
  };

  const handleSettle = async (id: number) => {
    try {
      await completeMutation.mutateAsync({
        id: id,
        req: {
          refundMethod: "CASH",
          note: "Hoàn tất hợp đồng"
        }
      });
      toast.success("Quyết toán đơn thuê và hoàn cọc thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi quyết toán");
    }
  };


  const handleHandoverDevices = async (id: number) => {
    try {
      await handoverMutation.mutateAsync({ id });
      toast.success("Đã thực hiện bàn giao thiết bị thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi bàn giao thiết bị");
    }
  };

  const getStatusColor = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_PAYMENT:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "bg-blue-50 text-blue-600 border-blue-100";
      case RentalOrderStatus.WAITING_PICKUP:
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case RentalOrderStatus.RENTING:
        return "bg-purple-50 text-purple-600 border-purple-100";
      case RentalOrderStatus.RETURNED:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      case RentalOrderStatus.COMPLETED:
        return "bg-emerald-600 text-white border-emerald-600";
      case RentalOrderStatus.CANCELLED:
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-zinc-50 text-zinc-500 border-zinc-100";
    }
  };

  const getStatusLabel = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_PAYMENT:
        return "Chờ TT phí";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "Đã TT phí";
      case RentalOrderStatus.WAITING_PICKUP:
        return "Chờ nhận máy/Ký HĐ";
      case RentalOrderStatus.RENTING:
        return "Đang thuê";
      case RentalOrderStatus.RETURNED:
        return "Đã trả máy - Quyết toán";
      case RentalOrderStatus.COMPLETED:
        return "Hoàn tất";
      case RentalOrderStatus.CANCELLED:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const filteredRentals = rentals.filter(
    (r) =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.shippingName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-4 lg:space-y-6">
      {/* KPI Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng yêu cầu thuê"
          value={totalElements}
          trend={8}
          icon={Calendar}
          accent="bg-red-600"
        />
        <StatCard
          title="Chờ chuẩn bị"
          value={rentals.filter((r) => r.status === RentalOrderStatus.PAID_RENTAL_FEE).length}
          icon={Clock}
          accent="bg-amber-500"
        />
        <StatCard
          title="Đang thuê máy"
          value={rentals.filter((r) => r.status === RentalOrderStatus.RENTING).length}
          icon={Truck}
          accent="bg-indigo-500"
        />
        <StatCard
          title="Chờ quyết toán"
          value={rentals.filter((r) => r.status === RentalOrderStatus.RETURNED).length}
          icon={CheckCircle2}
          accent="bg-emerald-500"
        />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 sm:py-5 border-b border-zinc-50">
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-100/20">
                  <Calendar className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                <h2 className="text-[30px] font-semibold text-zinc-950 tracking-tight leading-tight">
                  Quản lý thuê máy ảnh
                </h2>
              </div>
              <p className="text-[14px] text-zinc-500 font-medium ml-12">
                Duyệt hồ sơ, bàn giao/nhận trả thiết bị vật lý và ký kết hợp đồng điện tử
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(0);
                }}
                className="h-10 px-3 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 bg-white outline-none focus:border-red-600"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value={RentalOrderStatus.PENDING_PAYMENT}>Chờ thanh toán phí</option>
                <option value={RentalOrderStatus.PAID_RENTAL_FEE}>Đã TT phí - Chờ chuẩn bị</option>
                <option value={RentalOrderStatus.WAITING_PICKUP}>Chờ nhận máy</option>
                <option value={RentalOrderStatus.RENTING}>Đang cho thuê</option>
                <option value={RentalOrderStatus.RETURNED}>Đã trả - Chờ quyết toán</option>
                <option value={RentalOrderStatus.COMPLETED}>Hoàn thành / Hoàn cọc</option>
              </select>

              <div className="relative flex-1 xl:w-80 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-red-600 transition-colors duration-200" />
                <Input
                  placeholder="Tìm theo mã đơn, email, người nhận..."
                  className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:border-red-500/30 transition-all text-xs font-medium text-zinc-900"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">Đơn thuê</th>
                <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">Khách hàng</th>
                <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">Thời hạn thuê</th>
                <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">Phí thuê & Cọc</th>
                <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400">Trạng thái</th>
                <th className="px-6 py-3.5 text-[13px] font-bold text-zinc-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6">
                      <div className="h-12 bg-zinc-50 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="Không tìm thấy đơn thuê nào"
                      description="Hãy đổi bộ lọc hoặc từ khóa tìm kiếm."
                    />
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-zinc-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-950">#{rental.code}</span>
                        <span className="text-[10px] text-zinc-400 font-semibold mt-1">
                          {rental.items.length} thiết bị
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-950">{rental.shippingName}</span>
                        <span className="text-[11px] text-zinc-400 mt-0.5">{rental.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                        <span>{rental.startDate.split("T")[0]}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-300" />
                        <span>{rental.endDate.split("T")[0]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-red-600">{formatVND(rental.rentalFee)}</span>
                        <span className="text-[10px] text-amber-600 font-semibold mt-0.5">
                          Cọc: {formatVND(rental.finalDepositAmount ?? rental.estimatedDepositAmount ?? 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-xl text-[11px] font-bold border",
                        getStatusColor(rental.status)
                      )}>
                        {getStatusLabel(rental.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenDetail(rental.id)}
                          className="h-8 px-2.5 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Chi tiết
                        </Button>
                        {/* PAID_RENTAL_FEE: Prepare devices */}
                        {rental.status === RentalOrderStatus.PAID_RENTAL_FEE && (
                          <Button
                            onClick={() => handleOpenApprove(rental)}
                            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-none"
                          >
                            Chuẩn bị thiết bị
                          </Button>
                        )}

                        {/* WAITING_PICKUP actions */}
                        {rental.status === RentalOrderStatus.WAITING_PICKUP && (
                          <>
                            {/* Case 1: Contract not signed/locked */}
                            {(!rental.contract || !(rental.contract.isLocked || rental.contract.locked)) ? (
                              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 animate-pulse">
                                Chờ khách ký HĐ (Trực tuyến)
                              </span>
                            ) : (
                              <>
                                {/* Case 2: Handover report not created yet (finalDepositAmount is null/undefined) */}
                                {(!rental.finalDepositAmount && rental.finalDepositAmount !== 0) ? (
                                  <Button
                                    onClick={() => handleOpenHandover(rental)}
                                    className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold border-none"
                                  >
                                    Lập BB bàn giao
                                  </Button>
                                ) : (
                                  <>
                                    {/* Case 3: Deposit not collected */}
                                    {rental.depositStatus !== "PAID" ? (
                                      <Button
                                        onClick={() => handlePayDeposit(rental.id, rental.finalDepositAmount || 0)}
                                        className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold border-none"
                                      >
                                        Thu tiền cọc
                                      </Button>
                                    ) : (
                                      /* Case 4: Ready to handover */
                                      <Button
                                        onClick={() => handleHandoverDevices(rental.id)}
                                        className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-none"
                                      >
                                        Bàn giao máy
                                      </Button>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* RENTING: Return Devices */}
                        {rental.status === RentalOrderStatus.RENTING && (
                          <Button
                            onClick={() => handleOpenReturn(rental)}
                            className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold border-none"
                          >
                            Nhận trả máy
                          </Button>
                        )}

                        {/* RETURNED: Complete / Settle */}
                        {rental.status === RentalOrderStatus.RETURNED && (
                          <Button
                            onClick={() => handleSettle(rental.id)}
                            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-none"
                          >
                            Quyết toán & Hoàn cọc
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={10}
          onPageChange={setPage}
        />
      </div>

      {/* Approve Modal */}
      {selectedRental && (
        <AdminFormDialog
          open={isApproveOpen}
          onOpenChange={setIsApproveOpen}
          title="Duyệt đơn đặt thuê"
          description="Thiết lập số tiền đặt cọc và gán thiết bị vật lý cụ thể trong kho"
          icon={CheckCircle2}
          onSubmit={handleApproveSubmit}
          isPending={prepareMutation.isPending}
          submitText="Chuẩn bị & Tạo Hợp đồng nháp"
        >
          {loadingDevices ? (
            <div className="py-10 flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
              <p className="text-xs text-zinc-400 font-bold">Đang tải danh sách thiết bị vật lý...</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Đánh giá mức độ rủi ro (CIC)
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950 font-bold text-xs bg-white"
                >
                  <option value={RiskLevel.LOW_RISK}>LOW RISK (Rủi ro thấp - Cọc ít/Miễn cọc)</option>
                  <option value={RiskLevel.MEDIUM_RISK}>MEDIUM RISK (Rủi ro trung bình - Cọc một phần)</option>
                  <option value={RiskLevel.HIGH_RISK}>HIGH RISK (Rủi ro cao - Cọc 100% giá trị)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Cập nhật số tiền đặt cọc (VND)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950 font-bold text-sm"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Gán thiết bị vật lý cụ thể (Theo số Serial)
                </label>
                {selectedRental.items.map((item: any) => {
                  const devs = availableDevicesMap[item.productId] || [];
                  return (
                    <div key={item.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
                      <div className="text-xs font-bold text-zinc-900">{item.productName}</div>
                      <select
                        value={deviceAssignments[item.id] || ""}
                        onChange={(e) => setDeviceAssignments({ ...deviceAssignments, [item.id]: Number(e.target.value) })}
                        className="w-full h-9 rounded-lg border border-zinc-200 bg-white text-xs font-semibold px-2 outline-none"
                      >
                        <option value="">-- Chọn số Serial thiết bị trống --</option>
                        {devs.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.serialNumber} ({d.conditionDetails || "Bình thường"})
                          </option>
                        ))}
                      </select>
                      {devs.length === 0 && (
                        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Hết thiết bị sẵn sàng trong kho!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </AdminFormDialog>
      )}

          {/* Reject modal removed */}

      {/* Handover Modal */}
      {selectedRental && (
        <AdminFormDialog
          open={isHandoverOpen}
          onOpenChange={setIsHandoverOpen}
          title="Bàn giao thiết bị vật lý"
          description="Ghi nhận biên bản kiểm tra trước khi khách hàng mang thiết bị đi"
          icon={ClipboardList}
          onSubmit={handleHandoverSubmit}
          isPending={handoverReportMutation.isPending}
          submitText="Lập biên bản bàn giao"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Tên nhân viên kiểm tra bàn giao
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950 text-xs font-semibold"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Ghi nhận tình trạng thiết bị
              </label>
              {selectedRental.items.map((item: any) => (
                <div key={item.id} className="p-3 bg-zinc-50 rounded-xl space-y-2 border border-zinc-100">
                  <div className="text-xs font-bold text-zinc-900">
                    {item.productName} ({item.deviceSerialNumber})
                  </div>
                  <input
                    type="text"
                    value={itemConditions[item.id] || ""}
                    onChange={(e) => setItemConditions({ ...itemConditions, [item.id]: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
        </AdminFormDialog>
      )}

      {/* Return Modal */}
      {selectedRental && (
        <AdminFormDialog
          open={isReturnOpen}
          onOpenChange={setIsReturnOpen}
          title="Nhận trả thiết bị vật lý"
          description="Ghi nhận biên bản kiểm tra tình trạng sau khi hoàn trả và tính phí phát sinh"
          icon={ClipboardList}
          onSubmit={handleReturnSubmit}
          isPending={returnReportMutation.isPending}
          submitText="Lập biên bản trả"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Tên nhân viên kiểm tra nhận trả
              </label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn B"
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950 text-xs font-semibold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Phí phạt hỏng hóc phát sinh (VND)
              </label>
              <input
                type="number"
                value={damageFee}
                onChange={(e) => setDamageFee(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950 font-bold text-sm text-red-600"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Ghi nhận tình trạng thiết bị
              </label>
              {selectedRental.items.map((item: any) => (
                <div key={item.id} className="p-3 bg-zinc-50 rounded-xl space-y-2 border border-zinc-100">
                  <div className="text-xs font-bold text-zinc-900">
                    {item.productName} ({item.deviceSerialNumber})
                  </div>
                  <input
                    type="text"
                    value={itemConditions[item.id] || ""}
                    onChange={(e) => setItemConditions({ ...itemConditions, [item.id]: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-medium"
                  />
                </div>
              ))}
            </div>
          </div>
        </AdminFormDialog>
      )}

      {isDetailOpen && detailRentalId !== null && (
        <RentalDetailDialog
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setDetailRentalId(null);
          }}
          rentalId={detailRentalId}
          hideSignAction={true}
          portalType={portalType}
        />
      )}
    </div>
  );
}
