"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Tag, Calendar, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CategoryResponse } from "@/types/category";
import { CategoryActionMenu } from "./CategoryActionMenu";

interface ItemProps {
  category: CategoryResponse;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

export function CategoryTableRow({
  category,
  onEdit,
  onDelete,
  onRestore,
}: ItemProps) {
  return (
    <tr
      onClick={() => onEdit(category)}
      className="group transition-all duration-300 hover:bg-zinc-50/50 cursor-pointer"
    >
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:scale-105 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-150">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 tracking-tight mb-0.5">
              {category.code}
            </p>
            <p className="text-xs font-medium text-zinc-400">
              ID: #{category.id}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <p className="text-sm font-semibold text-zinc-900 group-hover:text-red-600 transition-colors duration-300">
          {category.name}
        </p>
        <p
          className="text-xs text-zinc-500 line-clamp-1 max-w-xs"
          title={category.description}
        >
          {category.description || "Chưa có mô tả"}
        </p>
      </td>
      <td className="px-6 py-3 min-w-[110px]">
        <Badge
          className={cn(
            "w-fit min-w-max shrink-0 whitespace-nowrap rounded-xl px-2.5 py-1 text-xs font-semibold border ring-0 shadow-none",
            category.isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-zinc-50 text-zinc-600 border border-zinc-200",
          )}
        >
          {category.isActive ? "Hoạt động" : "Vô hiệu"}
        </Badge>
      </td>
      <td className="px-6 py-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-zinc-900">
            {format(new Date(category.createdAt), "dd/MM/yyyy", { locale: vi })}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            {format(new Date(category.createdAt), "HH:mm", { locale: vi })}
          </span>
        </div>
      </td>
      <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <CategoryActionMenu
          isActive={category.isActive}
          onEdit={() => onEdit(category)}
          onDelete={() => onDelete(category.id)}
          onRestore={() => onRestore(category.id)}
        />
      </td>
    </tr>
  );
}

export function CategoryMobileCard({
  category,
  onEdit,
  onDelete,
  onRestore,
}: ItemProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-4 group active:scale-[0.98] transition-all duration-150">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-950">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold  tracking-tight text-zinc-400">
                {category.code}
              </span>
              <Badge
                className={cn(
                  "w-fit min-w-max shrink-0 whitespace-nowrap rounded-xl px-1.5 py-0 text-[8px] font-semibold border-0 ring-0",
                  category.isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-zinc-50 text-zinc-600 border border-zinc-200",
                )}
              >
                {category.isActive ? "HĐ" : "Vô hiệu"}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-zinc-950 tracking-tight">
              {category.name}
            </h3>
          </div>
        </div>
        <CategoryActionMenu
          isActive={category.isActive}
          onEdit={() => onEdit(category)}
          onDelete={() => onDelete(category.id)}
          onRestore={() => onRestore(category.id)}
        />
      </div>

      <p className="text-[11px] text-zinc-500 line-clamp-2">
        {category.description || "Chưa có mô tả"}
      </p>

      <div className="pt-3 border-t border-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Calendar className="w-3 h-3" />
          <span className="text-[10px] font-semibold">
            {format(new Date(category.createdAt), "dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
        <button
          onClick={() => onEdit(category)}
          className="p-1.5 rounded-xl bg-zinc-50 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
