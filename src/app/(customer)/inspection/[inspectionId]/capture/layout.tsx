import type { ReactNode } from "react";
import { InspectionJourneyHeader } from "@/components/inspection/inspection-journey-header";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import "@/features/photography/photography.css";

export default async function PhotographyLayout({ children, params }: { children: ReactNode; params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <main id="main-content" tabIndex={-1} className="photography-screen"><InspectionJourneyHeader current="capture" backHref={inspectionRoutes.vehicle(inspectionId)} referenceCode="BDI-8F31K2" partnerName="بیمه ملت" />{children}</main>;
}
