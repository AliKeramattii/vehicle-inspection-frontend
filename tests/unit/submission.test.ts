import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deriveInspectionSummary, isEditLocked, submissionDatabase, type CaptureSummary, type SubmissionRecord } from "@/features/submission/submission-model";
import { indexedDBSubmissionRepository as repository } from "@/features/submission/submission-repository";
import { createSubmissionService, createMockSubmissionTransport } from "@/features/submission/submission-service";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { capturePackageProgress } from "@/features/capture-package/capture-package-model";
import { acceptedMedia, uploadJobId, type UploadJob } from "@/features/upload/upload-model";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { adaptInspection } from "@/lib/api/adapters/inspection";
import { inspectionFixture } from "@/mocks/fixtures";
import { developmentLocationAdapter } from "@/lib/map/location-adapter";
import { assertInspectionEditable, assertCaptureEditable } from "@/features/submission/edit-policy";

function input() {
  const inspection = adaptInspection(structuredClone(inspectionFixture)); inspection.location = developmentLocationAdapter.initialLocation;
  const photos: LocalPhoto[] = template.sections.flatMap((section) => section.photoRequirements).map((photo) => ({ key: photo.id, namespace: "namespace", requirementId: photo.id, blob: new Blob(["photo"], { type: "image/webp" }), capturedAt: "2026-10-08T00:00:00Z", status: "captured" }));
  const data = { namespace: "namespace", odometer: { kilometers: 48320 }, video360: { state: "local" as const, accepted: { blob: new Blob(["video"], { type: "video/webm" }), durationSeconds: 28, metadata: { kind: "video-360" as const, localBlobKey: "video", sizeBytes: 5, mimeType: "video/webm", capturedAt: "2026-10-08T00:00:00Z" } } } };
  const media = acceptedMedia(inspection.id, "namespace", template, photos, data);
  const capture: CaptureSummary = { media, odometer: data.odometer, videoDurationSeconds: 28, capture: capturePackageProgress(template, photos, data) };
  const jobs: UploadJob[] = media.map((item) => ({ ...item, id: uploadJobId(item), current: true, upload: "uploaded", verification: "not-started", attemptCount: 1, bytesUploaded: item.byteSize }));
  return { inspection, photos, data, capture, jobs };
}
const summary = () => { const value = input(); return deriveInspectionSummary(value.inspection, "BDI-8F31K2", template, value.capture, value.jobs); };

