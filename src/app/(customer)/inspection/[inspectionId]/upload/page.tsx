import type { Metadata } from "next";
import { UploadWorkflow } from "@/features/upload/upload-workflow";
import { InspectionJourneyHeader } from "@/components/inspection/inspection-journey-header";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import "@/features/photography/photography.css";
import "@/features/upload/upload.css";

export const metadata: Metadata = { title: "ارسال فایل‌ها" };
export default async function UploadPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <main id="main-content" tabIndex={-1} className="photography-screen upload-screen"><InspectionJourneyHeader current="upload" backHref={inspectionRoutes.photographyReview(inspectionId)} referenceCode="BDI-8F31K2" partnerName="بیمه ملت" /><UploadWorkflow inspectionId={inspectionId} /></main>;
}
