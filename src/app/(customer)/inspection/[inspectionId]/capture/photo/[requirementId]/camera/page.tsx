import { PhotographyWorkflow } from "@/features/photography/photography-workflow";
export default async function PhotoPage({ params }: { params: Promise<{ inspectionId: string; requirementId: string }> }) {
  const { inspectionId, requirementId } = await params;
  return <PhotographyWorkflow inspectionId={inspectionId} view={{ kind: "camera", requirementId }} />;
}
