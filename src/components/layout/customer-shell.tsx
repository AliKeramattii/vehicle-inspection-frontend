import type { ReactNode } from "react";
import { AppViewport } from "./app-viewport";
export function CustomerShell({ children }: { children: ReactNode }) {
  return <AppViewport className="customer-viewport mx-auto w-full max-w-[480px] bg-surface sm:border-x sm:border-border">{children}</AppViewport>;
}
