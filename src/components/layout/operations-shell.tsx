import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
export function OperationsShell({ title, children }: { title: string; children: ReactNode }) {
  return <div className="min-h-dvh"><AppHeader actions={<span className="text-sm font-semibold">{title}</span>} />
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1440px] p-6">{children}</main>
  </div>;
}
