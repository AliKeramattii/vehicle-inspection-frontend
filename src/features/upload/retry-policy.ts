export const uploadConcurrency = 2;
export const uploadLeaseMs = 20_000;
export const retryDelay = (attempt: number) => Math.min(30_000, 1_000 * 2 ** Math.max(0, attempt - 1));
export const automaticRetry = (attempt: number, retryable: boolean) => retryable && attempt < 3;
export class UploadFailure extends Error {
  constructor(message: string, readonly retryable = true) { super(message); this.name = "UploadFailure"; }
}
