import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { isLoopbackRequestHost, vehiclePreviewEnabled } from "@/features/vehicle-3d/preview-gate";
import { VehiclePreviewWorkflow } from "@/features/vehicle-3d/vehicle-preview-workflow";

export default async function VehiclePreviewPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  if (!vehiclePreviewEnabled(process.env.NODE_ENV, process.env.VEHICLE_3D_PREVIEW)) notFound();
  const host = (await headers()).get("host") ?? "";
  if (!isLoopbackRequestHost(host)) notFound();
  const { inspectionId } = await params;
  return <VehiclePreviewWorkflow inspectionId={inspectionId} />;
}