/** Serialized IDB transaction fixture: key-path records and keyed mock acknowledgements. */
function databaseFixture() {
  const stores = new Map<string, Map<string, unknown>>(); let tail = Promise.resolve(), quota = false;
  const close = vi.fn();
  const db = { close, transaction(name: string, mode: string) {
    const rows = stores.get(name) ?? new Map<string, unknown>(); stores.set(name, rows);
    let release!: () => void; const previous = tail; tail = new Promise<void>((resolve) => { release = resolve; });
    let aborted = false;
    const tx = { oncomplete: undefined as (() => void) | undefined, onerror: undefined as (() => void) | undefined, onabort: undefined as (() => void) | undefined,
      abort() { aborted = true; }, objectStore() { return {
        get(key: string) { const request = { result: undefined as unknown, onsuccess: undefined as (() => void) | undefined };
          void previous.then(() => { request.result = structuredClone(rows.get(key)); try { request.onsuccess?.(); } catch { aborted = true; } if (aborted) tx.onabort?.(); else tx.oncomplete?.(); release(); }); return request; },
        put(value: unknown, key?: string) { if (quota || mode !== "readwrite") throw new DOMException("quota", "QuotaExceededError"); rows.set(key ?? (value as SubmissionRecord).inspectionId, structuredClone(value)); },
      }; } };
    return tx;
  } };
  vi.stubGlobal("BroadcastChannel", undefined);
  vi.stubGlobal("indexedDB", { open() { const request = { result: db, onsuccess: undefined as (() => void) | undefined }; queueMicrotask(() => request.onsuccess?.()); return request; } });
  return { close, quota: () => { quota = true; }, stores };
}
beforeEach(() => { vi.useFakeTimers(); databaseFixture(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("authoritative submission readiness", () => {
  it("derives twelve photos, separate numeric odometer/video and thirteen current media files", () => {
    const value = summary(); expect(value.readiness.canSubmit).toBe(true); expect(value.capture.images.total).toBe(12); expect(value.upload.total).toBe(13); expect(value.odometer?.kilometers).toBe(48320); expect(value.jobs.filter((job) => job.evidenceKind === "photo")).toHaveLength(12); expect(value.inspection.location?.formattedAddress).toBe(developmentLocationAdapter.initialLocation.formattedAddress);
  });
  for (const missing of ["photo", "odometer", "video"] as const) it(`blocks missing ${missing} by reusing capture-package semantics`, () => {
    const value = input(); if (missing === "photo") value.photos.pop(); if (missing === "odometer") Reflect.deleteProperty(value.data, "odometer"); if (missing === "video") Reflect.deleteProperty(value.data, "video360");
    value.capture.capture = capturePackageProgress(template, value.photos, value.data);
    expect(deriveInspectionSummary(value.inspection, "BDI-8F31K2", template, value.capture, value.jobs).readiness.canSubmit).toBe(false);
  });
  for (const state of ["local", "queued", "uploading", "failed"] as const) it(`blocks ${state} media`, () => {
    const value = input(); value.jobs[0].upload = state;
    const result = deriveInspectionSummary(value.inspection, "ref", template, value.capture, value.jobs);
    expect(result.readiness.canSubmit).toBe(false); expect(result.readiness.blockingUploadFailures).toBe(state === "failed");
  });
  for (const state of ["not-started", "processing", "verified"] as const) it(`accepts binary-upload-complete ${state} without pretending verified`, () => {
    const value = input(); value.jobs.forEach((job) => { job.verification = state; }); const result = deriveInspectionSummary(value.inspection, "ref", template, value.capture, value.jobs);
    expect(result.readiness.canSubmit).toBe(true); expect(result.processingCount).toBe(state === "processing" ? 13 : 0);
  });
  it("rejects stale replacement upload and reviewer retake without changing the file denominator", () => {
    const value = input(); value.jobs[0].id = "old-revision"; expect(deriveInspectionSummary(value.inspection, "ref", template, value.capture, value.jobs).upload.complete).toBe(false);
    const next = input(); next.jobs[0].verification = "retake-requested"; expect(deriveInspectionSummary(next.inspection, "ref", template, next.capture, next.jobs).readiness.canSubmit).toBe(false);
  });
});
describe("durable submission and idempotency", () => {
  it("locks location/vehicle/photo/odometer/video mutations while submitting and after receipt", async () => {
    await repository.claim("insp_demo", summary(), "owner", Date.now());
    await expect(assertInspectionEditable("insp_demo")).rejects.toThrow("ویرایش"); await expect(assertCaptureEditable(JSON.stringify(["insp_demo", "template", 1]))).rejects.toThrow("ویرایش");
    await repository.finish("insp_demo", "owner", { reference: "BDI-8F31K2", status: "queued-for-review", submittedAt: "2026-10-08T00:00:00Z", estimatedReviewMinutes: 120 });
    await expect(assertInspectionEditable("insp_demo")).rejects.toThrow("ویرایش");
  });
  it("serializes double activation/cross-tab claims with one stable key and metadata only", async () => {
    const claims = await Promise.all([repository.claim("insp_demo", summary(), "a", 0), repository.claim("insp_demo", summary(), "b", 0)]);
    expect(claims.filter((value) => value.claimed)).toHaveLength(1); expect(claims[0].record.idempotencyKey).toBe(claims[1].record.idempotencyKey); expect((await repository.get("insp_demo"))?.attemptCount).toBe(1); expect(JSON.stringify(await repository.get("insp_demo"))).not.toContain('"blob"');
  });
  it("persists successful receipt, recovers after restart and never calls transport again", async () => {
    const transport = createMockSubmissionTransport(repository, async () => ({ delayMs: 0 })), submit = vi.spyOn(transport, "submit"), service = createSubmissionService(repository, transport);
    const promise = service.submit("insp_demo", async () => summary(), () => true, new AbortController().signal); await vi.runAllTimersAsync(); const first = await promise;
    expect(first.receipt?.reference).toBe("BDI-8F31K2"); expect(await service.recover("insp_demo")).toEqual(first);
    expect(await service.submit("insp_demo", async () => { throw new Error("Must not reread capture"); }, () => false, new AbortController().signal)).toEqual(first); expect(submit).toHaveBeenCalledTimes(1); expect(isEditLocked(first)).toBe(true);
  });
  it("retries failure with the same key while preserving uploaded summary metadata", async () => {
    const service = createSubmissionService(repository, createMockSubmissionTransport(repository, async () => ({ delayMs: 0, failure: "once" })));
    const failure = service.submit("insp_demo", async () => summary(), () => true, new AbortController().signal); const rejected = expect(failure).rejects.toThrow("ارسال بازدید"); await vi.runAllTimersAsync(); await rejected;
    const before = (await repository.get("insp_demo"))!; expect(before.status).toBe("submit-failed"); expect(before.summary?.upload.uploaded).toBe(13); expect(isEditLocked(before)).toBe(false);
    const retry = service.submit("insp_demo", async () => summary(), () => true, new AbortController().signal); await vi.runAllTimersAsync(); const result = await retry; expect(result.idempotencyKey).toBe(before.idempotencyKey); expect(result.attemptCount).toBe(2); expect(result.receipt).toBeDefined();
  });
  it("recovers an uncertain acknowledged response without a duplicate submission", async () => {
    const service = createSubmissionService(repository, createMockSubmissionTransport(repository, async () => ({ delayMs: 0, failure: "uncertain-once" })));
    const failure = service.submit("insp_demo", async () => summary(), () => true, new AbortController().signal); const rejected = expect(failure).rejects.toThrow(); await vi.runAllTimersAsync(); await rejected;
    const key = (await repository.get("insp_demo"))!.idempotencyKey; const recovered = await service.recover("insp_demo"); expect(recovered?.idempotencyKey).toBe(key); expect(recovered?.receipt).toEqual(await repository.acknowledgement(key));
  });
  it("blocks offline and invalid readiness before claiming or changing evidence", async () => {
    const transport = { submit: vi.fn() }, service = createSubmissionService(repository, transport);
    await expect(service.submit("insp_demo", async () => summary(), () => false, new AbortController().signal)).rejects.toThrow("اینترنت");
    const invalid = summary(); invalid.readiness.canSubmit = false;
    await expect(service.submit("insp_demo", async () => invalid, () => true, new AbortController().signal)).rejects.toThrow("کامل نیست"); expect(await repository.get("insp_demo")).toBeUndefined(); expect(transport.submit).not.toHaveBeenCalled();
  });
  it("cleans up aborted timers, releases the claim, and reuses identity after route exit", async () => {
    const service = createSubmissionService(repository, createMockSubmissionTransport(repository, async () => ({ delayMs: 5000 }))), controller = new AbortController();
    const promise = service.submit("insp_demo", async () => summary(), () => true, controller.signal); const rejected = expect(promise).rejects.toThrow(); await vi.advanceTimersByTimeAsync(1); controller.abort(); await rejected; expect(vi.getTimerCount()).toBe(0); expect((await repository.get("insp_demo"))?.status).toBe("submit-failed");
  });
  it("recovers an expired interrupted lease and retains its idempotency key", async () => {
    const initial = await repository.claim("insp_demo", summary(), "crashed", 0), service = createSubmissionService(repository, { submit: vi.fn() }, () => 30_001);
    expect((await service.recover("insp_demo"))?.status).toBe("submit-failed"); const next = await repository.claim("insp_demo", summary(), "retry", 30_001); expect(next.record.idempotencyKey).toBe(initial.record.idempotencyKey);
  });
  it("surfaces persistence failure and closes the database", async () => {
    const fixture = databaseFixture(); fixture.quota(); await expect(repository.claim("insp_demo", summary(), "a", 0)).rejects.toThrow(); expect(fixture.close).toHaveBeenCalled(); expect(submissionDatabase.records).toBe("records");
  });
});
