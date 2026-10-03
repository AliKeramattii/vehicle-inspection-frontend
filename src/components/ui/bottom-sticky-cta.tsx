import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function BottomStickyCTA({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("safe-area-bottom sticky bottom-0 z-10 mt-auto border-t border-border bg-surface px-4 pt-4", className)}>{children}</div>;
}
