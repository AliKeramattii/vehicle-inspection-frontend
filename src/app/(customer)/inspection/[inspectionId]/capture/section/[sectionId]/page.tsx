import { PhotographyWorkflow } from "@/features/photography/photography-workflow";
export default async function SectionPage({ params }: { params: Promise<{ inspectionId: string; sectionId: string }> }) {
  const { inspectionId, sectionId } = await params;
  return <PhotographyWorkflow inspectionId={inspectionId} view={{ kind: "section", sectionId }} />;
}
