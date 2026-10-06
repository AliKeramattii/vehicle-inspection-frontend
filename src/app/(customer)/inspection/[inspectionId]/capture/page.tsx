import type { Metadata } from "next";
import { PhotographyWorkflow } from "@/features/photography/photography-workflow";
export const metadata: Metadata = { title: "عکاسی خودرو" };
export default async function PhotographyPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <PhotographyWorkflow inspectionId={inspectionId} view={{ kind: "overview" }} />;
}
