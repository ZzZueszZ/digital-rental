"use client";

import { useEffect, useMemo, useState } from "react";
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
  Eye,
  MoreHorizontal,
  CreditCard,
  FileText,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
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
  RiskLevel,
  RentalOrderResponse,
} from "@/services/rental";
import { AdminFormDialog } from "@/components/common/AdminFormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const parseDateOnly = (value?: string | null) => {
  if (!value) return null;
  const datePart = value.split("T")[0];
  const date = new Date(`${datePart}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const diffCalendarDays = (from: Date, to: Date) => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
};

const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type ReturnAdjustmentMode = "EARLY" | "LATE" | null;

export function RentalManageView({
  portalType,
}: {
  portalType: "admin" | "staff" | "super-admin";
}) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RentalOrderStatus | "ALL">(
    "ALL",
  );

  const {
    data: rentalsRes,
    isLoading,
    refetch,
  } = useStaffRentals({
    page,
    size: 10,
    status: statusFilter === "ALL" ? undefined : statusFilter,
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

  const [selectedRental, setSelectedRental] =
    useState<RentalOrderResponse | null>(null);

  // Modals state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailRentalId, setDetailRentalId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
    variant?: "danger" | "warning" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const handleOpenDetail = (id: number) => {
    setDetailRentalId(id);
    setIsDetailOpen(true);
  };

  // Form values
  const [rejectReason, setRejectReason] = useState("");
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(RiskLevel.LOW_RISK);
  const [deviceAssignments, setDeviceAssignments] = useState<
    Record<number, number | undefined>
  >({}); // itemId -> deviceId
  const [availableDevicesMap, setAvailableDevicesMap] = useState<
    Record<number, DeviceResponse[]>
  >({});
  const [loadingDevices, setLoadingDevices] = useState(false);

  const [inspectorName, setInspectorName] = useState("");
  const [itemConditions, setItemConditions] = useState<Record<number, string>>(
    {},
  );
  const [returnDate, setReturnDate] = useState(getTodayDateInputValue);
  const [returnAdjustmentMode, setReturnAdjustmentMode] =
    useState<ReturnAdjustmentMode>(null);
  const [earlyReturnDays, setEarlyReturnDays] = useState<number>(0);
  const [lateReturnDays, setLateReturnDays] = useState<number>(0);
  const [damageFee, setDamageFee] = useState<number>(0);

  const formatMoneyInput = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(Math.max(0, value || 0));

  const parseMoneyInput = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    return numericValue ? Number(numericValue) : 0;
  };

  const returnSettlement = useMemo(() => {
    const dailyRentalTotal =
      selectedRental?.items.reduce(
        (total, item) => total + (item.pricePerDay || 0),
        0,
      ) || 0;
    const deposit =
      selectedRental?.finalDepositAmount ??
      selectedRental?.estimatedDepositAmount ??
      0;
    const rentalStartDate = parseDateOnly(selectedRental?.startDate);
    const rentalEndDate = parseDateOnly(selectedRental?.endDate);
    const actualReturnDate = parseDateOnly(returnDate);
    const isReturnDateBeforeStart =
      !!rentalStartDate &&
      !!actualReturnDate &&
      actualReturnDate.getTime() < rentalStartDate.getTime();
    const maxEarlyReturnDays =
      rentalEndDate && actualReturnDate
        ? Math.max(0, diffCalendarDays(actualReturnDate, rentalEndDate))
        : 0;
    const maxLateReturnDays =
      rentalEndDate && actualReturnDate
        ? Math.max(0, diffCalendarDays(rentalEndDate, actualReturnDate))
        : 0;
    const effectiveEarlyReturnDays =
      returnAdjustmentMode === "EARLY" ? Math.max(0, earlyReturnDays) : 0;
    const effectiveLateReturnDays =
      returnAdjustmentMode === "LATE" ? Math.max(0, lateReturnDays) : 0;
    const earlyRefund = effectiveEarlyReturnDays * dailyRentalTotal * 0.8;
    const lateFee = effectiveLateReturnDays * dailyRentalTotal * 1.5;
    const damage = Math.max(0, damageFee);
    const totalPenalty = lateFee + damage;
    const refundAmount = Math.max(0, deposit + earlyRefund - totalPenalty);
    const extraPaymentAmount = Math.max(
      0,
      totalPenalty - deposit - earlyRefund,
    );

    return {
      dailyRentalTotal,
      deposit,
      earlyRefund,
      lateFee,
      damage,
      totalPenalty,
      refundAmount,
      extraPaymentAmount,
      maxEarlyReturnDays,
      maxLateReturnDays,
      isReturnDateBeforeStart,
      effectiveEarlyReturnDays,
      effectiveLateReturnDays,
    };
  }, [
    damageFee,
    earlyReturnDays,
    lateReturnDays,
    returnAdjustmentMode,
    returnDate,
    selectedRental,
  ]);

  useEffect(() => {
    if (!isReturnOpen || !selectedRental) return;

    const rentalEndDate = parseDateOnly(selectedRental.endDate);
    const actualReturnDate = parseDateOnly(returnDate);
    if (!rentalEndDate || !actualReturnDate) return;

    const computedEarlyDays = Math.max(
      0,
      diffCalendarDays(actualReturnDate, rentalEndDate),
    );
    const computedLateDays = Math.max(
      0,
      diffCalendarDays(rentalEndDate, actualReturnDate),
    );

    if (computedEarlyDays > 0) {
      setReturnAdjustmentMode("EARLY");
      setEarlyReturnDays(computedEarlyDays);
      setLateReturnDays(0);
      return;
    }

    if (computedLateDays > 0) {
      setReturnAdjustmentMode("LATE");
      setEarlyReturnDays(0);
      setLateReturnDays(computedLateDays);
      return;
    }

    setReturnAdjustmentMode(null);
    setEarlyReturnDays(0);
    setLateReturnDays(0);
  }, [isReturnOpen, returnDate, selectedRental]);

  const handleReturnAdjustmentModeChange = (
    mode: Exclude<ReturnAdjustmentMode, null>,
  ) => {
    if (returnAdjustmentMode === mode) {
      return;
    }

    setReturnAdjustmentMode(mode);
    if (mode === "EARLY") {
      if (returnSettlement.maxEarlyReturnDays <= 0) {
        toast.error("Ngày trả thực tế không phát sinh số ngày trả sớm.");
        setReturnAdjustmentMode(null);
        return;
      }
      setEarlyReturnDays(returnSettlement.maxEarlyReturnDays);
      setLateReturnDays(0);
      return;
    }

    if (returnSettlement.maxLateReturnDays <= 0) {
      toast.error("Ngày trả thực tế không phát sinh số ngày trả trễ.");
      setReturnAdjustmentMode(null);
      return;
    }
    setEarlyReturnDays(0);
    setLateReturnDays(returnSettlement.maxLateReturnDays);
  };

  const handleOpenApprove = async (rental: RentalOrderResponse) => {
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
    if (!selectedRental) return;
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
          itemDeviceAssignments: deviceAssignments as Record<number, number>,
          estimatedDepositAmount: depositAmount,
          riskLevel: riskLevel,
        },
      });
      toast.success("Duyệt đơn thuê và gán thiết bị thành công!");
      setIsApproveOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi phê duyệt");
    }
  };

  // handleOpenReject and handleRejectSubmit removed because reject logic was removed

  const handlePayDeposit = async (id: number, amount: number) => {
    const rental = rentals.find((r) => r.id === id);
    const code = rental?.code || "";
    setConfirmDialog({
      open: true,
      title: "Xác nhận thu tiền cọc",
      description: `Xác nhận đã thu tiền cọc offline số tiền ${formatVND(amount)} của đơn thuê #${code}?`,
      variant: "info",
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          await collectDepositMutation.mutateAsync({
            id: id,
            req: {
              amount: amount,
              paymentMethod: "CASH",
            },
          });
          toast.success("Xác nhận thu tiền cọc offline thành công!");
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || "Lỗi thanh toán cọc");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleOpenHandover = (rental: RentalOrderResponse) => {
    setSelectedRental(rental);
    setInspectorName("");
    const initConditions: Record<number, string> = {};
    rental.items.forEach((item) => {
      initConditions[item.id] = "Bình thường";
    });
    setItemConditions(initConditions);
    setIsHandoverOpen(true);
  };

  const handleHandoverSubmit = async () => {
    if (!selectedRental) return;
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
          itemConditions: itemConditions,
        },
      });
      toast.success("Đã tạo biên bản bàn giao thành công!");
      setIsHandoverOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi bàn giao");
    }
  };

  const handleOpenReturn = (rental: RentalOrderResponse) => {
    setSelectedRental(rental);
    setInspectorName("");
    setReturnDate(getTodayDateInputValue());
    setReturnAdjustmentMode(null);
    setEarlyReturnDays(0);
    setLateReturnDays(0);
    setDamageFee(0);
    const initConditions: Record<number, string> = {};
    rental.items.forEach((item) => {
      initConditions[item.id] = item.conditionBeforeHandover || "Bình thường";
    });
    setItemConditions(initConditions);
    setIsReturnOpen(true);
  };

  const handleReturnSubmit = async () => {
    if (!selectedRental) return;
    if (!inspectorName.trim()) {
      toast.error("Vui lòng nhập tên nhân viên nhận trả");
      return;
    }
    if (
      returnSettlement.effectiveEarlyReturnDays > 0 &&
      returnSettlement.effectiveLateReturnDays > 0
    ) {
      toast.error("Không thể vừa trả sớm vừa trả trễ trong cùng biên bản");
      return;
    }
    if (returnSettlement.isReturnDateBeforeStart) {
      toast.error("Ngày trả thực tế không được trước ngày bắt đầu thuê.");
      return;
    }
    if (
      returnSettlement.effectiveEarlyReturnDays >
      returnSettlement.maxEarlyReturnDays
    ) {
      toast.error(
        `Số ngày trả sớm không hợp lệ. Theo ngày trả thực tế, tối đa ${returnSettlement.maxEarlyReturnDays} ngày.`,
      );
      return;
    }
    if (
      returnSettlement.effectiveLateReturnDays >
      returnSettlement.maxLateReturnDays
    ) {
      toast.error(
        `Số ngày trả trễ không hợp lệ. Theo ngày trả thực tế, tối đa ${returnSettlement.maxLateReturnDays} ngày.`,
      );
      return;
    }
    try {
      await returnReportMutation.mutateAsync({
        id: selectedRental.id,
        req: {
          returnDate: `${returnDate}T00:00:00`,
          bodyConditionAfter: "Bình thường",
          lensConditionAfter: "Bình thường",
          batteryConditionAfter: "Bình thường",
          accessoryConditionAfter: "Bình thường",
          earlyReturnDays: returnSettlement.effectiveEarlyReturnDays,
          lateDays: returnSettlement.effectiveLateReturnDays,
          lateFee: returnSettlement.lateFee,
          damageFee: returnSettlement.damage,
          missingAccessoryFee: 0,
          note: `Nhân viên kiểm tra: ${inspectorName}`,
          itemConditions: itemConditions,
        },
      });
      toast.success("Nhận trả thiết bị thành công!");
      setIsReturnOpen(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi trả thiết bị");
    }
  };

  const handleSettle = async (id: number) => {
    const rental = rentals.find((r) => r.id === id);
    const code = rental?.code || "";
    setConfirmDialog({
      open: true,
      title: "Xác nhận quyết toán & hoàn cọc",
      description: `Xác nhận quyết toán đơn thuê #${code} và thực hiện hoàn trả tiền đặt cọc offline cho khách hàng?`,
      variant: "info",
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          await completeMutation.mutateAsync({
            id: id,
            req: {
              refundMethod: "CASH",
              note: "Hoàn tất hợp đồng",
            },
          });
          toast.success("Quyết toán đơn thuê và hoàn cọc thành công!");
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || "Lỗi quyết toán");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleHandoverDevices = async (id: number) => {
    const rental = rentals.find((r) => r.id === id);
    const code = rental?.code || "";
    setConfirmDialog({
      open: true,
      title: "Xác nhận bàn giao thiết bị",
      description: `Xác nhận tiến hành bàn giao thiết bị vật lý cho đơn thuê #${code}? Trạng thái đơn sẽ được cập nhật sang 'Đang thuê'.`,
      variant: "info",
      onConfirm: async () => {
        try {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          await handoverMutation.mutateAsync({ id });
          toast.success("Đã thực hiện bàn giao thiết bị thành công!");
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || "Lỗi bàn giao thiết bị");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const getStatusColor = (status: RentalOrderStatus) => {
    switch (status) {
      case RentalOrderStatus.PENDING_PAYMENT:
        return "bg-amber-50 text-amber-700 border-amber-200";
      case RentalOrderStatus.PAID_RENTAL_FEE:
        return "bg-blue-50 text-blue-700 border-blue-200";
      case RentalOrderStatus.WAITING_PICKUP:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case RentalOrderStatus.RENTING:
        return "bg-purple-50 text-purple-700 border-purple-200";
      case RentalOrderStatus.RETURNED:
        return "bg-sky-50 text-sky-700 border-sky-200";
      case RentalOrderStatus.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case RentalOrderStatus.CANCELLED:
        return "bg-red-50 text-red-700 border-red-200";
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

  const renderRentalActionMenu = (
    rental: RentalOrderResponse,
    mode: "icon" | "button" = "icon",
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "outline-none transition-colors duration-200",
          mode === "icon"
            ? "inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-zinc-100"
            : "inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-semibold text-white hover:bg-red-700",
        )}
      >
        {mode === "icon" ? (
          <MoreHorizontal className="w-4 h-4 text-zinc-500" />
        ) : (
          <>
            <MoreHorizontal className="w-3.5 h-3.5" />
            Thao tác
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] font-semibold text-zinc-400 px-2 py-1.5 tracking-tight">
            Tác vụ quản trị
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="cursor-pointer flex items-center gap-2"
            onClick={() => handleOpenDetail(rental.id)}
          >
            <Eye className="w-3.5 h-3.5 text-zinc-400" /> Chi tiết
          </DropdownMenuItem>

          {rental.status === RentalOrderStatus.PAID_RENTAL_FEE && (
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={() => handleOpenApprove(rental)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Chuẩn bị thiết bị
            </DropdownMenuItem>
          )}

          {rental.status === RentalOrderStatus.WAITING_PICKUP && (
            <>
              {!rental.contract ||
              !(rental.contract.isLocked || rental.contract.locked) ? (
                <DropdownMenuItem
                  className="flex items-center gap-2 text-amber-600 focus:text-amber-600 focus:bg-amber-50/50 bg-amber-50/30"
                  disabled
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Chờ khách ký HĐ
                </DropdownMenuItem>
              ) : !rental.finalDepositAmount &&
                rental.finalDepositAmount !== 0 ? (
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => handleOpenHandover(rental)}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Lập BB bàn giao
                </DropdownMenuItem>
              ) : rental.depositStatus !== "PAID" ? (
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() =>
                    handlePayDeposit(rental.id, rental.finalDepositAmount || 0)
                  }
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  Thu tiền cọc
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2"
                  onClick={() => handleHandoverDevices(rental.id)}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Bàn giao máy
                </DropdownMenuItem>
              )}
            </>
          )}

          {rental.status === RentalOrderStatus.RENTING && (
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={() => handleOpenReturn(rental)}
            >
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              Nhận trả máy
            </DropdownMenuItem>
          )}

          {rental.status === RentalOrderStatus.RETURNED && (
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={() => handleSettle(rental.id)}
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Quyết toán & Hoàn cọc
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const filteredRentals = rentals.filter(
    (r) =>
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.shippingName.toLowerCase().includes(search.toLowerCase()),
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
          value={
            rentals.filter(
              (r) => r.status === RentalOrderStatus.PAID_RENTAL_FEE,
            ).length
          }
          icon={Clock}
          accent="bg-amber-500"
        />
        <StatCard
          title="Đang thuê máy"
          value={
            rentals.filter((r) => r.status === RentalOrderStatus.RENTING).length
          }
          icon={Truck}
          accent="bg-indigo-500"
        />
        <StatCard
          title="Chờ quyết toán"
          value={
            rentals.filter((r) => r.status === RentalOrderStatus.RETURNED)
              .length
          }
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
                  <Calendar
                    className="w-4.5 h-4.5 text-white"
                    strokeWidth={2}
                  />
                </div>
                <h2 className="text-2xl text-zinc-950 tracking-tight leading-tight">
                  Quản lý thuê máy ảnh
                </h2>
              </div>
              <p className="text-[14px] text-zinc-500 font-medium ml-12">
                Duyệt hồ sơ, bàn giao/nhận trả thiết bị vật lý và ký kết hợp
                đồng điện tử
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              {/* Status Selector */}
              <Select
                value={statusFilter as string}
                onValueChange={(val: string | null) => {
                  setStatusFilter((val || "ALL") as RentalOrderStatus | "ALL");
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px] !h-10 px-4 rounded-xl !border-zinc-200 !bg-white text-[13px] font-semibold text-zinc-600 focus:!border-red-600 transition-all duration-200 shadow-sm outline-none">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-zinc-100 shadow-dash-overlay max-h-64 bg-white p-1">
                  <SelectItem
                    className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                    value="ALL"
                  >
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem
                    className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                    value={RentalOrderStatus.PENDING_PAYMENT}
                  >
                    Chờ thanh toán phí
                  </SelectItem>
                  <SelectItem
                    className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                    value={RentalOrderStatus.PAID_RENTAL_FEE}
                  >
                    Đã TT phí - Chờ chuẩn bị
                  </SelectItem>
                  <SelectItem
                    className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                    value={RentalOrderStatus.WAITING_PICKUP}
                  >
                    Chờ nhận máy
                  </SelectItem>
                  <SelectItem
                    className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                    value={RentalOrderStatus.RENTING}
                  >
                    Đang cho thuê
                  </SelectItem>
                  <SelectItem
                    className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                    value={RentalOrderStatus.RETURNED}
                  >
                    Đã trả - Chờ quyết toán
                  </SelectItem>
                  <SelectItem
                    className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                    value={RentalOrderStatus.COMPLETED}
                  >
                    Hoàn thành / Hoàn cọc
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="group relative min-w-0">
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
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-3.5 text-[13px] font-semibold text-zinc-400">
                    Đơn thuê
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-semibold text-zinc-400">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-semibold text-zinc-400">
                    Thời hạn thuê
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-semibold text-zinc-400">
                    Phí thuê & Cọc
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-semibold text-zinc-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3.5 text-[13px] font-semibold text-zinc-400 text-right">
                    Thao tác
                  </th>
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
                    <tr
                      key={rental.id}
                      onClick={() => handleOpenDetail(rental.id)}
                      className="cursor-pointer hover:bg-zinc-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-950">
                            #{rental.code}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-semibold mt-1">
                            {rental.items.length} thiết bị
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-zinc-950">
                            {rental.shippingName}
                          </span>
                          <span className="text-[11px] text-zinc-400 mt-0.5">
                            {rental.userEmail}
                          </span>
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
                          <span className="text-xs font-semibold text-red-600">
                            {formatVND(rental.rentalFee)}
                          </span>
                          <span className="text-[10px] text-amber-600 font-semibold mt-0.5">
                            Cọc:{" "}
                            {formatVND(
                              rental.finalDepositAmount ??
                                rental.estimatedDepositAmount ??
                                0,
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[120px]">
                        <span
                          className={cn(
                            "inline-flex w-fit min-w-max shrink-0 items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-semibold border",
                            getStatusColor(rental.status),
                          )}
                        >
                          {getStatusLabel(rental.status)}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-xl hover:bg-zinc-100 outline-none transition-colors duration-200">
                            <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-56 p-1.5 rounded-xl border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
                          >
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] font-semibold text-zinc-400 px-2 py-1.5 tracking-wide ">
                                Tác vụ quản trị
                              </DropdownMenuLabel>

                              <DropdownMenuItem
                                className="cursor-pointer flex items-center gap-2"
                                onClick={() => handleOpenDetail(rental.id)}
                              >
                                <Eye className="w-3.5 h-3.5 text-zinc-400" />{" "}
                                Chi tiết
                              </DropdownMenuItem>

                              {/* PAID_RENTAL_FEE: Prepare devices */}
                              {rental.status ===
                                RentalOrderStatus.PAID_RENTAL_FEE && (
                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center gap-2"
                                  onClick={() => handleOpenApprove(rental)}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                  Chuẩn bị thiết bị
                                </DropdownMenuItem>
                              )}

                              {/* WAITING_PICKUP actions */}
                              {rental.status ===
                                RentalOrderStatus.WAITING_PICKUP && (
                                <>
                                  {/* Case 1: Contract not signed/locked */}
                                  {!rental.contract ||
                                  !(
                                    rental.contract.isLocked ||
                                    rental.contract.locked
                                  ) ? (
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 text-amber-600 focus:text-amber-600 focus:bg-amber-50/50 bg-amber-50/30"
                                      disabled
                                    >
                                      <Clock className="w-3.5 h-3.5 text-amber-500" />{" "}
                                      Chờ khách ký HĐ (Online)
                                    </DropdownMenuItem>
                                  ) : (
                                    <>
                                      {/* Case 2: Handover report not created yet (finalDepositAmount is null/undefined) */}
                                      {!rental.finalDepositAmount &&
                                      rental.finalDepositAmount !== 0 ? (
                                        <DropdownMenuItem
                                          className="cursor-pointer flex items-center gap-2"
                                          onClick={() =>
                                            handleOpenHandover(rental)
                                          }
                                        >
                                          <FileText className="w-3.5 h-3.5 text-blue-500" />{" "}
                                          Lập BB bàn giao
                                        </DropdownMenuItem>
                                      ) : (
                                        <>
                                          {/* Case 3: Deposit not collected */}
                                          {rental.depositStatus !== "PAID" ? (
                                            <DropdownMenuItem
                                              className="cursor-pointer flex items-center gap-2"
                                              onClick={() =>
                                                handlePayDeposit(
                                                  rental.id,
                                                  rental.finalDepositAmount ||
                                                    0,
                                                )
                                              }
                                            >
                                              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />{" "}
                                              Thu tiền cọc
                                            </DropdownMenuItem>
                                          ) : (
                                            /* Case 4: Ready to handover */
                                            <DropdownMenuItem
                                              className="cursor-pointer flex items-center gap-2"
                                              onClick={() =>
                                                handleHandoverDevices(rental.id)
                                              }
                                            >
                                              <Check className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                              Bàn giao máy
                                            </DropdownMenuItem>
                                          )}
                                        </>
                                      )}
                                    </>
                                  )}
                                </>
                              )}

                              {/* RENTING: Return Devices */}
                              {rental.status === RentalOrderStatus.RENTING && (
                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center gap-2"
                                  onClick={() => handleOpenReturn(rental)}
                                >
                                  <FileText className="w-3.5 h-3.5 text-purple-500" />{" "}
                                  Nhận trả máy
                                </DropdownMenuItem>
                              )}

                              {/* RETURNED: Complete / Settle */}
                              {rental.status === RentalOrderStatus.RETURNED && (
                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center gap-2"
                                  onClick={() => handleSettle(rental.id)}
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />{" "}
                                  Quyết toán & Hoàn cọc
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-4 space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-zinc-50 rounded-xl animate-pulse"
                />
              ))
            ) : filteredRentals.length === 0 ? (
              <EmptyState
                title="Không tìm thấy đơn thuê nào"
                description="Hãy đổi bộ lọc hoặc từ khóa tìm kiếm."
              />
            ) : (
              filteredRentals.map((rental) => (
                <div key={rental.id} className="admin-card p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-zinc-950">
                        #{rental.code}
                      </span>
                      <span className="mt-1 block text-[11px] font-medium text-zinc-400">
                        {rental.createdAt
                          ? new Date(rental.createdAt).toLocaleDateString(
                              "vi-VN",
                            )
                          : rental.startDate.split("T")[0]}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "inline-flex w-fit min-w-max shrink-0 items-center justify-center whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-semibold border",
                        getStatusColor(rental.status),
                      )}
                    >
                      {getStatusLabel(rental.status)}
                    </span>
                  </div>

                  <div className="space-y-3 border-y border-zinc-50 py-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-zinc-900">
                      <User className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">
                        {rental.shippingName || rental.userEmail}
                      </span>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-500">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                      <span className="truncate">
                        {rental.startDate.split("T")[0]} -{" "}
                        {rental.endDate.split("T")[0]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-zinc-50 p-3">
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium text-zinc-400">
                          Thiết bị
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-zinc-950">
                          {rental.items.length} mục
                        </span>
                      </div>
                      <div className="min-w-0 text-right">
                        <span className="block text-[10px] font-medium text-zinc-400">
                          Phí thuê
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-red-600">
                          {formatVND(rental.rentalFee)}
                        </span>
                      </div>
                      <div className="min-w-0 col-span-2 flex items-center justify-between border-t border-zinc-100 pt-2">
                        <span className="text-[10px] font-medium text-amber-600">
                          Cọc dự kiến/đã chốt
                        </span>
                        <span className="text-xs font-semibold text-amber-700">
                          {formatVND(
                            rental.finalDepositAmount ??
                              rental.estimatedDepositAmount ??
                              0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenDetail(rental.id)}
                      className="h-9 w-full rounded-xl border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                    >
                      Chi tiết
                    </Button>
                    {renderRentalActionMenu(rental, "button")}
                  </div>
                </div>
              ))
            )}
          </div>
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
              <p className="text-xs text-zinc-400 font-semibold">
                Đang tải danh sách thiết bị vật lý...
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-zinc-400 tracking-wide block">
                  Đánh giá mức độ rủi ro (CIC)
                </label>
                <Select
                  value={riskLevel}
                  onValueChange={(val) => setRiskLevel(val as RiskLevel)}
                >
                  <SelectTrigger className="w-full !h-10 rounded-xl !border-zinc-200 !bg-white text-[13px] font-semibold text-zinc-900 focus:!border-red-600 transition-all duration-200 shadow-sm outline-none">
                    <SelectValue placeholder="Chọn mức độ rủi ro" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-zinc-100 shadow-dash-overlay bg-white p-1">
                    <SelectItem
                      className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                      value={RiskLevel.LOW_RISK}
                    >
                      LOW RISK (Rủi ro thấp - Cọc ít/Miễn cọc)
                    </SelectItem>
                    <SelectItem
                      className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                      value={RiskLevel.MEDIUM_RISK}
                    >
                      MEDIUM RISK (Rủi ro trung bình - Cọc một phần)
                    </SelectItem>
                    <SelectItem
                      className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                      value={RiskLevel.HIGH_RISK}
                    >
                      HIGH RISK (Rủi ro cao - Cọc 100% giá trị)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-zinc-400 tracking-wide block">
                  Cập nhật số tiền đặt cọc (VND)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatMoneyInput(depositAmount)}
                  onChange={(e) =>
                    setDepositAmount(parseMoneyInput(e.target.value))
                  }
                  placeholder="Ví dụ: 1.000.000"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950 font-semibold text-sm"
                />
                <p className="text-[11px] text-zinc-500">
                  Hệ thống tự định dạng dấu chấm, ví dụ 1000000 thành 1.000.000
                  đ.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-zinc-400 tracking-wide block">
                  Gán thiết bị vật lý cụ thể (Theo số Serial)
                </label>
                {selectedRental.items.map((item) => {
                  const devs = availableDevicesMap[item.productId] || [];
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2"
                    >
                      <div className="text-xs font-semibold text-zinc-900">
                        {item.productName}
                      </div>
                      <Select
                        value={
                          deviceAssignments[item.id]?.toString() || "empty"
                        }
                        onValueChange={(val) => {
                          setDeviceAssignments({
                            ...deviceAssignments,
                            [item.id]:
                              val === "empty" ? undefined : Number(val),
                          });
                        }}
                      >
                        <SelectTrigger className="w-full !h-10 rounded-xl !border-zinc-200 !bg-white text-[13px] font-semibold text-zinc-900 focus:!border-red-600 transition-all duration-200 shadow-sm outline-none">
                          <SelectValue placeholder="-- Chọn số Serial thiết bị trống --" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-zinc-100 shadow-dash-overlay max-h-64 bg-white p-1">
                          <SelectItem
                            className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                            value="empty"
                          >
                            -- Chọn số Serial thiết bị trống --
                          </SelectItem>
                          {devs.map((d) => (
                            <SelectItem
                              key={d.id}
                              value={d.id.toString()}
                              className="rounded-xl px-3 py-2 cursor-pointer text-zinc-700 hover:text-zinc-950 focus:bg-zinc-100 focus:text-zinc-950 hover:bg-zinc-100 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-950 data-[state=selected]:bg-zinc-50 data-[state=selected]:text-zinc-950 text-[13px] transition-colors"
                            >
                              {d.serialNumber} (
                              {d.conditionDetails || "Bình thường"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {devs.length === 0 && (
                        <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Hết thiết bị sẵn
                          sàng trong kho!
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
              <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block">
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
              <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block">
                Mô tả tình trạng
              </label>
              {selectedRental.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-zinc-50 rounded-xl space-y-2 border border-zinc-100"
                >
                  <div className="text-xs font-semibold text-zinc-900">
                    {item.productName} ({item.deviceSerialNumber})
                  </div>
                  <textarea
                    value={itemConditions[item.id] || ""}
                    onChange={(e) =>
                      setItemConditions({
                        ...itemConditions,
                        [item.id]: e.target.value,
                      })
                    }
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-950/5 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 focus:ring-4 focus:ring-red-600/5 focus-visible:outline-none transition-all duration-200 resize-none shadow-dash-card leading-relaxed"
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
              <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block">
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
              <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block">
                Ngày trả thực tế
              </label>
              <DateInput
                value={returnDate}
                onChange={setReturnDate}
                placeholder="dd/mm/yyyy"
                className="!h-10 !px-3 !pr-12 !rounded-xl !border-zinc-200 !shadow-none !text-sm !font-semibold focus:!border-zinc-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className={cn(
                  "space-y-2 rounded-2xl border p-3",
                  returnAdjustmentMode === "EARLY"
                    ? "border-emerald-200 bg-emerald-50/60"
                    : "border-zinc-200 bg-white",
                )}
              >
                <label className="flex items-center gap-2 text-[11px] font-semibold text-zinc-600 tracking-wide">
                  <input
                    type="checkbox"
                    checked={returnAdjustmentMode === "EARLY"}
                    onChange={() => handleReturnAdjustmentModeChange("EARLY")}
                    className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
                  />
                  Số ngày trả sớm
                </label>
                <input
                  type="number"
                  min={0}
                  max={returnSettlement.maxEarlyReturnDays}
                  disabled={returnAdjustmentMode !== "EARLY"}
                  value={returnAdjustmentMode === "EARLY" ? earlyReturnDays : 0}
                  onChange={(e) => {
                    setReturnAdjustmentMode("EARLY");
                    setEarlyReturnDays(Math.max(0, Number(e.target.value)));
                    setLateReturnDays(0);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-950 disabled:bg-zinc-50 disabled:text-zinc-400 font-semibold text-sm text-emerald-600"
                />
                <p className="text-[11px] text-zinc-400">
                  Tối đa {returnSettlement.maxEarlyReturnDays} ngày theo ngày
                  trả thực tế.
                </p>
              </div>

              <div
                className={cn(
                  "space-y-2 rounded-2xl border p-3",
                  returnAdjustmentMode === "LATE"
                    ? "border-red-200 bg-red-50/60"
                    : "border-zinc-200 bg-white",
                )}
              >
                <label className="flex items-center gap-2 text-[11px] font-semibold text-zinc-600 tracking-wide">
                  <input
                    type="checkbox"
                    checked={returnAdjustmentMode === "LATE"}
                    onChange={() => handleReturnAdjustmentModeChange("LATE")}
                    className="h-4 w-4 rounded border-zinc-300 accent-red-600"
                  />
                  Số ngày trả trễ
                </label>
                <input
                  type="number"
                  min={0}
                  max={returnSettlement.maxLateReturnDays}
                  disabled={returnAdjustmentMode !== "LATE"}
                  value={returnAdjustmentMode === "LATE" ? lateReturnDays : 0}
                  onChange={(e) => {
                    setReturnAdjustmentMode("LATE");
                    setEarlyReturnDays(0);
                    setLateReturnDays(Math.max(0, Number(e.target.value)));
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-white outline-none focus:border-zinc-950 disabled:bg-zinc-50 disabled:text-zinc-400 font-semibold text-sm text-red-600"
                />
                <p className="text-[11px] text-zinc-400">
                  Tối đa {returnSettlement.maxLateReturnDays} ngày theo ngày trả
                  thực tế.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block">
                Phí hư hại / phát sinh khác (VND)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatMoneyInput(damageFee)}
                onChange={(e) => setDamageFee(parseMoneyInput(e.target.value))}
                placeholder="Ví dụ: 500.000"
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950 font-semibold text-sm text-red-600"
              />
              <p className="text-[11px] text-zinc-500">
                Chỉ nhập số tiền phát sinh do hư hại hoặc thiếu phụ kiện. Phí
                trả trễ đã tự tính theo số ngày.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Đơn giá thuê/ngày</span>
                <span className="font-semibold text-zinc-950">
                  {formatVND(returnSettlement.dailyRentalTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Tiền cọc đã thu</span>
                <span className="font-semibold text-zinc-950">
                  {formatVND(returnSettlement.deposit)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-600">Hoàn phí trả sớm (80%)</span>
                <span className="font-semibold text-emerald-600">
                  +{formatVND(returnSettlement.earlyRefund)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600">Phụ thu quá ngày</span>
                <span className="font-semibold text-red-600">
                  -{formatVND(returnSettlement.lateFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600">Phí hư hại / phát sinh</span>
                <span className="font-semibold text-red-600">
                  -{formatVND(returnSettlement.damage)}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-2 mt-2 flex items-center justify-between">
                <span className="font-semibold text-zinc-950">
                  {returnSettlement.extraPaymentAmount > 0
                    ? "Khách cần thanh toán thêm"
                    : "Dự kiến hoàn khách"}
                </span>
                <span
                  className={cn(
                    "text-base font-semibold",
                    returnSettlement.extraPaymentAmount > 0
                      ? "text-red-600"
                      : "text-emerald-600",
                  )}
                >
                  {formatVND(
                    returnSettlement.extraPaymentAmount > 0
                      ? returnSettlement.extraPaymentAmount
                      : returnSettlement.refundAmount,
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-zinc-500 tracking-wide block">
                Mô tả tình trạng
              </label>
              {selectedRental.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-zinc-50 rounded-xl space-y-2 border border-zinc-100"
                >
                  <div className="text-xs font-semibold text-zinc-900">
                    {item.productName} ({item.deviceSerialNumber})
                  </div>
                  <textarea
                    value={itemConditions[item.id] || ""}
                    onChange={(e) =>
                      setItemConditions({
                        ...itemConditions,
                        [item.id]: e.target.value,
                      })
                    }
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-950/5 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 focus:ring-4 focus:ring-red-600/5 focus-visible:outline-none transition-all duration-200 resize-none shadow-dash-card leading-relaxed"
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

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        isLoading={confirmDialog.isLoading}
        variant={confirmDialog.variant || "info"}
      />
    </div>
  );
}
