import type { ReactNode } from "react";
import { CaptureJourneyHeader } from "@/features/photography/capture-journey-header";
import "@/features/photography/photography.css";
import "@/features/capture-package/capture-package.css";

export default async function PhotographyLayout({ children, params }: { children: ReactNode; params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <main id="main-content" tabIndex={-1} className="photography-screen"><CaptureJourneyHeader inspectionId={inspectionId}/>{children}</main>;
}
