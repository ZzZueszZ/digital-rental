"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}>({});

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    name?: string;
  }
>(({ className, value, onValueChange, name, children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div
        className={cn("grid gap-2", className)}
        {...props}
        ref={ref}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const checked = context.value === value;

  return (
    <div className="flex items-center justify-center relative w-4 h-4 shrink-0">
      <input
        type="radio"
        value={value}
        name={context.name}
        checked={checked}
        onChange={() => context.onValueChange?.(value as string)}
        className={cn(
          "peer h-4 w-4 rounded-full border border-zinc-300 text-zinc-950 focus:ring-zinc-950 cursor-pointer appearance-none transition-all checked:border-zinc-950 checked:border-[5px]",
          className
        )}
        {...props}
        ref={ref}
      />
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
