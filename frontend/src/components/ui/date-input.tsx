"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DateInput – A date input component with a built-in calendar popover.
 * Displays and accepts dd/MM/yyyy format.
 *
 * Props:
 * - value: ISO date string (yyyy-MM-dd) used internally
 * - onChange: callback receiving ISO date string (yyyy-MM-dd)
 * - min / max: ISO date strings for min/max constraints
 * - required, disabled, className, placeholder
 */

interface DateInputProps {
  value?: string;
  onChange?: (isoDate: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

// ── Date helpers ──────────────────────────────────────────────

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function displayToIso(display: string): string {
  if (!display) return "";
  const parts = display.split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function isValidDisplay(display: string): boolean {
  const iso = displayToIso(display);
  if (!iso) return false;
  const date = new Date(iso);
  return !isNaN(date.getTime()) && iso === date.toISOString().slice(0, 10);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toIsoString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIso(iso: string): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { year: y, month: m - 1, day: d };
}

// ── Calendar Component ────────────────────────────────────────

function Calendar({
  selected,
  onSelect,
  min,
  max,
}: {
  selected?: string;
  onSelect: (iso: string) => void;
  min?: string;
  max?: string;
}) {
  const parsed = parseIso(selected || "");
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(parsed?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(parsed?.month ?? today.getMonth());

  // Sync view when selected date changes (e.g. user typed a valid date)
  React.useEffect(() => {
    const p = parseIso(selected || "");
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [selected]);

  const minParsed = parseIso(min || "");
  const maxParsed = parseIso(max || "");

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  // Previous month days (fill leading)
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    onSelect(toIsoString(t.getFullYear(), t.getMonth(), t.getDate()));
  };

  const isDisabled = (year: number, month: number, day: number): boolean => {
    if (minParsed) {
      const minDate = new Date(minParsed.year, minParsed.month, minParsed.day);
      if (new Date(year, month, day) < minDate) return true;
    }
    if (maxParsed) {
      const maxDate = new Date(maxParsed.year, maxParsed.month, maxParsed.day);
      if (new Date(year, month, day) > maxDate) return true;
    }
    return false;
  };

  const isSelected = (year: number, month: number, day: number): boolean => {
    if (!parsed) return false;
    return parsed.year === year && parsed.month === month && parsed.day === day;
  };

  const isToday = (year: number, month: number, day: number): boolean => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  // Build grid cells
  const cells: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  // Leading days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
  }

  // Trailing days from next month
  const remaining = 42 - cells.length; // 6 rows x 7 cols
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  // Trim to only show needed rows (avoid unnecessary extra row)
  const totalRows = Math.ceil(cells.length / 7);
  const usedCells = totalRows <= 5 ? cells.slice(0, 35) : cells;

  return (
    <div className="w-[280px] select-none">
      {/* Header: Month/Year dropdown selectors + nav */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-1">
          <select
            value={viewMonth}
            onChange={(e) => setViewMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-zinc-900 outline-none cursor-pointer hover:bg-zinc-100 px-1 py-0.5 rounded-lg transition-colors border-none focus:ring-0 focus-visible:ring-0 appearance-none"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx} value={idx}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={viewYear}
            onChange={(e) => setViewYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-zinc-900 outline-none cursor-pointer hover:bg-zinc-100 px-1 py-0.5 rounded-lg transition-colors border-none focus:ring-0 focus-visible:ring-0 appearance-none"
          >
            {Array.from({ length: 120 }, (_, i) => {
              const y = today.getFullYear() - 100 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            }).reverse()}
          </select>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-wider py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {usedCells.map((cell, i) => {
          const disabled = isDisabled(cell.year, cell.month, cell.day);
          const selected = isSelected(cell.year, cell.month, cell.day);
          const todayCell = isToday(cell.year, cell.month, cell.day);

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  onSelect(toIsoString(cell.year, cell.month, cell.day));
                  // If clicking outside current month, navigate there
                  if (!cell.isCurrentMonth) {
                    setViewYear(cell.year);
                    setViewMonth(cell.month);
                  }
                }
              }}
              className={cn(
                "w-9 h-9 mx-auto rounded-lg text-xs font-semibold transition-all flex items-center justify-center",
                !cell.isCurrentMonth && "text-zinc-300",
                cell.isCurrentMonth && !selected && !disabled && "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                selected && "bg-zinc-950 text-white shadow-sm",
                todayCell && !selected && "ring-1 ring-red-600/40 text-red-600 font-bold",
                disabled && "text-zinc-200 cursor-not-allowed hover:bg-transparent",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Footer: Today + Clear */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => onSelect("")}
          className="text-[11px] font-semibold text-zinc-400 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
        >
          Xóa
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
        >
          Hôm nay
        </button>
      </div>
    </div>
  );
}

// ── DateInput Component ───────────────────────────────────────

export function DateInput({
  value = "",
  onChange,
  min,
  max,
  required,
  disabled,
  className,
  placeholder = "dd/mm/yyyy",
}: DateInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [textValue, setTextValue] = React.useState(isoToDisplay(value));
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Sync external value changes
  React.useEffect(() => {
    setTextValue(isoToDisplay(value));
  }, [value]);

  // Close popover on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    raw = raw.replace(/[^\d/]/g, "");

    // Auto-insert slashes
    if (raw.length === 2 && !raw.includes("/")) {
      raw += "/";
    } else if (raw.length === 5 && raw.indexOf("/") === 2 && raw.lastIndexOf("/") === 2) {
      raw += "/";
    }

    if (raw.length > 10) raw = raw.slice(0, 10);
    setTextValue(raw);

    if (raw.length === 10 && isValidDisplay(raw)) {
      const iso = displayToIso(raw);
      onChange?.(iso);
    } else if (raw === "") {
      onChange?.("");
    }
  };

  const handleTextBlur = () => {
    if (textValue && !isValidDisplay(textValue)) {
      setTextValue(isoToDisplay(value));
    }
  };

  const handleCalendarSelect = (iso: string) => {
    setTextValue(isoToDisplay(iso));
    onChange?.(iso);
    if (iso) setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className ? "" : "w-full")} style={{ zIndex: isOpen ? 50 : undefined }}>
      {/* Text input */}
      <input
        type="text"
        inputMode="numeric"
        value={textValue}
        onChange={handleTextChange}
        onBlur={handleTextBlur}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={cn(
          "h-12 w-full bg-white border border-black/5 rounded-xl px-5 pr-12 font-semibold text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-red-600/30 transition-all duration-200 shadow-dash-card outline-none",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      />

      {/* Calendar toggle */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all"
        tabIndex={-1}
      >
        <CalendarDays className="w-4 h-4" />
      </button>

      {/* Calendar popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl shadow-zinc-200/50 p-4 z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <Calendar
            selected={value}
            onSelect={handleCalendarSelect}
            min={min}
            max={max}
          />
        </div>
      )}
    </div>
  );
}
