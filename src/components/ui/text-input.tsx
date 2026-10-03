"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string };
export function TextInput({ label, hint, error, id, className, "aria-describedby": describedBy, ...props }: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const description = error ?? hint;
  const descriptionId = `${inputId}-description`;
  return <div className="space-y-2">
    <label htmlFor={inputId} className="block text-sm font-medium">{label}</label>
    <input {...props} id={inputId} aria-invalid={error ? true : props["aria-invalid"]}
      aria-describedby={[describedBy, description ? descriptionId : undefined].filter(Boolean).join(" ") || undefined}
      className={cn("min-h-12 w-full rounded-input border border-border bg-surface px-3 py-2 text-base placeholder:text-muted disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-muted", error && "border-destructive", className)} />
    {description && <p id={descriptionId} className={cn("text-xs leading-5", error ? "text-destructive" : "text-muted")}>{description}</p>}
  </div>;
}
