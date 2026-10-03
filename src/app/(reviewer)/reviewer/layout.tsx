import type { ReactNode } from "react";
import { OperationsShell } from "@/components/layout/operations-shell";
export default function ReviewerLayout({ children }: { children: ReactNode }) { return <OperationsShell title="فضای کارشناسان">{children}</OperationsShell>; }
