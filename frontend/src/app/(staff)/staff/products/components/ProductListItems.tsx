"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Package,
  Calendar,
  ChevronRight,
  Check,
  X as XIcon,
  ImageIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";
import { ProductResponse } from "@/types/product";
import { ProductActionMenu } from "./ProductActionMenu";
import Image from "next/image";

interface ItemProps {
  product: ProductResponse;
  onEdit: (product: ProductResponse) => void;
  onUpdatePrice: (product: ProductResponse) => void;
  onGallery: (product: ProductResponse) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
  onHardDelete: (id: number) => void;
  onView: (id: number) => void;
  isDeleted: boolean;
}

export function ProductTableRow({
  product,
  onEdit,
  onUpdatePrice,
  onGallery,
  onDelete,
  onRestore,
  onHardDelete,
  onView,
  isDeleted,
}: ItemProps) {
  return (
    <tr
      onClick={() => onView(product.id)}
      className="group transition-all duration-300 hover:bg-zinc-50/50 cursor-pointer"
    >
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-200/50">
            {product.mainImageUrl ? (
              <Image
                src={getImageUrl(product.mainImageUrl)}
                alt={product.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <Package className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <div>
            <p
              className="text-sm font-semibold text-zinc-950 tracking-tight mb-0.5 max-w-[200px] truncate group-hover:text-red-600 transition-colors duration-300"
              title={product.name}
            >
              {product.name}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-xl">
                ID: {product.id}
              </span>
              <span className="text-xs font-medium text-zinc-500 line-clamp-1 max-w-[150px]">
                {product.categoryName || "Chưa phân loại"}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0 border-0 shadow-none",
                product.isForRent
                  ? "bg-amber-100/50 text-amber-700"
                  : "bg-zinc-100 text-zinc-400",
              )}
            >
              Thuê
            </Badge>
            <span className="text-sm font-semibold text-zinc-900">
              {product.rentPricePerDay?.toLocaleString("vi-VN")} ₫
              <span className="text-xs text-zinc-400 font-medium">/ngày</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0 border-0 shadow-none",
                product.isForSale
                  ? "bg-blue-100/50 text-blue-700"
                  : "bg-zinc-100 text-zinc-400",
              )}
            >
              Bán
            </Badge>
            <span className="text-sm font-semibold text-zinc-900">
              {product.salePrice?.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5">
        <Badge
          className={cn(
            "rounded-xl px-2.5 py-1 text-xs font-semibold border-0 ring-0 shadow-none",
            !isDeleted
              ? product.active
                ? "bg-emerald-50 text-emerald-600"
                : "bg-zinc-100 text-zinc-500"
              : "bg-red-50 text-red-600",
          )}
        >
          {!isDeleted ? (product.active ? "Hoạt động" : "Ẩn") : "Đã xóa"}
        </Badge>
      </td>
      <td className="px-6 py-3.5">
        <div className="flex flex-col gap-1.5">
          {product.isForSale && (
            <span className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Bán: <span className="font-semibold text-zinc-900">{product.quantity}</span>
            </span>
          )}
          {product.isForRent && (
            <span className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
              Thuê: <span className="font-semibold text-zinc-900">{product.rentalQuantity ?? 0}</span>
            </span>
          )}
          {!product.isForSale && !product.isForRent && (
            <span className="text-xs text-zinc-400 font-medium">Không cấu hình</span>
          )}
        </div>
      </td>
      <td className="px-6 py-3.5">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-zinc-900">
            {format(new Date(product.createdAt), "dd/MM/yyyy", { locale: vi })}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            {format(new Date(product.createdAt), "HH:mm", { locale: vi })}
          </span>
        </div>
      </td>
      <td
        className="px-6 py-3.5 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <ProductActionMenu
          isActive={product.active}
          isDeleted={isDeleted}
          onEdit={() => onEdit(product)}
          onUpdatePrice={() => onUpdatePrice(product)}
          onGallery={() => onGallery(product)}
          onDelete={() => onDelete(product.id)}
          onRestore={() => onRestore(product.id)}
          onHardDelete={() => onHardDelete(product.id)}
          onView={() => onView(product.id)}
        />
      </td>
    </tr>
  );
}

export function ProductMobileCard({
  product,
  onEdit,
  onUpdatePrice,
  onGallery,
  onDelete,
  onRestore,
  onHardDelete,
  onView,
  isDeleted,
}: ItemProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-4 group active:scale-[0.98] transition-all duration-150">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3 overflow-hidden">
          <div className="w-14 h-14 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200/50">
            {product.mainImageUrl ? (
              <Image
                src={getImageUrl(product.mainImageUrl)}
                alt={product.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <Package className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[10px] font-semibold  tracking-tight text-zinc-400 bg-zinc-100 px-1.5 rounded-xl">
                #{product.id}
              </span>
              <Badge
                className={cn(
                  "rounded-full px-2 py-0 text-[9px] font-semibold  tracking-tight border-0",
                  !isDeleted
                    ? product.active
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-zinc-100 text-zinc-500"
                    : "bg-red-50 text-red-600",
                )}
              >
                {!isDeleted ? (product.active ? "Hoạt động" : "Ẩn") : "Đã xóa"}
              </Badge>
            </div>
            <h3
              onClick={() => onView(product.id)}
              className="text-sm font-semibold text-zinc-950 tracking-tight truncate max-w-full cursor-pointer hover:text-indigo-600"
            >
              {product.name}
            </h3>
            <p className="text-[11px] font-medium text-zinc-500 truncate mt-0.5">
              {product.categoryName || "Chưa phân loại"}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <ProductActionMenu
            isActive={product.active}
            isDeleted={isDeleted}
            onEdit={() => onEdit(product)}
            onUpdatePrice={() => onUpdatePrice(product)}
            onGallery={() => onGallery(product)}
            onDelete={() => onDelete(product.id)}
            onRestore={() => onRestore(product.id)}
            onHardDelete={() => onHardDelete(product.id)}
            onView={() => onView(product.id)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-xl">
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold  text-zinc-400 tracking-tight mb-1 flex items-center gap-1">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                product.isForRent ? "bg-amber-500" : "bg-zinc-300",
              )}
            />{" "}
            Thuê ({product.rentalQuantity ?? 0})
          </span>
          <span className="text-sm font-semibold text-zinc-950">
            {product.rentPricePerDay?.toLocaleString("vi-VN")} ₫
          </span>
        </div>
        <div className="flex flex-col pl-3 border-l border-zinc-200">
          <span className="text-[9px] font-semibold  text-zinc-400 tracking-tight mb-1 flex items-center gap-1">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                product.isForSale ? "bg-blue-500" : "bg-zinc-300",
              )}
            />{" "}
            Bán ({product.quantity})
          </span>
          <span className="text-sm font-semibold text-zinc-950">
            {product.salePrice?.toLocaleString("vi-VN")} ₫
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold">
            {format(new Date(product.createdAt), "dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
        {!isDeleted && (
          <button
            onClick={() => onView(product.id)}
            className="p-1.5 rounded-xl bg-zinc-50 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-all flex items-center gap-1 px-3"
          >
            <span className="text-[10px] font-semibold text-zinc-600">
              Chi tiết
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
