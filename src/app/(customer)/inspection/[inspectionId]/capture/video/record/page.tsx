import { PhotographyWorkflow } from "@/features/photography/photography-workflow";
export default async function VideoPage({ params }: { params: Promise<{ inspectionId: string }> }) {
  const { inspectionId } = await params;
  return <PhotographyWorkflow inspectionId={inspectionId} view={{ kind: "video-record" }} />;
}
