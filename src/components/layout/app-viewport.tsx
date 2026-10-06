import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/** Bounded app frame. Content-heavy screens designate one internal scroll region. */
export function AppViewport({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("app-viewport", className)} />;
}
