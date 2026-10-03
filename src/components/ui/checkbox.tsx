"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & { label: ReactNode };
export function Checkbox({ label, id, className, disabled, ...props }: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <label htmlFor={inputId} className={cn("flex min-h-11 items-center gap-3 text-sm leading-6", disabled && "text-muted")}>
    <input {...props} type="checkbox" id={inputId} disabled={disabled} className={cn("size-5 shrink-0 accent-primary disabled:cursor-not-allowed", className)} /><span>{label}</span>
  </label>;
}
