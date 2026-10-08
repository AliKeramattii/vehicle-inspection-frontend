import { afterEach, expect, it, vi } from "vitest";
import { durableUploadMedia } from "@/features/upload/media-source";
import { videoAccepted } from "@/features/capture-package/capture-package-model";
import type { UploadJob } from "@/features/upload/upload-model";
const stores = vi.hoisted(() => ({ photo: vi.fn(), package: vi.fn() }));
vi.mock("@/lib/media/photo-store", async (original) => ({ ...await original<typeof import("@/lib/media/photo-store")>(), readPhoto: stores.photo }));
vi.mock("@/lib/media/capture-data-store", () => ({ indexedDBCaptureDataStore: { get: stores.package } }));
const job: UploadJob = { id: "photo", namespace: "namespace", inspectionId: "inspection", evidenceKind: "photo", title: "عکس", localBlobKey: "key", revision: "revision", mimeType: "image/jpeg", byteSize: 3, capturedAt: "now", required: true, current: true, upload: "queued", verification: "not-started", bytesUploaded: 0, attemptCount: 0 };
afterEach(() => vi.clearAllMocks());
it("looks up a single photo Blob by durable key and validates its accepted revision", async () => {
  const blob = new Blob(["one"], { type: "image/jpeg" }); stores.photo.mockResolvedValue({ blob, revisionId: "revision", status: "captured" });
  expect(await durableUploadMedia.read(job)).toBe(blob); expect(stores.photo).toHaveBeenCalledWith("key");
  stores.photo.mockResolvedValue({ blob, revisionId: "replaced", status: "captured" }); expect(await durableUploadMedia.isCurrent(job)).toBe(false); await expect(durableUploadMedia.read(job)).rejects.toThrow("جایگزین");
});
it("rejects missing or mismatched Blobs rather than marking a transfer complete", async () => {
  stores.photo.mockResolvedValue(undefined); await expect(durableUploadMedia.read(job)).rejects.toThrow("پیدا نشد");
  stores.photo.mockResolvedValue({ blob: new Blob(["different"], { type: "image/jpeg" }), revisionId: "revision", status: "captured" }); await expect(durableUploadMedia.read(job)).rejects.toThrow("تطبیق");
});
it("uses accepted video rather than its replacement draft, and detects a superseded video key", async () => {
  const accepted = new Blob(["one"], { type: "video/webm" }), draft = new Blob(["new"], { type: "video/webm" });
  const video = { state: "local", accepted: { blob: accepted, metadata: { localBlobKey: "revision" } }, draft: { blob: draft, metadata: { localBlobKey: "draft" } } };
  stores.package.mockResolvedValue({ video360: video }); const ref = { ...job, evidenceKind: "video-360" as const, mimeType: "video/webm" };
  expect(await durableUploadMedia.read(ref)).toBe(accepted); expect(stores.photo).not.toHaveBeenCalled();
  stores.package.mockResolvedValue({ video360: { ...video, accepted: { ...video.accepted, metadata: { localBlobKey: "new-revision" } } } }); expect(await durableUploadMedia.isCurrent(ref)).toBe(false);
});
it("accepted local video credit survives an upload failure, but explicit retake still blocks readiness", () => {
  const accepted = { blob: new Blob(["one"], { type: "video/webm" }), durationSeconds: 28, metadata: { kind: "video-360" as const, localBlobKey: "key", mimeType: "video/webm", sizeBytes: 3, capturedAt: "now" } };
  expect(videoAccepted({ accepted, state: "failed" })).toBe(true); expect(videoAccepted({ accepted, state: "retakeRequired" })).toBe(false);
});
