import { indexedDBPhotoStore, type PhotoDraft } from "@/lib/media/photo-store";
import { indexedDBCaptureDataStore } from "@/lib/media/capture-data-store";
import type { VideoDraft } from "@/features/capture-package/capture-package-model";
import { indexedDBUploadQueue } from "@/features/upload/queue-repository";
import { requestNamespace, type EvidenceRequest, type EvidenceRequestItem } from "./request-model";
import { requestService } from "./request-service";
import { readRequestPackage } from "./request-source";

/** Only this authorized adapter mutates supplemental media; original namespaces are never writable here. */
export function scopedMedia(request: EvidenceRequest, item: EvidenceRequestItem) {
  const scope = { inspectionId: request.inspectionId, requestId: request.id, version: request.version, kind: item.kind, requirementId: item.kind === "photo" ? item.requirementId : undefined };
  const mutate = <T>(operation: (namespace: string) => Promise<T>) => requestService.mutate(scope, async (current) => {
    const result = await operation(requestNamespace(current));
    const source = await readRequestPackage(current); await indexedDBUploadQueue.reconcile(source.namespace, source.media);
    return result;
  });
  return {
    savePhoto: (draft: PhotoDraft) => mutate((namespace) => { if (item.kind !== "photo") throw new Error("این درخواست مربوط به عکس نیست."); return indexedDBPhotoStore.saveDraft(namespace, item.requirementId, draft); }),
    confirmPhoto: () => mutate((namespace) => { if (item.kind !== "photo") throw new Error("این درخواست مربوط به عکس نیست."); return indexedDBPhotoStore.confirm(namespace, item.requirementId); }),
    discardPhotoDraft: () => mutate((namespace) => { if (item.kind !== "photo") throw new Error("این درخواست مربوط به عکس نیست."); return indexedDBPhotoStore.discardDraft(namespace, item.requirementId); }),
    saveVideo: (draft: VideoDraft) => mutate((namespace) => { if (item.kind !== "video-360") throw new Error("ضبط ویدیو برای این درخواست مجاز نیست."); return indexedDBCaptureDataStore.saveVideoDraft(namespace, draft); }),
    confirmVideo: () => mutate((namespace) => { if (item.kind !== "video-360") throw new Error("ضبط ویدیو برای این درخواست مجاز نیست."); return indexedDBCaptureDataStore.confirmVideo(namespace); }),
    discardVideoDraft: () => mutate((namespace) => { if (item.kind !== "video-360") throw new Error("ضبط ویدیو برای این درخواست مجاز نیست."); return indexedDBCaptureDataStore.discardVideoDraft(namespace); }),
  };
}
