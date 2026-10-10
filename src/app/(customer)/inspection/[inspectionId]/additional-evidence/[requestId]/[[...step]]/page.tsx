import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdditionalWorkflow } from "@/features/additional-evidence/additional-workflow";
import { parseAdditionalView } from "@/features/additional-evidence/request-model";
import "@/features/photography/photography.css";
import "@/features/capture-package/capture-package.css";
import "@/features/submission/submission.css";
import "@/features/additional-evidence/additional-evidence.css";
export const metadata: Metadata = { title: "مدارک تکمیلی بازدید" };
export default async function AdditionalEvidencePage({ params }: { params: Promise<{ inspectionId: string; requestId: string; step?: string[] }> }) {
  const { inspectionId, requestId, step } = await params, view = parseAdditionalView(step ?? []);
  if (!view) notFound();
  return <main id="main-content" tabIndex={-1} className="photography-screen additional-screen"><AdditionalWorkflow inspectionId={inspectionId} requestId={requestId} view={view} /></main>;
}
