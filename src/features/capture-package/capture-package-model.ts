import { z } from "zod";
import { normalizeDigits } from "@/lib/utils/persian";
import type { EvidenceState } from "@/types/domain";
import type { evidenceKindSchema } from "@/schemas/domain";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { photographyProgress } from "@/features/photography/photography-model";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";

export const odometerReadingSchema = z.object({ kilometers: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER), updatedAt: z.string().optional(), evidenceId: z.string().optional() });
export type OdometerReading = z.infer<typeof odometerReadingSchema>;
export function parseOdometer(text: string): number {
  const normalized = normalizeDigits(text.trim());
  // Permit ungrouped integers or consistently grouped thousands, never strip arbitrary characters.
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,3}(?:٬\d{3})+|\d{1,3}(?: \d{3})+)$/.test(normalized)) throw new Error(text.trim() ? "کیلومتر را فقط با عدد صحیح و بدون علامت وارد کنید." : "کیلومتر فعلی را وارد کنید.");
  const value = Number(normalized.replace(/[,٬ ]/g, ""));
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("عدد کیلومتر بیش از محدوده مجاز است.");
  return value;
}
export const formatOdometer = (kilometers: number) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(kilometers);
export type LocalMediaMetadata = { kind: z.infer<typeof evidenceKindSchema>; mimeType: string; sizeBytes: number; localBlobKey: string; capturedAt: string; requirementId?: string };
export type VideoDraft = { blob: Blob; durationSeconds: number; metadata: LocalMediaMetadata };
export type LocalVideo360 = { accepted?: VideoDraft; draft?: VideoDraft; state: EvidenceState; reviewerReason?: string };
export type CapturePackageData = { namespace: string; odometer?: OdometerReading; video360?: LocalVideo360 };
export function videoAccepted(video?: LocalVideo360) {
  return Boolean(video?.accepted?.blob.size && Number.isFinite(video.accepted.durationSeconds) && video.accepted.durationSeconds > 0 && ["local", "queued", "uploading", "processing", "uploaded", "verified"].includes(video.state));
}
export function capturePackageProgress(template: PhotographyTemplate, photos: readonly LocalPhoto[], data?: CapturePackageData) {
  const images = photographyProgress(template, photos);
  const odometer = !template.captureRequirements?.odometerRequirementId || odometerReadingSchema.safeParse(data?.odometer).success;
  const video = !template.captureRequirements?.video360Required || videoAccepted(data?.video360);
  return { images, odometer, video, complete: images.complete && odometer && video };
}
export function nextCaptureTask(inspectionId: string, template: PhotographyTemplate, photos: readonly LocalPhoto[], data?: CapturePackageData) {
  const progress = capturePackageProgress(template, photos, data);
  if (!progress.images.complete) return { kind: "photos" as const, href: inspectionRoutes.capture(inspectionId), label: "ادامه عکاسی" };
  if (!progress.odometer && template.captureRequirements?.odometerRequirementId) return { kind: "odometer" as const, href: inspectionRoutes.photo(inspectionId, template.captureRequirements.odometerRequirementId, "review"), label: "ثبت کیلومتر فعلی" };
  if (!progress.video) return { kind: "video" as const, href: inspectionRoutes.video(inspectionId, data?.video360?.draft ? "review" : "record"), label: "ادامه به ویدیوی ۳۶۰ درجه" };
  return { kind: "review" as const, href: inspectionRoutes.photographyReview(inspectionId), label: "بررسی و ارسال" };
}
