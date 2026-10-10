import { readUploadPackage } from "@/features/upload/upload-package";
import { indexedDBUploadQueue } from "@/features/upload/queue-repository";
import { indexedDBCaptureDataStore } from "@/lib/media/capture-data-store";
import { photoKey, readPhoto } from "@/lib/media/photo-store";
import { requestNamespace, requestReadiness, requestTemplate, type EvidenceRequest } from "./request-model";

export async function readRequestPackage(request: EvidenceRequest) {
  const namespace = requestNamespace(request), capture = await readUploadPackage(request.inspectionId, namespace, requestTemplate(request));
  const media = capture.media.map((media) => { const item = request.items.find((item) => item.kind === media.evidenceKind && (item.kind !== "photo" || item.requirementId === media.requirementId))!; return { ...media, requestId: request.id, requestVersion: request.version, requestItemId: item.id, replacesEvidenceId: item.originalEvidenceId }; });
  const drafts: string[] = [];
  for (const item of request.items) {
    if (item.kind === "photo" ? (await readPhoto(photoKey(namespace, item.requirementId)))?.draft : (await indexedDBCaptureDataStore.get(namespace)).video360?.draft) drafts.push(item.id);
  }
  const jobs = await indexedDBUploadQueue.list();
  return { namespace, media, drafts, jobs, readiness: requestReadiness(request, media, jobs, drafts) };
}
export type RequestPackage = Awaited<ReturnType<typeof readRequestPackage>>;
