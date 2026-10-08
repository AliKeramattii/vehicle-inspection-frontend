import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { acceptedMedia, requiredMediaCount, uploadDatabase, uploadLabel, uploadProgress, type MediaReference, type UploadJob } from "@/features/upload/upload-model";
import { indexedDBUploadQueue as queue } from "@/features/upload/queue-repository";
import { UploadCoordinator } from "@/features/upload/upload-coordinator";
import { createMockUploadTransport } from "@/features/upload/mock-upload-transport";
import { automaticRetry, retryDelay, UploadFailure } from "@/features/upload/retry-policy";
import { UploadProgress } from "@/features/upload/upload-progress";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import type { UploadTransport } from "@/features/upload/upload-transport";

const media = (id = "front", kind: "photo" | "video-360" = "photo"): MediaReference => ({ inspectionId: "inspection", namespace: "namespace", evidenceKind: kind, requirementId: kind === "photo" ? id : undefined, title: id, localBlobKey: id, revision: "one", mimeType: kind === "photo" ? "image/jpeg" : "video/webm", byteSize: 100, capturedAt: "now", required: true });
const blob = new Blob([new Uint8Array(100)], { type: "image/jpeg" });
const source = { read: vi.fn(async () => blob), isCurrent: vi.fn(async () => true) };
const coordinators: UploadCoordinator[] = [];
const coordinator = (transport: UploadTransport = createMockUploadTransport(async () => ({ stepMs: 10, processingMs: 10 }))) => { const value = new UploadCoordinator(queue, source, transport, `owner-${coordinators.length}`); coordinators.push(value); return value; };
const flush = async () => { for (let i = 0; i < 50; i++) await Promise.resolve(); };

