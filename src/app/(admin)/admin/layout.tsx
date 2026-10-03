import type { ReactNode } from "react";
import { OperationsShell } from "@/components/layout/operations-shell";
export default function AdminLayout({ children }: { children: ReactNode }) { return <OperationsShell title="مدیریت سامانه">{children}</OperationsShell>; }
