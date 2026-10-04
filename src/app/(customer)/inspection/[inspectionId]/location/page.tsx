import type { Metadata } from "next";
import { InspectionJourneyHeader } from "@/components/inspection/inspection-journey-header";
import { LocationWorkflow } from "@/features/location/location-workflow";
import "@/features/inspection/identity.css";

export const metadata: Metadata = { title: "تأیید موقعیت بازدید" };
export default async function LocationPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <main id="main-content" tabIndex={-1} className="identity-screen location-screen"><InspectionJourneyHeader current="location" backHref="/consent" /><LocationWorkflow inspectionId={inspectionId} /></main>;
}