/** Transactional metadata-only fixture; concurrent callbacks serialize their read/commit. */
function databaseFixture() {
  let rows = new Map<string, UploadJob>(), fail = false;
  const close = vi.fn();
  const db = { close, transaction() {
    let working: Map<string, UploadJob>, aborted = false;
    const tx = { oncomplete: undefined as (() => void) | undefined, onerror: undefined, onabort: undefined as (() => void) | undefined,
      abort() { aborted = true; queueMicrotask(() => tx.onabort?.()); }, objectStore() { return {
        getAll() { const request = { result: [] as UploadJob[], onsuccess: undefined as (() => void) | undefined }; queueMicrotask(() => {
          working = new Map([...rows].map(([id, row]) => [id, { ...row }])); request.result = [...working.values()]; request.onsuccess?.();
          if (!aborted) { rows = working; tx.oncomplete?.(); }
        }); return request; },
        put(row: UploadJob) { if (fail) throw new DOMException("quota", "QuotaExceededError"); working.set(row.id, { ...row }); },
      }; } };
    return tx;
  } };
  vi.stubGlobal("indexedDB", { open() { const request = { result: db, onsuccess: undefined as (() => void) | undefined }; queueMicrotask(() => request.onsuccess?.()); return request; } });
  return { rows: () => [...rows.values()], close, fail: (value: boolean) => { fail = value; } };
}
beforeEach(() => { vi.useFakeTimers(); source.read.mockReset().mockResolvedValue(blob); source.isCurrent.mockReset().mockResolvedValue(true); databaseFixture(); });
afterEach(async () => { for (const value of coordinators) await value.stop(); await flush(); coordinators.length = 0; vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("durable queue metadata", () => {
  it("persists photo/video references without duplicating Blobs and reopens the same stable jobs", async () => {
    await queue.reconcile("namespace", [media(), media("video", "video-360")]); const first = await queue.list();
    await queue.reconcile("namespace", [media(), media("video", "video-360")]);
    expect(await queue.list()).toEqual(first); expect(first.map((job) => job.evidenceKind)).toEqual(["photo", "video-360"]);
    expect(first[0].localBlobKey).toBe("front"); expect(first[0]).not.toHaveProperty("blob"); expect(uploadDatabase.name).toBe("inspection-upload-queue");
  });
  it("atomically claims at most two jobs across coordinators/tabs", async () => {
    await queue.reconcile("namespace", [media("a"), media("b"), media("c")]);
    const claims = await Promise.all([queue.claim("one", Date.now()), queue.claim("two", Date.now()), queue.claim("three", Date.now())]);
    expect(claims.filter(Boolean)).toHaveLength(2); expect(new Set(claims.filter(Boolean).map((job) => job!.id)).size).toBe(2);
  });
  it("recovers an expired interrupted lease without creating a new job", async () => {
    await queue.reconcile("namespace", [media()]); const first = await queue.claim("old-tab", 0);
    const resumed = await queue.claim("new-tab", 20_001); expect(resumed?.id).toBe(first?.id); expect(resumed?.attemptCount).toBe(2);
  });
  it("invalidates stale replacement jobs and rejects late callbacks, retaining successful history", async () => {
    await queue.reconcile("namespace", [media()]); const original = (await queue.claim("old", Date.now()))!;
    await queue.reconcile("namespace", [{ ...media(), revision: "two" }]);
    expect(await queue.update(original.id, "old", { upload: "uploaded" })).toBe(false);
    expect((await queue.list()).find((job) => job.id === original.id)).toMatchObject({ current: false, upload: "cancelled" });
    const replacement = (await queue.claim("new", Date.now()))!; await queue.update(replacement.id, "new", { upload: "uploaded", owner: undefined });
    await queue.reconcile("namespace", [{ ...media(), revision: "three" }]);
    expect((await queue.list()).find((job) => job.id === replacement.id)).toMatchObject({ current: false, upload: "uploaded" });
  });
  it("surfaces persistence failure without overwriting durable metadata", async () => {
    const db = databaseFixture(); await queue.reconcile("namespace", [media()]); db.fail(true);
    await expect(queue.claim("owner", Date.now())).rejects.toThrow("ذخیره صف"); expect(db.rows()[0].upload).toBe("queued"); expect(db.close).toHaveBeenCalled(); db.fail(false);
  });
});
describe("scheduling and recovery", () => {
  it("starts at app initialization and enforces bounded photo/video transport concurrency", async () => {
    await queue.reconcile("namespace", [media("a"), media("b"), media("video", "video-360")]);
    const transport = createMockUploadTransport(async () => ({ stepMs: 100, processingMs: 100 })), upload = vi.spyOn(transport, "upload");
    coordinator(transport).start(true); await flush(); expect(upload).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(410); await flush(); expect(upload).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(4000); expect((await queue.list()).every((job) => job.upload === "uploaded" && job.verification === "verified")).toBe(true);
  });
  it("queues offline, resumes online and aborts an interrupted transfer safely", async () => {
    await queue.reconcile("namespace", [media()]); const value = coordinator(); value.start(false); await flush(); expect(source.read).not.toHaveBeenCalled();
    value.setOnline(true); await flush(); expect(source.read).toHaveBeenCalledTimes(1);
    value.setOnline(false); await flush(); expect((await queue.list())[0]).toMatchObject({ upload: "queued", bytesUploaded: 0, owner: undefined });
    value.setOnline(true); await vi.advanceTimersByTimeAsync(4000); expect((await queue.list())[0].verification).toBe("verified");
  });
  it("retries a transient failure after backoff, then succeeds with stable evidence identity", async () => {
    await queue.reconcile("namespace", [media()]); const value = coordinator(createMockUploadTransport(async () => ({ stepMs: 10, processingMs: 10, failures: { front: "once" } }))); value.start(true);
    await vi.advanceTimersByTimeAsync(30); const failed = (await queue.list())[0]; expect(failed).toMatchObject({ upload: "queued", attemptCount: 1 }); expect(failed.nextRetryAt).toBeGreaterThan(Date.now());
    await vi.advanceTimersByTimeAsync(5000); expect((await queue.list())[0]).toMatchObject({ upload: "uploaded", attemptCount: 2, remoteEvidenceId: `mock:${failed.id}` });
  });
  it("caps automatic attempts and safely resets failed items through manual retry-all", async () => {
    await queue.reconcile("namespace", [media("a"), media("b")]); let failures = true;
    const value = coordinator(createMockUploadTransport(async () => ({ stepMs: 1, processingMs: 1, failures: failures ? { a: "always", b: "always" } : undefined }))); value.start(true);
    await vi.advanceTimersByTimeAsync(10_000); const jobs = await queue.list(); expect(jobs.every((job) => job.upload === "failed" && job.attemptCount === 3)).toBe(true);
    failures = false; await value.retry(jobs.map((job) => job.id)); await vi.advanceTimersByTimeAsync(4000); expect((await queue.list()).every((job) => job.verification === "verified")).toBe(true);
  });
  it("does not automatically or manually requeue non-retryable failures", async () => {
    await queue.reconcile("namespace", [media()]); coordinator(createMockUploadTransport(async () => ({ stepMs: 1, failures: { front: "terminal" } }))).start(true);
    await vi.advanceTimersByTimeAsync(5000); const job = (await queue.list())[0]; expect(job).toMatchObject({ upload: "failed", retryable: false, attemptCount: 1 });
    await queue.retry([job.id]); expect((await queue.list())[0].upload).toBe("failed");
  });
  it("keeps other jobs working when one durable Blob cannot be read", async () => {
    await queue.reconcile("namespace", [media("a"), media("b")]); source.read.mockRejectedValueOnce(new UploadFailure("فایل پیدا نشد", false));
    coordinator().start(true); await vi.advanceTimersByTimeAsync(4000);
    expect((await queue.list()).map((job) => job.upload)).toEqual(["failed", "uploaded"]);
  });
  it("does not publish a superseded revision during transfer", async () => {
    await queue.reconcile("namespace", [media()]); const value = coordinator(); value.start(true); await flush(); source.isCurrent.mockResolvedValue(false);
    await vi.advanceTimersByTimeAsync(100); expect((await queue.list())[0]).toMatchObject({ current: false, upload: "cancelled" });
  });
  it("stops timers/transports and releases leases on app exit", async () => {
    await queue.reconcile("namespace", [media()]); const value = coordinator(); value.start(true); await flush(); await value.stop(); await flush();
    expect((await queue.list())[0]).toMatchObject({ upload: "queued", owner: undefined }); expect(vi.getTimerCount()).toBe(0);
  });
  it("supports strict-mode remount/restore without an old cleanup releasing new claims", async () => {
    await queue.reconcile("namespace", [media()]); const value = coordinator(); value.start(true); await flush();
    const stopping = value.stop(); value.start(true); await stopping; await vi.advanceTimersByTimeAsync(4000);
    expect((await queue.list())[0]).toMatchObject({ upload: "uploaded", verification: "verified" });
  });
  it("retains uploaded credit while processing status polling fails", async () => {
    await queue.reconcile("namespace", [media()]); const transport = createMockUploadTransport(async () => ({ stepMs: 1 })); transport.check = vi.fn(async () => { throw new Error("network"); });
    coordinator(transport).start(true); await vi.advanceTimersByTimeAsync(2000); expect((await queue.list())[0]).toMatchObject({ upload: "uploaded", verification: "processing" }); expect(uploadProgress(await queue.list(), 1).uploaded).toBe(1);
  });
});
describe("package progress semantics", () => {
  it("derives twelve photos plus one video, excluding odometer data", async () => {
    expect(requiredMediaCount(template)).toBe(13); expect(requiredMediaCount({ ...template, captureRequirements: { video360Required: false } })).toBe(12);
    const photo = { key: "photo", namespace: "namespace", requirementId: template.sections[0].photoRequirements[0].id, status: "captured" as const, capturedAt: "now", blob };
    expect(acceptedMedia("inspection", "namespace", template, [photo], { namespace: "namespace", odometer: { kilometers: 48320 } })).toHaveLength(1);
  });
  it("counts binary upload while keeping processing, verification and retake distinct", async () => {
    await queue.reconcile("namespace", [media()]); const job = (await queue.claim("owner", Date.now()))!; await queue.update(job.id, "owner", { upload: "uploaded", verification: "processing" });
    const saved = (await queue.list())[0]; expect(uploadProgress([saved], 1)).toMatchObject({ uploaded: 1, complete: true }); expect(uploadLabel(saved)).toBe("در حال پردازش");
    expect(uploadLabel({ ...saved, verification: "verified" })).toBe("تأیید شد"); expect(uploadProgress([{ ...saved, verification: "retake-requested" }], 1).complete).toBe(false);
    expect(uploadProgress([{ ...saved, current: false }], 1).uploaded).toBe(0);
  });
  it("exposes accessible overall progress without a fake combined capture denominator", async () => {
    await queue.reconcile("namespace", [media(), media("video", "video-360")]); render(<UploadProgress jobs={await queue.list()} expected={13} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "13"); expect(screen.getByText("۱ تصویر • ۱ ویدیوی ۳۶۰ درجه")).toBeInTheDocument();
  });
  it("uses restrained capped exponential retry and a finite automatic budget", () => { expect([1, 2, 3, 12].map(retryDelay)).toEqual([1000, 2000, 4000, 30000]); expect(automaticRetry(3, true)).toBe(false); expect(automaticRetry(1, false)).toBe(false); });
});
