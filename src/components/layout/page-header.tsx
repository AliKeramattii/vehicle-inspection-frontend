import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export function PageHeader({ title, description, backHref, actions }: {
  title: string; description?: string; backHref?: string; actions?: ReactNode;
}) {
  return <div className="flex items-start gap-2">
    {backHref && <Link href={backHref} aria-label="بازگشت" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-control text-muted hover:bg-slate-100"><Icon name="back" /></Link>}
    <div className="min-w-0 flex-1"><h1 className="text-xl font-bold leading-9">{title}</h1>
      {description && <p className="mt-1 text-sm leading-7 text-muted">{description}</p>}
    </div>{actions}
  </div>;
}
