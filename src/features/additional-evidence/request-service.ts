import { indexedDBSubmissionRepository, type SubmissionRepository } from "@/features/submission/submission-repository";
import { indexedDBRequestRepository, readRequestSettings, type RequestRepository, type RequestMockSettings } from "./request-repository";
import { readRequestPackage, type RequestPackage } from "./request-source";
import { assertRequestScope, requestActive, type EvidenceRequest, type SupplementalReceipt } from "./request-model";

export const resubmitFailure = "ارسال مدارک تکمیلی انجام نشد. مدارک محفوظ هستند؛ دوباره تلاش کنید.";
export interface ResubmitTransport { submit(request: EvidenceRequest, reference: string, signal: AbortSignal): Promise<SupplementalReceipt> }
export function createMockResubmitTransport(repository: RequestRepository, settings: () => Promise<RequestMockSettings> = readRequestSettings): ResubmitTransport {
  return { async submit(request, reference, signal) {
    const previous = await repository.acknowledgement(request.idempotencyKey!); if (previous) return previous;
    const fixture = await settings();
    await new Promise<void>((resolve, reject) => { const cancel = () => { clearTimeout(timer); signal.removeEventListener("abort", cancel); reject(new DOMException("Cancelled", "AbortError")); }; const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, Math.min(10_000, Math.max(0, fixture.delayMs ?? 600))); if (signal.aborted) cancel(); else signal.addEventListener("abort", cancel, { once: true }); });
    if (fixture.failure === "always" || fixture.failure === "once" && request.attemptCount === 1) throw new Error(resubmitFailure);
    const receipt = await repository.acknowledge(request.idempotencyKey!, { reference, submittedAt: fixture.submittedAt ?? new Date().toISOString(), evidenceIds: request.candidateIds!, status: "queued-for-review" });
    if (fixture.failure === "uncertain-once" && request.attemptCount === 1) throw new Error(resubmitFailure);
    return receipt;
  } };
}
const secureKey = () => crypto.getRandomValues(new Uint32Array(4)).join("-");
export function createRequestService(repository: RequestRepository, submission: SubmissionRepository, transport: ResubmitTransport, loadPackage: (request: EvidenceRequest) => Promise<RequestPackage> = readRequestPackage, now = Date.now) {
  async function recover(id: string) {
    let request = await repository.get(id);
    if (!request || request.receipt) return request;
    if (request.mutationOwner && (request.mutationLeaseUntil ?? 0) <= now()) request = await repository.change(id, (current) => (current.mutationLeaseUntil ?? 0) <= now() ? { ...current, mutationOwner: undefined, mutationLeaseUntil: undefined } : current);
    const ack = request.idempotencyKey && await repository.acknowledgement(request.idempotencyKey);
    if (ack) { const key = request.idempotencyKey; return repository.change(id, (current) => current.idempotencyKey === key && JSON.stringify(current.candidateIds) === JSON.stringify(ack.evidenceIds) ? { ...current, status: "resubmitted", receipt: ack, owner: undefined, leaseUntil: undefined, lastError: undefined } : current); }
    if (request.status === "resubmitting" && (request.leaseUntil ?? 0) <= now()) return repository.change(id, (current) => current.status === "resubmitting" && (current.leaseUntil ?? 0) <= now() ? { ...current, status: "resubmit-failed", owner: undefined, leaseUntil: undefined, lastError: resubmitFailure } : current);
    return request;
  }
  return { recover,
    async authorize(scope: Parameters<typeof assertRequestScope>[2]) { const request = await recover(scope.requestId); const original = await submission.get(scope.inspectionId); return { request: request!, item: assertRequestScope(request, original, scope) }; },
    async mutate<T>(scope: Parameters<typeof assertRequestScope>[2], operation: (request: EvidenceRequest) => Promise<T>) {
      const original = await submission.get(scope.inspectionId); await recover(scope.requestId);
      const owner = secureKey();
      const request = await repository.change(scope.requestId, (current) => { assertRequestScope(current, original, scope); if (current.mutationOwner && (current.mutationLeaseUntil ?? 0) > now()) throw new Error("ذخیره مدرک دیگری در حال انجام است."); return { ...current, mutationOwner: owner, mutationLeaseUntil: now() + 20_000 }; });
      try { return await operation(request); }
      finally { await repository.change(request.id, (current) => current.mutationOwner === owner ? { ...current, mutationOwner: undefined, mutationLeaseUntil: undefined } : current); }
    },
    async submit(inspectionId: string, requestId: string, version: number, online: () => boolean, signal: AbortSignal) {
      const request = await recover(requestId), original = await submission.get(inspectionId);
      if (!request || request.inspectionId !== inspectionId || request.version !== version || !original?.receipt || original.summary?.namespace !== request.originalNamespace) throw new Error("درخواست معتبر نیست.");
      if (request.receipt || request.status === "resubmitting") return request;
      if (!online()) throw new Error("برای ارسال مدارک تکمیلی، اتصال اینترنت را برقرار کنید.");
      const source = await loadPackage(request);
      if (!source.readiness.canResubmit) throw new Error("ابتدا مدارک درخواستی را تأیید و فایل‌ها را ارسال کنید.");
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const candidateIds = source.readiness.itemJobs.map((job) => job!.id), owner = secureKey();
      const claim = await repository.change(requestId, (current) => {
        if (current.receipt || current.status === "resubmitting") return current;
        if (!requestActive(current) || current.version !== version || current.mutationOwner && (current.mutationLeaseUntil ?? 0) > now()) throw new Error("درخواست قابل ارسال نیست؛ ذخیره مدرک را کامل کنید.");
        const same = JSON.stringify(current.candidateIds) === JSON.stringify(candidateIds);
        return { ...current, status: "resubmitting", idempotencyKey: same ? current.idempotencyKey : `supplemental:${requestId}:${version}:${secureKey()}`, candidateIds, attemptCount: same ? current.attemptCount + 1 : 1, owner, leaseUntil: now() + 30_000, lastError: undefined };
      });
      if (claim.owner !== owner) return claim;
      try {
        // Scoped mutations are locked during transport. Re-read durable revisions after claiming.
        const current = await loadPackage(claim);
        if (JSON.stringify(current.readiness.itemJobs.map((job) => job?.id)) !== JSON.stringify(candidateIds) || current.readiness.uploaded !== current.readiness.total || current.readiness.drafts.length) throw new Error(resubmitFailure);
        const receipt = await transport.submit(claim, original.receipt.reference, signal);
        return await repository.change(requestId, (record) => record.owner === owner ? { ...record, status: "resubmitted", receipt, owner: undefined, leaseUntil: undefined, lastError: undefined } : record);
      } catch (error) {
        await repository.change(requestId, (record) => record.owner === owner && !record.receipt ? { ...record, status: "resubmit-failed", owner: undefined, leaseUntil: undefined, lastError: resubmitFailure } : record);
        throw error instanceof DOMException && error.name === "AbortError" ? error : new Error(resubmitFailure);
      }
    },
  };
}
export const requestService = createRequestService(indexedDBRequestRepository, indexedDBSubmissionRepository, createMockResubmitTransport(indexedDBRequestRepository));
