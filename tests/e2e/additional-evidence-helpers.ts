import { expect, type Page } from "@playwright/test";
import { submissionWorkflow, submissionRecord } from "./submission-helpers";
import { fixtureRequest, type RequestFixture } from "../../src/features/additional-evidence/request-fixtures";
import { additionalRoutes, requestDatabase, requestNamespace, type EvidenceRequest } from "../../src/features/additional-evidence/request-model";
import { photoDatabase } from "../../src/lib/media/photo-store";
import { captureDatabase } from "../../src/lib/media/capture-data-store";
import { uploadDatabase } from "../../src/features/upload/upload-model";
import type { RequestMockSettings } from "../../src/features/additional-evidence/request-repository";

export async function requestedWorkflow(page: Page, scenario: RequestFixture = "two-photo", settings: RequestMockSettings = {}, receipt = false) {
  await submissionWorkflow(page); await page.getByRole("button", { name: "ارسال برای بررسی", exact: true }).click(); await expect(page).toHaveURL(/\/submitted$/);
  const original = await submissionRecord(page), request = fixtureRequest(original, scenario);
  await installRequest(page, request, settings); await page.reload();
  await expect(page.getByRole("heading", { name: "مدارک تکمیلی مورد نیاز است" })).toBeVisible();
  if (!receipt) { await page.getByRole("link", { name: "مشاهده درخواست", exact: true }).click(); await expect(page.getByRole("heading", { name: "مدارک تکمیلی", exact: true })).toBeVisible(); }
  return { request, original };
}
export async function installRequest(page: Page, request: EvidenceRequest, settings: RequestMockSettings = {}) {
  await page.evaluate(async ({ config, request, settings }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const read = indexedDB.open(config.name, config.version); read.onupgradeneeded = () => { read.result.createObjectStore(config.records, { keyPath: "id" }); read.result.createObjectStore(config.receipts); read.result.createObjectStore(config.settings); }; read.onsuccess = () => resolve(read.result); read.onerror = () => reject(read.error); });
    await new Promise<void>((resolve, reject) => { const tx = db.transaction([config.records, config.settings], "readwrite"); tx.objectStore(config.records).put(request); tx.objectStore(config.settings).put(settings, "settings"); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close();
  }, { config: requestDatabase, request, settings: { delayMs: 60, submittedAt: "2026-10-10T09:00:00.000Z", ...settings } });
}
export async function requestRecord(page: Page, id: string) {
  return page.evaluate(async ({ config, id }) => { const db = await new Promise<IDBDatabase>((resolve) => { const read = indexedDB.open(config.name, config.version); read.onsuccess = () => resolve(read.result); }); const record = await new Promise<EvidenceRequest>((resolve) => { const tx = db.transaction(config.records), read = tx.objectStore(config.records).get(id); tx.oncomplete = () => resolve(read.result); }); db.close(); return record; }, { config: requestDatabase, id });
}
export type CandidateFixture = "queued" | "uploading" | "failed" | "processing" | "complete";
export async function seedCandidates(page: Page, request: EvidenceRequest, count: number, state: CandidateFixture = "complete") {
  // Seed while the app is unmounted: reconciliation must not claim a partially
  // installed fixture between the separate media and queue transactions.
  const returnUrl = page.url(), fixtureUrl = "**/__phase08-fixture";
  await page.route(fixtureUrl, (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Fixture setup</title>" }));
  await page.goto("/__phase08-fixture");
  await page.evaluate(async ({ request, namespace, photos, capture, queue, count, state }) => {
    const open = (name: string, version: number) => new Promise<IDBDatabase>((resolve, reject) => { const read = indexedDB.open(name, version); read.onsuccess = () => resolve(read.result); read.onerror = () => reject(read.error); });
    const dbs = await Promise.all([open(photos.name, photos.version), open(capture.name, capture.version), open(queue.name, queue.version)]);
    const read = <T,>(db: IDBDatabase, store: string, key: string) => new Promise<T>((resolve) => { const tx = db.transaction(store), row = tx.objectStore(store).get(key); tx.oncomplete = () => resolve(row.result); });
    const put = (db: IDBDatabase, store: string, value: unknown) => new Promise<void>((resolve, reject) => { const tx = db.transaction(store, "readwrite"); tx.objectStore(store).put(value); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
    const future = Date.now() + 86_400_000;
    for (const item of request.items.slice(0, count)) {
      let metadata: { localBlobKey: string; mimeType: string; byteSize: number; revision: string };
      if (item.kind === "photo") {
        const original = await read<{ blob: Blob }>(dbs[0], photos.store, JSON.stringify([request.originalNamespace, item.requirementId]));
        const key = JSON.stringify([namespace, item.requirementId]), revision = `candidate-${item.id}`;
        await put(dbs[0], photos.store, { key, namespace, requirementId: item.requirementId, blob: original.blob, revisionId: revision, status: "captured", capturedAt: "2026-10-10T08:00:00.000Z" });
        metadata = { localBlobKey: key, revision, mimeType: original.blob.type, byteSize: original.blob.size };
      } else {
        const original = await read<{ video360: { accepted: { blob: Blob; durationSeconds: number; metadata: { localBlobKey: string; mimeType: string; sizeBytes: number; capturedAt: string; kind: string } } } }>(dbs[1], capture.store, request.originalNamespace);
        const accepted = original.video360.accepted, localBlobKey = `${namespace}:video-candidate`;
        await put(dbs[1], capture.store, { namespace, video360: { state: "local", accepted: { ...accepted, metadata: { ...accepted.metadata, localBlobKey } } } });
        metadata = { localBlobKey, revision: localBlobKey, mimeType: accepted.blob.type, byteSize: accepted.blob.size };
      }
      const title = item.kind === "photo" ? request.template.sections.flatMap((section) => section.photoRequirements).find((photo) => photo.id === item.requirementId)!.title : "ویدیوی ۳۶۰ درجه";
      const media = { inspectionId: request.inspectionId, namespace, evidenceKind: item.kind, requirementId: item.kind === "photo" ? item.requirementId : undefined, ...metadata, title, required: true, capturedAt: "2026-10-10T08:00:00.000Z", requestId: request.id, requestVersion: request.version, requestItemId: item.id, replacesEvidenceId: item.originalEvidenceId };
      const id = JSON.stringify([namespace, media.evidenceKind, media.requirementId ?? "video-360", media.revision]);
      await put(dbs[2], queue.store, { ...media, id, current: true, upload: state === "complete" || state === "processing" ? "uploaded" : state, verification: state === "processing" ? "processing" : "not-started", bytesUploaded: state === "uploading" ? Math.floor(media.byteSize * 0.45) : ["complete", "processing"].includes(state) ? media.byteSize : 0, attemptCount: state === "failed" ? 3 : 1, retryable: true, nextRetryAt: future, owner: state === "uploading" ? "fixture" : undefined, leaseUntil: state === "uploading" ? future : undefined, nextCheckAt: future, lastError: state === "failed" ? "اتصال هنگام ارسال قطع شد. مدرک روی دستگاه محفوظ است." : undefined, remoteEvidenceId: ["complete", "processing"].includes(state) ? `mock:${id}` : undefined });
    }
    dbs.forEach((db) => db.close());
  }, { request, namespace: requestNamespace(request), photos: photoDatabase, capture: captureDatabase, queue: uploadDatabase, count, state });
  await page.unroute(fixtureUrl);
  await page.goto(returnUrl); await expect(page.locator(".additional-card")).toHaveCount(request.items.length);
}
export const requestedItem = (page: Page, id: string) => page.locator(`.additional-card[data-item="${id}"]`);
export async function openRequest(page: Page, request: EvidenceRequest) { await page.goto(additionalRoutes.list(request.inspectionId, request.id)); await expect(page.getByRole("heading", { name: "مدارک تکمیلی", exact: true })).toBeVisible(); }
