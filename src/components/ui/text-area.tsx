
"use client";
import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
export function TextArea({ label, error, id, className, "aria-describedby": describedBy, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const generated = useId(), fieldId = id ?? generated;
  return <div className="space-y-2"><label htmlFor={fieldId} className="block text-sm font-medium">{label}</label>
    <textarea {...props} id={fieldId} aria-invalid={Boolean(error)} aria-describedby={[describedBy, error ? fieldId + "-error" : undefined].filter(Boolean).join(" ") || undefined}
      className={cn("w-full rounded-input border border-border bg-surface px-3 py-2 text-base placeholder:text-muted disabled:bg-slate-100", error && "border-destructive", className)} />
    {error && <p id={fieldId + "-error"} className="text-xs leading-5 text-destructive">{error}</p>}</div>;
}
