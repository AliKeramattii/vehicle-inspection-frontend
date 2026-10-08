import { expect, type Page } from "@playwright/test";
import { packageWorkflow, openPackageReview } from "./capture-package-helpers";
import { inspectionPhotographyTemplate as template } from "../../src/features/photography/inspection-template";
import { photoDatabase, photoNamespace } from "../../src/lib/media/photo-store";
import { captureDatabase } from "../../src/lib/media/capture-data-store";
import { uploadDatabase, type UploadJob } from "../../src/features/upload/upload-model";
export type UploadFixture = "queued" | "mixed" | "offline" | "uploading" | "failed" | "processing" | "complete" | "verified";

export async function setOnline(page: Page, online: boolean) {
  await page.evaluate((online) => { Object.defineProperty(navigator, "onLine", { configurable: true, get: () => online }); window.dispatchEvent(new Event(online ? "online" : "offline")); }, online);
}
export async function seedQueue(page: Page, state: UploadFixture, live = false) {
  await page.evaluate(async ({ photos, capture, queue, namespace, requirements, state, live }) => {
    const open = (name: string, version: number) => new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open(name, version); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const read = <T,>(db: IDBDatabase, store: string) => new Promise<T[]>((resolve, reject) => { const tx = db.transaction(store), request = tx.objectStore(store).getAll(); tx.oncomplete = () => resolve(request.result); tx.onerror = () => reject(tx.error); });
    const photoDb = await open(photos.name, photos.version), captureDb = await open(capture.name, capture.version), queueDb = await open(queue.name, queue.version);
    const records = await read<{ requirementId: string; blob: Blob; capturedAt: string; revisionId?: string; key: string }>(photoDb, photos.store), data = (await read<{ namespace: string; video360: { accepted: { metadata: { localBlobKey: string; mimeType: string; sizeBytes: number; capturedAt: string } } } }>(captureDb, capture.store)).find((row) => row.namespace === namespace)!;
    const media = requirements.map((photo) => { const record = records.find((row) => row.requirementId === photo.id)!; return { inspectionId: "insp_demo", namespace, evidenceKind: "photo" as const, requirementId: photo.id, title: photo.title, localBlobKey: record.key, revision: record.revisionId ?? `${record.capturedAt}:${record.blob.size}:${record.blob.type}`, mimeType: record.blob.type, byteSize: record.blob.size, capturedAt: record.capturedAt, required: photo.required }; });
    const video = data.video360.accepted.metadata;
    const items = [...media, { inspectionId: "insp_demo", namespace, evidenceKind: "video-360" as const, requirementId: undefined, title: "ویدیوی ۳۶۰ درجه", localBlobKey: video.localBlobKey, revision: video.localBlobKey, mimeType: video.mimeType, byteSize: video.sizeBytes, capturedAt: video.capturedAt, required: true }];
    const future = Date.now() + 86_400_000;
    const jobs: UploadJob[] = items.map((item, index) => {
      const job: UploadJob = { ...item, id: JSON.stringify([namespace, item.evidenceKind, item.requirementId ?? "video-360", item.revision]), current: true, upload: "queued", verification: "not-started", bytesUploaded: 0, attemptCount: 0, nextRetryAt: live ? undefined : future };
      if (["complete", "verified", "processing"].includes(state) || state === "mixed" && [0, 1, 2, 6, 7, 8, 9, 10, 11].includes(index)) Object.assign(job, { upload: "uploaded", bytesUploaded: item.byteSize, verification: state === "verified" || state === "mixed" && index === 0 ? "verified" : "not-started", remoteEvidenceId: `mock:${job.id}` });
      if (state === "processing" || state === "mixed" && index === 2) Object.assign(job, { verification: "processing", nextCheckAt: future });
      if (state === "uploading" && (index === 0 || index === items.length - 1) || state === "mixed" && index === 3) Object.assign(job, { upload: "uploading", bytesUploaded: Math.ceil(item.byteSize * 0.45), owner: "fixture", leaseUntil: future });
      if (state === "failed" && index < 2 || state === "mixed" && index === 5) Object.assign(job, { upload: "failed", lastError: "اتصال هنگام ارسال قطع شد. فایل روی دستگاه محفوظ است.", retryable: true, attemptCount: 3 });
      return job;
    });
    await new Promise<void>((resolve, reject) => { const tx = queueDb.transaction([queue.store, queue.settings], "readwrite"), store = tx.objectStore(queue.store); store.clear(); jobs.forEach((job) => store.put(job)); tx.objectStore(queue.settings).put({ stepMs: live ? 200 : 30, processingMs: 100 }, "settings"); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
    photoDb.close(); captureDb.close(); queueDb.close();
  }, { photos: photoDatabase, capture: captureDatabase, queue: uploadDatabase, namespace: photoNamespace("insp_demo", template.templateId, template.templateVersion), requirements: template.sections.flatMap((section) => section.photoRequirements), state, live });
}
export async function uploadWorkflow(page: Page, state: UploadFixture = "queued", live = false) {
  await packageWorkflow(page, { kilometers: 48320, video: "accepted" });
  if (state === "offline") await setOnline(page, false);
  await seedQueue(page, state, live); await openPackageReview(page); await page.getByRole("button", { name: "ادامه به ارسال" }).click();
  await expect(page).toHaveURL(/\/upload$/); await expect(page.getByRole("heading", { name: "همگام‌سازی فایل‌ها" })).toBeVisible(); await expect(page.locator(".upload-row")).toHaveCount(template.sections.flatMap((section) => section.photoRequirements).length + Number(Boolean(template.captureRequirements?.video360Required)));
}
export async function queueJobs(page: Page) {
  return page.evaluate(async (config) => { const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); }); const jobs = await new Promise<UploadJob[]>((resolve) => { const request = db.transaction(config.store).objectStore(config.store).getAll(); request.onsuccess = () => resolve(request.result); }); db.close(); return jobs; }, uploadDatabase);
}
export async function releaseFixtureJobs(page: Page) {
  await page.evaluate(async (config) => { const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); }); await new Promise<void>((resolve) => { const tx = db.transaction(config.store, "readwrite"), store = tx.objectStore(config.store), request = store.getAll(); request.onsuccess = () => { for (const job of request.result as UploadJob[]) store.put({ ...job, owner: undefined, leaseUntil: undefined, nextRetryAt: undefined, nextCheckAt: undefined, upload: job.upload === "uploading" ? "queued" : job.upload }); }; tx.oncomplete = () => resolve(); }); db.close(); }, uploadDatabase);
}
