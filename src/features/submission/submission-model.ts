import type { Inspection } from "@/types/domain";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { readUploadPackage } from "@/features/upload/upload-package";
import { requiredMediaCount, uploadJobId, uploadProgress, type UploadJob } from "@/features/upload/upload-model";

export type SubmissionStatus = "not-submitted" | "submitting" | "submitted" | "queued-for-review" | "needs-more-evidence" | "review-complete" | "submit-failed";
export type CaptureSummary = Awaited<ReturnType<typeof readUploadPackage>>;
export type SubmissionReadiness = {
  captureComplete: boolean; requiredMediaUploaded: boolean; odometerValid: boolean;
  blockingUploadFailures: boolean; factsConfirmed: boolean; canSubmit: boolean;
};
export type InspectionSummary = {
  inspection: Inspection; reference: string; namespace: string; odometerRequirementId?: string;
  capture: CaptureSummary["capture"]; odometer: CaptureSummary["odometer"]; videoDurationSeconds?: number;
  jobs: UploadJob[]; upload: ReturnType<typeof uploadProgress>; processingCount: number;
  readiness: SubmissionReadiness;
};
/** Existing capture and upload helpers own the rules; stale revisions never satisfy readiness. */
export function deriveInspectionSummary(inspection: Inspection, reference: string, template: PhotographyTemplate, capture: CaptureSummary, allJobs: readonly UploadJob[]): InspectionSummary {
  const current = new Map(allJobs.filter((job) => job.current).map((job) => [job.id, job]));
  const jobs = capture.media.map((media) => current.get(uploadJobId(media))).filter((job) => job !== undefined);
  const upload = uploadProgress(jobs, requiredMediaCount(template));
  const factsConfirmed = Boolean(inspection.location && inspection.vehicle);
  const readiness = { captureComplete: capture.capture.complete, requiredMediaUploaded: upload.complete,
    odometerValid: capture.capture.odometer, blockingUploadFailures: upload.failed > 0, factsConfirmed,
    canSubmit: capture.capture.complete && upload.complete && factsConfirmed };
  return { inspection, reference, namespace: capture.media[0]?.namespace ?? "", odometerRequirementId: template.captureRequirements?.odometerRequirementId,
    capture: capture.capture, odometer: capture.odometer, videoDurationSeconds: capture.videoDurationSeconds,
    jobs, upload, processingCount: jobs.filter((job) => job.upload === "uploaded" && job.verification === "processing").length, readiness };
}
export type SubmissionReceipt = { reference: string; submittedAt: string; status: "queued-for-review"; estimatedReviewMinutes: number };
/** Metadata only: no Blobs, object URLs or authentication credentials. */
export type SubmissionRecord = {
  inspectionId: string; idempotencyKey: string; status: SubmissionStatus; attemptCount: number;
  summary?: InspectionSummary; receipt?: SubmissionReceipt; owner?: string; leaseUntil?: number; lastError?: string;
};
export const isSubmitted = (record?: SubmissionRecord) => Boolean(record?.receipt);
// Future needs-more-evidence must explicitly authorize its own scoped edits; no implicit unlock here.
export const isEditLocked = (record?: SubmissionRecord) => Boolean(record && (record.status === "submitting" || isSubmitted(record)));
export const submissionDatabase = { name: "inspection-submissions", version: 1, records: "records", receipts: "mock-receipts", settings: "mock-settings" } as const;
export const submissionLeaseMs = 30_000;
