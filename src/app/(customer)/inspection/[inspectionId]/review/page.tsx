import type { Metadata } from "next";
import { InspectionJourneyHeader } from "@/components/inspection/inspection-journey-header";
import { SummaryWorkflow } from "@/features/submission/summary-workflow";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { mockInspectionReference } from "@/mocks/fixtures";
import "@/features/photography/photography.css";
import "@/features/upload/upload.css";
import "@/features/inspection/identity.css";
import "@/features/submission/submission.css";
export const metadata: Metadata = { title: "بررسی نهایی بازدید" };
export default async function SummaryPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <main id="main-content" tabIndex={-1} className="photography-screen submission-screen"><InspectionJourneyHeader current="upload" backHref={inspectionRoutes.upload(inspectionId)} referenceCode={mockInspectionReference} partnerName="بیمه ملت" /><SummaryWorkflow inspectionId={inspectionId} /></main>;
}
