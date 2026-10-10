import type { InspectionSummary, SubmissionReceipt, SubmissionRecord } from "./submission-model";
import { isSubmitted } from "./submission-model";
import { indexedDBSubmissionRepository, readSubmissionSettings, type SubmissionRepository, type SubmissionMockSettings } from "./submission-repository";

export const submissionFailureText = "ارسال بازدید انجام نشد. لطفاً دوباره تلاش کنید.";
export interface SubmissionTransport { submit(record: SubmissionRecord, signal: AbortSignal): Promise<SubmissionReceipt> }
const wait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  const cancel = () => { clearTimeout(timer); signal.removeEventListener("abort", cancel); reject(new DOMException("Cancelled", "AbortError")); };
  const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, ms);
  if (signal.aborted) cancel(); else signal.addEventListener("abort", cancel, { once: true });
});
export function createMockSubmissionTransport(repository: SubmissionRepository = indexedDBSubmissionRepository, settings: () => Promise<SubmissionMockSettings> = readSubmissionSettings): SubmissionTransport {
  return { async submit(record, signal) {
    const previous = await repository.acknowledgement(record.idempotencyKey); if (previous) return previous;
    const fixture = await settings(); await wait(Math.min(10_000, Math.max(0, fixture.delayMs ?? 650)), signal);
    if (fixture.failure === "always" || fixture.failure === "once" && record.attemptCount === 1) throw new Error(submissionFailureText);
    const receipt = await repository.acknowledge(record.idempotencyKey, { reference: record.summary!.reference, submittedAt: fixture.submittedAt ?? new Date().toISOString(), status: "queued-for-review", estimatedReviewMinutes: 120 });
    if (fixture.failure === "uncertain-once" && record.attemptCount === 1) throw new Error(submissionFailureText);
    return receipt;
  } };
}
export function createSubmissionService(repository: SubmissionRepository, transport: SubmissionTransport, now = Date.now) {
  return {
    async submit(id: string, loadSummary: () => Promise<InspectionSummary>, online: () => boolean, signal: AbortSignal) {
      const previous = await repository.get(id); if (isSubmitted(previous)) return previous!;
      if (!online()) throw new Error("برای ارسال نهایی، اتصال اینترنت را برقرار کنید.");
      const summary = await loadSummary();
      if (!summary.readiness.canSubmit) throw new Error("نیازمندی‌های بازدید یا ارسال فایل‌ها هنوز کامل نیست.");
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const owner = Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-");
      const claim = await repository.claim(id, summary, owner, now()); if (!claim.claimed) return claim.record;
      try {
        const receipt = await transport.submit(claim.record, signal);
        // An acknowledgement is definitive even if connectivity changes after the response.
        return await repository.finish(id, owner, receipt);
      } catch (error) {
        await repository.fail(id, owner, submissionFailureText);
        throw error instanceof DOMException && error.name === "AbortError" ? error : new Error(submissionFailureText);
      }
    },
    async recover(id: string) {
      const record = await repository.get(id);
      if (record && !isSubmitted(record)) {
        const receipt = await repository.acknowledgement(record.idempotencyKey);
        if (receipt && record.owner) return repository.finish(id, record.owner, receipt);
        if (receipt) { const recoveryOwner = "receipt-recovery"; const claim = await repository.claim(id, record.summary!, recoveryOwner, now()); if (claim.claimed) return repository.finish(id, recoveryOwner, receipt); }
        if (record.status === "submitting" && (record.leaseUntil ?? 0) <= now() && record.owner) { await repository.fail(id, record.owner, submissionFailureText); return repository.get(id); }
      }
      return record;
    },
  };
}
export const submissionService = createSubmissionService(indexedDBSubmissionRepository, createMockSubmissionTransport());
