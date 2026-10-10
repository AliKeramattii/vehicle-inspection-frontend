import type { ReactNode } from "react";
import { InspectionEditGuard } from "@/features/submission/inspection-edit-guard";
export default async function InspectionLayout({ params, children }: { params: Promise<{ inspectionId: string }>; children: ReactNode }) {
  const { inspectionId } = await params;
  return <InspectionEditGuard inspectionId={inspectionId}>{children}</InspectionEditGuard>;
}
