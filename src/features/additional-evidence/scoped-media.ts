import { assertPhotoChoice } from "@/features/photography/photo-choice";
import { selectPhotoAlternative, readPhoto, photoKey } from "@/lib/media/photo-store";
import { createPhotoOptimization } from "@/lib/media/photo-optimization";
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
  const optimizer = createPhotoOptimization(mutate);
  const assertPhoto = (id:string) => {if(item.kind !== "photo" || item.requirementId !== id)throw new Error("کاهش حجم فقط برای عکس همین درخواست مجاز است.");};
  const optimization = {
    prepare:(id:string,...args:Parameters<typeof optimizer.prepare> extends [string,...infer Rest] ? Rest : never)=>{assertPhoto(id);return optimizer.prepare(id,...args);},
    choose:(id:string,...args:Parameters<typeof optimizer.choose> extends [string,...infer Rest] ? Rest : never)=>{assertPhoto(id);return optimizer.choose(id,...args);},
  };
  return {
    optimization,
    selectAlternative:(alternativeId:string|undefined)=>mutate(namespace=>{
      if(item.kind !== "photo") throw new Error("این درخواست مربوط به عکس نیست.");
      const photo=request.template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===item.requirementId)!;
      if(alternativeId !== undefined) assertPhotoChoice(photo,alternativeId);
      return selectPhotoAlternative(namespace,item.requirementId,alternativeId);
    }),
    savePhoto: (draft: PhotoDraft) => mutate((namespace) => { if (item.kind !== "photo") throw new Error("این درخواست مربوط به عکس نیست."); const photo = request.template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===item.requirementId)!; assertPhotoChoice(photo, draft.alternativeId); return indexedDBPhotoStore.saveDraft(namespace, item.requirementId, draft); }),
    confirmPhoto: () => mutate(async (namespace) => { if (item.kind !== "photo") throw new Error("این درخواست مربوط به عکس نیست."); const photo = request.template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===item.requirementId)!; const candidate = await readPhoto(photoKey(namespace,item.requirementId)); assertPhotoChoice(photo, candidate?.draft?.alternativeId); return indexedDBPhotoStore.confirm(namespace, item.requirementId, candidate?.draft?.revisionId); }),
    discardPhotoDraft: () => mutate((namespace) => { if (item.kind !== "photo") throw new Error("این درخواست مربوط به عکس نیست."); return indexedDBPhotoStore.discardDraft(namespace, item.requirementId); }),
    saveVideo: (draft: VideoDraft) => mutate((namespace) => { if (item.kind !== "video-360") throw new Error("ضبط ویدیو برای این درخواست مجاز نیست."); return indexedDBCaptureDataStore.saveVideoDraft(namespace, draft); }),
    confirmVideo: () => mutate((namespace) => { if (item.kind !== "video-360") throw new Error("ضبط ویدیو برای این درخواست مجاز نیست."); return indexedDBCaptureDataStore.confirmVideo(namespace); }),
    discardVideoDraft: () => mutate((namespace) => { if (item.kind !== "video-360") throw new Error("ضبط ویدیو برای این درخواست مجاز نیست."); return indexedDBCaptureDataStore.discardVideoDraft(namespace); }),
  };
}
