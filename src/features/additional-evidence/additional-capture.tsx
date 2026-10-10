"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PhotoGuidance } from "@/features/photography/photo-guidance";
import { PhotoCamera } from "@/features/photography/photo-camera";
import { PhotoReview } from "@/features/photography/photo-review";
import { VideoCapture } from "@/features/capture-package/video-capture";
import { VideoReview } from "@/features/capture-package/video-review";
import { photoKey, readPhoto } from "@/lib/media/photo-store";
import { indexedDBCaptureDataStore, videoBlobKey } from "@/lib/media/capture-data-store";
import { useUploadRuntime } from "@/features/upload/upload-runtime";
import { InlineAlert } from "@/components/ui/status";
import { SecondaryButton } from "@/components/ui/button";
import { scopedMedia } from "./scoped-media";
import { additionalRoutes, itemHref, requestNamespace, type AdditionalView, type EvidenceRequest } from "./request-model";
import { readRequestPackage } from "./request-source";

/** Request controller reuses ordinary guidance/camera/review; there is no second capture implementation. */
export function AdditionalCapture({ request, view }: { request: EvidenceRequest; view: Exclude<AdditionalView, { kind: "list" }> }) {
  const router = useRouter(), runtime = useUploadRuntime(), [pending, setPending] = useState(false), [error, setError] = useState<string>();
  const item = request.items.find((item) => item.kind === view.kind && (item.kind !== "photo" || view.kind === "photo" && item.requirementId === view.requirementId))!;
  const media = scopedMedia(request, item), namespace = requestNamespace(request), backHref = additionalRoutes.list(request.inspectionId, request.id), backLabel = "بازگشت به مدارک تکمیلی";
  const data = useQuery({ queryKey: ["evidence-requests", "candidate", request.id, item.id], enabled: view.stage === "review", networkMode: "always", retry: false,
    queryFn: async () => item.kind === "photo" ? { kind: "photo" as const, candidate: await readPhoto(photoKey(namespace, item.requirementId)), original: await readPhoto(photoKey(request.originalNamespace, item.requirementId)) } : { kind: "video-360" as const, candidate: (await indexedDBCaptureDataStore.get(namespace)).video360, original: (await indexedDBCaptureDataStore.get(request.originalNamespace)).video360 } });
  const act = async (operation: () => Promise<void>) => { setPending(true); setError(undefined); try { await operation(); runtime.resume(); } catch (cause) { setError(cause instanceof Error ? cause.message : "ذخیره مدرک ممکن نشد؛ مدرک قبلی محفوظ است."); } finally { setPending(false); } };
  const next = async () => { const source = await readRequestPackage(request); const item = request.items.find((item, index) => !source.readiness.itemMedia[index] || source.drafts.includes(item.id)); router.push(item ? itemHref(request, item, source.drafts.includes(item.id) ? "review" : "capture") : backHref); };
  if (view.stage === "review" && data.isPending) return <div className="submission-loading" role="status" aria-label="در حال خواندن مدرک"><div /><div /></div>;
  if (data.error) return <div className="submission-recovery"><InlineAlert tone="warning">{data.error.message}</InlineAlert><SecondaryButton onClick={() => void data.refetch()}>تلاش مجدد</SecondaryButton></div>;
  if (item.kind === "video-360") {
    if (view.stage === "record") return <VideoCapture inspectionId={request.inspectionId} backHref={backHref} backLabel={backLabel} reason={item.reviewerReason} onRecorded={async (video, signal) => {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      await media.saveVideo({ blob: video.blob, durationSeconds: video.durationSeconds, metadata: { kind: "video-360", mimeType: video.blob.type, sizeBytes: video.blob.size, localBlobKey: videoBlobKey(namespace), capturedAt: new Date().toISOString() } });
      if (!signal.aborted) router.push(itemHref(request, item, "review"));
    }} />;
    const value = data.data?.kind === "video-360" ? data.data : undefined;
    return <VideoReview inspectionId={request.inspectionId} video={{ ...value?.candidate, accepted: value?.candidate?.accepted ?? value?.original?.accepted, state: value?.candidate?.state ?? "retakeRequired", reviewerReason: item.reviewerReason }} pending={pending} error={error} navigation={{ backHref, backLabel, recordHref: itemHref(request, item) }} onConfirm={() => void act(async () => { await media.confirmVideo(); await next(); })} onRetake={() => void act(async () => { await media.discardVideoDraft(); router.push(itemHref(request, item)); })} />;
  }
  const section = request.template.sections.find((section) => section.photoRequirements.some((photo) => photo.id === item.requirementId))!;
  const photo = { ...section.photoRequirements.find((photo) => photo.id === item.requirementId)!, status: "retake-requested" as const, reviewerReason: item.reviewerReason };
  const scopedSection = { ...section, photoRequirements: section.photoRequirements.map((value) => value.id === photo.id ? photo : value) };
  const guideHref = additionalRoutes.photo(request.inspectionId, request.id, photo.id, "guide");
  if (view.stage === "guide") return <PhotoGuidance photo={photo} section={scopedSection} records={[]} inspectionId={request.inspectionId} navigation={{ backHref, backLabel, cameraHref: additionalRoutes.photo(request.inspectionId, request.id, photo.id, "camera") }} />;
  if (view.stage === "camera") return <PhotoCamera photo={photo} inspectionId={request.inspectionId} guideHref={guideHref} reviewerReason={item.reviewerReason} onCapture={async (blob) => { await media.savePhoto({ blob, capturedAt: new Date().toISOString() }); router.push(itemHref(request, item, "review")); }} />;
  const value = data.data?.kind === "photo" ? data.data : undefined;
  return <PhotoReview photo={photo} section={scopedSection} record={value?.candidate?.draft || value?.candidate?.blob ? value.candidate : value?.original} inspectionId={request.inspectionId} navigation={{ backHref, backLabel, guideHref, returnLabel: "بازگشت به درخواست" }} preservationNote="مدرک ارسال‌شده اولیه محفوظ است. این عکس فقط در پاسخ به درخواست کارشناس ثبت می‌شود." pending={pending} error={error} onConfirm={() => void act(async () => { await media.confirmPhoto(); await next(); })} onRetake={() => void act(async () => { await media.discardPhotoDraft(); router.push(guideHref); })} />;
}
