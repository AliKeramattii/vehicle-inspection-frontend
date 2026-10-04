import type { Metadata } from "next";
import { InspectionJourneyHeader } from "@/components/inspection/inspection-journey-header";
import { VehicleWorkflow } from "@/features/vehicle/vehicle-workflow";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import "@/features/inspection/identity.css";

export const metadata: Metadata = { title: "تأیید مشخصات خودرو" };
export default async function VehiclePage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <main id="main-content" tabIndex={-1} className="identity-screen vehicle-screen"><InspectionJourneyHeader current="vehicle" backHref={inspectionRoutes.location(inspectionId)} /><VehicleWorkflow inspectionId={inspectionId} /></main>;
}
