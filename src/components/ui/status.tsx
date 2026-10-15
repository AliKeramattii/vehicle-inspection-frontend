import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon, type IconName } from "./icon";

export type StatusTone = "neutral" | "information" | "success" | "warning" | "destructive";
const tones: Record<StatusTone, { className: string; icon: IconName }> = {
  neutral: { className: "bg-surface-soft text-muted", icon: "clock" },
  information: { className: "bg-information-soft text-information", icon: "info" },
  success: { className: "bg-success-soft text-success-ink", icon: "check" },
  warning: { className: "bg-warning-soft text-warning-ink", icon: "warning" },
  destructive: { className: "bg-destructive-soft text-destructive-ink", icon: "error" },
};
type StatusProps = HTMLAttributes<HTMLDivElement> & { tone?: StatusTone; children: ReactNode };
export function StatusBadge({ tone = "neutral", children, className, ...props }: StatusProps) {
  return <div {...props} className={cn("inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-xs font-medium", tones[tone].className, className)}>
    <Icon name={tones[tone].icon} size={16} />{children}
  </div>;
}
export function InlineAlert({ tone = "information", children, className, role, ...props }: StatusProps) {
  return <div {...props} role={role ?? (tone === "destructive" ? "alert" : "status")}
    className={cn("flex items-start gap-2 rounded-input p-3 text-sm leading-6", tones[tone].className, className)}>
    <Icon name={tones[tone].icon} size={20} className="mt-0.5" /><div>{children}</div>
  </div>;
}
