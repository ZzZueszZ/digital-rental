"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: string; // yyyy-MM-ddTHH:mm
  onChange?: (val: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

// ── Date and Time helpers ───────────────────────────────────────

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function parseLocalIso(val: string) {
  if (!val) return null;
  const parts = val.split("T");
  if (parts.length !== 2) return null;
  const [datePart, timePart] = parts;
  const dateParts = datePart.split("-");
  const timeParts = timePart.split(":");
  if (dateParts.length !== 3 || timeParts.length < 2) return null;
  return {
    year: parseInt(dateParts[0]),
    month: parseInt(dateParts[1]) - 1,
    day: parseInt(dateParts[2]),
    hour: parseInt(timeParts[0]),
    minute: parseInt(timeParts[1]),
  };
}

function buildLocalIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
) {
  const y = String(year).padStart(4, "0");
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function formatDisplayDateTime(val: string) {
  const parsed = parseLocalIso(val);
  if (!parsed) return "Chọn thời gian";
  const d = String(parsed.day).padStart(2, "0");
  const m = String(parsed.month + 1).padStart(2, "0");
  const y = String(parsed.year);
  const hh = String(parsed.hour).padStart(2, "0");
  const mm = String(parsed.minute).padStart(2, "0");
  return `${d}/${m}/${y} ${hh}:${mm}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ── DateTimePicker Component ─────────────────────────────────────

export function DateTimePicker({
  value = "",
  onChange,
  min,
  max,
  disabled,
  className,
  placeholder = "Chọn thời gian",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [popoverCoords, setPopoverCoords] = React.useState<{ top: number; left: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollRef = React.useRef<HTMLDivElement>(null);
  const periodScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setPopoverCoords(null);
      return;
    }

    const handlePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        const viewportWidth = window.innerWidth;
        const popoverWidth = window.innerWidth < 768 ? 350 : 480;
        let leftPos = rect.left + scrollLeft;
        if (rect.left + popoverWidth > viewportWidth) {
          leftPos = rect.right + scrollLeft - popoverWidth;
        }
        if (leftPos < 0) leftPos = 8;

        setPopoverCoords({
          top: rect.bottom + scrollTop + 8,
          left: leftPos,
        });
      }
    };

    handlePosition();

    window.addEventListener("resize", handlePosition);
    window.addEventListener("scroll", handlePosition, true);

    return () => {
      window.removeEventListener("resize", handlePosition);
      window.removeEventListener("scroll", handlePosition, true);
    };
  }, [isOpen]);

  // Default values or parsed values
  const today = new Date();
  const parsed = parseLocalIso(value);

  const [viewYear, setViewYear] = React.useState(
    parsed?.year ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = React.useState(
    parsed?.month ?? today.getMonth(),
  );

  // Selected date/time state
  const selectedYear = parsed?.year ?? today.getFullYear();
  const selectedMonth = parsed?.month ?? today.getMonth();
  const selectedDay = parsed?.day ?? today.getDate();
  const selectedHour24 = parsed?.hour ?? 12;
  const selectedMinute = parsed?.minute ?? 0;

  // Convert 24h to 12h for picker UI
  const isPM = selectedHour24 >= 12;
  const selectedHour12 = selectedHour24 % 12 === 0 ? 12 : selectedHour24 % 12;
  const selectedPeriod = isPM ? "PM" : "AM";

  // Sync calendar view month/year when value changes externally
  React.useEffect(() => {
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  // Scroll active columns on open
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const activeHour = hourScrollRef.current?.querySelector(
          "[data-active='true']",
        );
        if (activeHour) {
          activeHour.scrollIntoView({ block: "center", behavior: "auto" });
        }
        const activeMinute = minuteScrollRef.current?.querySelector(
          "[data-active='true']",
        );
        if (activeMinute) {
          activeMinute.scrollIntoView({ block: "center", behavior: "auto" });
        }
        const activePeriod = periodScrollRef.current?.querySelector(
          "[data-active='true']",
        );
        if (activePeriod) {
          activePeriod.scrollIntoView({ block: "center", behavior: "auto" });
        }
      }, 50);
    }
  }, [isOpen]);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
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

  // Date constraints parsed
  const minParsed = min ? parseLocalIso(min) : null;
  const maxParsed = max ? parseLocalIso(max) : null;

  const isDisabledDate = (y: number, m: number, d: number) => {
    if (minParsed) {
      const minDate = new Date(
        minParsed.year,
        minParsed.month,
        minParsed.day,
        0,
        0,
      );
      if (new Date(y, m, d, 0, 0) < minDate) return true;
    }
    if (maxParsed) {
      const maxDate = new Date(
        maxParsed.year,
        maxParsed.month,
        maxParsed.day,
        23,
        59,
      );
      if (new Date(y, m, d, 23, 59) > maxDate) return true;
    }
    return false;
  };

  const handleSelectDate = (d: number, m: number, y: number) => {
    const newIso = buildLocalIso(y, m, d, selectedHour24, selectedMinute);
    onChange?.(newIso);
  };

  const handleSelectTime = (h12: number, min: number, period: "AM" | "PM") => {
    let h24 = h12;
    if (period === "PM" && h12 !== 12) h24 += 12;
    if (period === "AM" && h12 === 12) h24 = 0;
    const newIso = buildLocalIso(
      selectedYear,
      selectedMonth,
      selectedDay,
      h24,
      min,
    );
    onChange?.(newIso);
  };

  // Build calendar grid cells
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const cells: {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
  }[] = [];

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  // Next month fill
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  // Adjust display rows
  const totalRows = Math.ceil(cells.length / 7);
  const usedCells = totalRows <= 5 ? cells.slice(0, 35) : cells;

  // Change Month handler
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
    const newIso = buildLocalIso(
      t.getFullYear(),
      t.getMonth(),
      t.getDate(),
      selectedHour24,
      selectedMinute,
    );
    onChange?.(newIso);
  };

  // Generate range helper
  const hoursRange = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutesRange = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full")}
      style={{ zIndex: isOpen ? 50 : undefined }}
    >
      {/* Selector Trigger Input Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-10 px-4 rounded-xl bg-zinc-50/50 border border-zinc-950/5 flex items-center justify-between text-sm font-semibold text-zinc-900 group-hover:border-red-600/30 group-focus-within:bg-white group-focus-within:border-red-600/30 transition-all duration-200 shadow-dash-card focus:outline-none focus:ring-4 focus:ring-red-600/5",
          value && "border-red-600/20 bg-white",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <span className={cn(!value && "text-zinc-400 font-normal")}>
          {value ? formatDisplayDateTime(value) : placeholder}
        </span>
        <CalendarDays className="w-4 h-4 text-red-600" />
      </button>

      {/* Popover Card */}
      {mounted && typeof document !== "undefined" && isOpen && popoverCoords && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            top: `${popoverCoords.top}px`,
            left: `${popoverCoords.left}px`,
          }}
          className="bg-white rounded-xl border border-zinc-200/80 shadow-2xl shadow-zinc-200/60 p-4 z-[9999] flex gap-4 animate-in fade-in slide-in-from-top-2 duration-200 md:w-[480px] w-[350px] flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Calendar Picker (Left) */}
          <div className="flex-1 select-none">
            {/* Header: Month/Year */}
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="text-sm font-bold text-zinc-900 tracking-tight">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Week Labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider py-1"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-y-1">
              {usedCells.map((cell, i) => {
                const dateDisabled = isDisabledDate(
                  cell.year,
                  cell.month,
                  cell.day,
                );
                const isSelected =
                  value &&
                  selectedYear === cell.year &&
                  selectedMonth === cell.month &&
                  selectedDay === cell.day;
                const isTodayCell =
                  today.getFullYear() === cell.year &&
                  today.getMonth() === cell.month &&
                  today.getDate() === cell.day;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={dateDisabled}
                    onClick={() => {
                      if (!dateDisabled) {
                        handleSelectDate(cell.day, cell.month, cell.year);
                        if (!cell.isCurrentMonth) {
                          setViewYear(cell.year);
                          setViewMonth(cell.month);
                        }
                      }
                    }}
                    className={cn(
                      "w-8 h-8 mx-auto rounded-full text-xs font-semibold transition-all flex items-center justify-center",
                      !cell.isCurrentMonth && "text-zinc-300",
                      cell.isCurrentMonth &&
                        !isSelected &&
                        !dateDisabled &&
                        "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                      isSelected &&
                        "border border-red-500 text-red-600 font-bold bg-red-50/30",
                      isTodayCell &&
                        !isSelected &&
                        "text-red-500 font-bold bg-red-50/20",
                      dateDisabled &&
                        "text-zinc-200 cursor-not-allowed hover:bg-transparent",
                    )}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  onChange?.("");
                  setIsOpen(false);
                }}
                className="text-[11px] font-semibold text-zinc-400 hover:text-red-600 transition-colors px-2 py-1 rounded-xl hover:bg-red-50"
              >
                Xóa
              </button>
              <button
                type="button"
                onClick={goToToday}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors px-2 py-1 rounded-xl hover:bg-red-50"
              >
                Hôm nay
              </button>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="hidden md:block w-[1px] bg-zinc-100 self-stretch my-1" />

          {/* Time Picker columns (Right) */}
          <div className="flex flex-col justify-between select-none">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Chọn giờ
              </span>
            </div>

            <div className="flex gap-2">
              {/* Hours Column */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Giờ
                </span>
                <div
                  ref={hourScrollRef}
                  className="h-[160px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden flex flex-col gap-0.5 w-11"
                >
                  {hoursRange.map((h) => {
                    const isActive = selectedHour12 === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        data-active={isActive}
                        onClick={() =>
                          handleSelectTime(h, selectedMinute, selectedPeriod)
                        }
                        className={cn(
                          "h-7 text-xs font-semibold rounded-xl flex items-center justify-center shrink-0 transition-all",
                          isActive
                            ? "bg-red-600 text-white font-bold shadow-md shadow-red-100"
                            : "text-zinc-600 hover:bg-zinc-100",
                        )}
                      >
                        {String(h).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Phút
                </span>
                <div
                  ref={minuteScrollRef}
                  className="h-[160px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden flex flex-col gap-0.5 w-11"
                >
                  {minutesRange.map((m) => {
                    const isActive = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        data-active={isActive}
                        onClick={() =>
                          handleSelectTime(selectedHour12, m, selectedPeriod)
                        }
                        className={cn(
                          "h-7 text-xs font-semibold rounded-xl flex items-center justify-center shrink-0 transition-all",
                          isActive
                            ? "bg-red-600 text-white font-bold shadow-md shadow-red-100"
                            : "text-zinc-600 hover:bg-zinc-100",
                        )}
                      >
                        {String(m).padStart(2, "0")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AM/PM Column */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Buổi
                </span>
                <div
                  ref={periodScrollRef}
                  className="h-[160px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden flex flex-col gap-1 w-11"
                >
                  {(["AM", "PM"] as const).map((p) => {
                    const isActive = selectedPeriod === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        data-active={isActive}
                        onClick={() =>
                          handleSelectTime(selectedHour12, selectedMinute, p)
                        }
                        className={cn(
                          "h-7 text-xs font-bold rounded-xl flex items-center justify-center shrink-0 transition-all",
                          isActive
                            ? "bg-red-600 text-white shadow-md shadow-red-100"
                            : "text-zinc-600 hover:bg-zinc-100",
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-zinc-800 hover:bg-zinc-100 transition-colors px-3 py-1.5 rounded-xl border border-zinc-200"
              >
                Xong
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
