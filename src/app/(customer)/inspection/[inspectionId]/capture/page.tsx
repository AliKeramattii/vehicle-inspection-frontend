import type { Metadata } from "next";
import { PhotographyWorkflow } from "@/features/photography/photography-workflow";
import { vehiclePreviewEnabled } from "@/features/vehicle-3d/preview-gate";
export const metadata: Metadata = { title: "عکاسی خودرو" };
export default async function PhotographyPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  const previewHref = vehiclePreviewEnabled(process.env.NODE_ENV, process.env.VEHICLE_3D_PREVIEW) ? `/inspection/${encodeURIComponent(inspectionId)}/capture/preview-3d` : undefined;
  return <PhotographyWorkflow inspectionId={inspectionId} view={{ kind: "overview" }} previewHref={previewHref} />;
}
