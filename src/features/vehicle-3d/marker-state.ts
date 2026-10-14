import type { LocalPhoto } from "@/lib/media/photo-store";
import type { PhotoRequirement } from "@/schemas/photography";
import { photographyVisualState } from "@/features/photography/photography-model";
import { photoRevision, uploadLabel, type UploadJob } from "@/features/upload/upload-model";
export type MarkerState = "pending" | "complete" | "attention" | "failed";
/** Capture is local acceptance; upload is a separate current-revision fact. Selection belongs to the parent. */
export function markerEvidence(photo: PhotoRequirement, records: readonly LocalPhoto[], jobs: readonly UploadJob[], namespace: string) {
  const scoped = records.filter(item => item.namespace === namespace);
  const record = scoped.find(item => item.requirementId === photo.id);
  const capture = photographyVisualState(photo, scoped);
  const accepted = Boolean(record?.blob?.size && record.capturedAt && ["captured","uploading","uploaded","verified"].includes(record.status));
  const job = record && jobs.find(item => item.namespace === namespace && item.requirementId === photo.id && item.evidenceKind === "photo" && item.current && item.revision === photoRevision(record));
  const state: MarkerState = capture === "attention" || job?.verification === "retake-requested" ? "attention" : job?.upload === "failed" ? "failed" : accepted ? "complete" : "pending";
  return { state, captureComplete: accepted, upload: job ? uploadLabel(job) : accepted ? "روی دستگاه؛ هنوز ارسال نشده" : "عکسی ثبت نشده", reason: job?.reviewerReason ?? record?.reviewerReason ?? photo.reviewerReason };
}
export const fixedMarkerPosition = (index: number) => ({ x: index < 6 ? 9 : 91, y: 14 + (index % 6) * 14 });
