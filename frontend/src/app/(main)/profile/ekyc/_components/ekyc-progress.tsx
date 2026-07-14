import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "../ekyc-constants";
import type { WizardStep } from "../ekyc-types";

export function EkycProgress({ step }: { step: WizardStep }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 sm:hidden">
        <span className="text-xs font-medium text-zinc-500">Bước {step}/5</span>
        <span className="truncate text-sm font-semibold text-zinc-950">
          {WIZARD_STEPS[step - 1]}
        </span>
      </div>
      <ol className="grid min-w-[620px] grid-cols-5" aria-label="Tiến trình eKYC">
      {WIZARD_STEPS.map((label, index) => {
        const number = index + 1;
        const completed = number < step;
        const current = number === step;
        return (
          <li key={label} className="relative flex flex-col items-center gap-2 px-2">
            {index > 0 ? (
              <span
                className={cn(
                  "absolute right-1/2 top-4 h-px w-full -translate-y-1/2",
                  number <= step ? "bg-red-500" : "bg-zinc-200",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full border bg-white text-xs font-semibold",
                completed && "border-emerald-500 bg-emerald-500 text-white",
                current && "border-red-600 text-red-600 ring-4 ring-red-50",
                !completed && !current && "border-zinc-200 text-zinc-400",
              )}
              aria-current={current ? "step" : undefined}
            >
              {completed ? <Check className="size-4" /> : number}
            </span>
            <span
              className={cn(
                "text-center text-[11px] font-medium leading-tight",
                current ? "text-red-600" : completed ? "text-zinc-700" : "text-zinc-400",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
