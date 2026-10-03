import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export function AppHeader({ partnerName, actions }: { partnerName?: string; actions?: ReactNode }) {
  return <header className="flex min-h-18 items-center justify-between gap-3 border-b border-border px-4 py-3">
    <div className="flex items-center gap-2"><Icon name="car" className="text-primary" />
      <div><p className="text-sm font-bold">بازدید خودرو</p><p className="text-xs text-muted">بازدید آنلاین و امن</p></div>
    </div>
    {partnerName && <div className="flex items-center gap-2 border-s border-border ps-3">
      <Icon name="shield" className="text-primary" /><span className="text-xs font-medium">{partnerName}</span>
    </div>}{actions}
  </header>;
}
