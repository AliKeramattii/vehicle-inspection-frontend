import type { ReactNode } from "react";
export function CustomerShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-surface sm:border-x sm:border-border">{children}</div>;
}
