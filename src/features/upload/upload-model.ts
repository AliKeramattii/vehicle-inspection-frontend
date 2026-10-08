import type { LocalPhoto } from "@/lib/media/photo-store";
import { photoKey } from "@/lib/media/photo-store";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { CapturePackageData } from "@/features/capture-package/capture-package-model";

export type UploadStatus = "local" | "queued" | "uploading" | "uploaded" | "failed" | "cancelled";
export type VerificationStatus = "not-started" | "processing" | "verified" | "retake-requested";
export type MediaReference = {
  inspectionId: string; namespace: string; evidenceKind: "photo" | "video-360";
  requirementId?: string; title: string; localBlobKey: string; revision: string;
  mimeType: string; byteSize: number; capturedAt: string; required: boolean;
};
export type UploadJob = MediaReference & {
  id: string; current: boolean; upload: UploadStatus; verification: VerificationStatus;
  bytesUploaded: number; attemptCount: number; retryable?: boolean; lastError?: string;
  nextRetryAt?: number; nextCheckAt?: number; remoteEvidenceId?: string; reviewerReason?: string;
  owner?: string; leaseUntil?: number;
};
export const uploadDatabase = { name: "inspection-upload-queue", version: 1, store: "jobs", settings: "mock-settings" } as const;
export const uploadJobId = (media: MediaReference) => JSON.stringify([media.namespace, media.evidenceKind, media.requirementId ?? "video-360", media.revision]);
export const photoRevision = (photo: LocalPhoto) => photo.revisionId ?? `${photo.capturedAt}:${photo.blob?.size}:${photo.blob?.type}`;
export function acceptedMedia(inspectionId: string, namespace: string, template: PhotographyTemplate, photos: readonly LocalPhoto[], data: CapturePackageData): MediaReference[] {
  const items: MediaReference[] = [];
  for (const section of template.sections) for (const requirement of section.photoRequirements) {
    const photo = photos.find((record) => record.requirementId === requirement.id);
    if (!photo?.blob?.size || !photo.capturedAt || photo.status === "pending" || photo.status === "retake-requested") continue;
    items.push({ inspectionId, namespace, evidenceKind: "photo", requirementId: requirement.id, title: requirement.title, localBlobKey: photoKey(namespace, requirement.id), revision: photoRevision(photo), mimeType: photo.blob.type, byteSize: photo.blob.size, capturedAt: photo.capturedAt, required: requirement.required });
  }
  const video = data.video360?.accepted;
  if (template.captureRequirements?.video360Required && video?.blob.size && data.video360?.state !== "retakeRequired") items.push({ inspectionId, namespace, evidenceKind: "video-360", title: "ویدیوی ۳۶۰ درجه", localBlobKey: video.metadata.localBlobKey, revision: video.metadata.localBlobKey, mimeType: video.metadata.mimeType, byteSize: video.metadata.sizeBytes, capturedAt: video.metadata.capturedAt, required: true });
  return items;
}
export const requiredMediaCount = (template: PhotographyTemplate) => template.sections.reduce((count, section) => count + section.photoRequirements.filter((photo) => photo.required).length, 0) + Number(Boolean(template.captureRequirements?.video360Required));
export const uploadComplete = (job: UploadJob) => job.current && job.upload === "uploaded";
export function uploadProgress(jobs: readonly UploadJob[], expected: number) {
  const current = jobs.filter((job) => job.current && job.required);
  const uploaded = current.filter(uploadComplete).length;
  return { total: expected, uploaded, percentage: expected ? Math.min(100, uploaded / expected * 100) : 0,
    complete: expected > 0 && uploaded === expected && current.length === expected && !current.some((job) => job.verification === "retake-requested"),
    queued: current.filter((job) => ["local", "queued"].includes(job.upload)).length,
    uploading: current.filter((job) => job.upload === "uploading").length,
    failed: current.filter((job) => job.upload === "failed").length };
}
export function uploadLabel(job: UploadJob) {
  if (job.verification === "retake-requested") return "نیاز به ثبت مجدد";
  if (job.upload === "uploaded") return job.verification === "verified" ? "تأیید شد" : job.verification === "processing" ? "در حال پردازش" : "ارسال شد";
  return { local: "روی دستگاه", queued: "در صف", uploading: "در حال ارسال", failed: "ناموفق", cancelled: "جایگزین شد" }[job.upload];
}
