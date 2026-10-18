import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };
const base = "inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
function Button({ loading = false, disabled, children, className, type = "button", ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={cn(base, className)}>
    {loading && <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}{children}
  </button>;
}
export function PrimaryButton({ className, ...props }: ButtonProps) {
  return <Button {...props} data-variant="primary" className={cn("bg-primary text-on-primary hover:bg-primary-hover", className)} />;
}
export function SecondaryButton({ className, ...props }: ButtonProps) {
  return <Button {...props} data-variant="secondary" className={cn("border border-control-border bg-surface text-ink hover:bg-surface-soft", className)} />;
}
export type IconButtonProps = Omit<ButtonProps, "children" | "aria-label"> & { "aria-label": string; children: ReactNode };
export function IconButton({ className, ...props }: IconButtonProps) {
  return <Button {...props} className={cn("min-h-11 min-w-11 rounded-control p-2 text-muted hover:bg-surface-soft hover:text-ink", className)} />;
}
