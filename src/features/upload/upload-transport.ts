import type { UploadJob, VerificationStatus } from "./upload-model";

/** Future API adapter owns registration/idempotency, signed URL, binary transfer and completion. */
export interface UploadTransport {
  upload(job: UploadJob, blob: Blob, onProgress: (bytes: number) => Promise<void>, signal: AbortSignal): Promise<{ evidenceId: string; verification: VerificationStatus }>;
  check(job: UploadJob, signal: AbortSignal): Promise<{ verification: VerificationStatus; reviewerReason?: string }>;
}
