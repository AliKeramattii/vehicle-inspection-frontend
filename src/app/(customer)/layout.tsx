import type { ReactNode } from "react";
import { CustomerShell } from "@/components/layout/customer-shell";
import { AuthWorkflowProvider } from "@/features/auth/auth-workflow-provider";
import "@/features/auth/entry.css";
export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <CustomerShell><AuthWorkflowProvider>{children}</AuthWorkflowProvider></CustomerShell>;
}
