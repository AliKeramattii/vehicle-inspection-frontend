import { expect, type Page } from "@playwright/test";
import { uploadWorkflow, seedQueue, type UploadFixture } from "./upload-helpers";
import { submissionDatabase } from "../../src/features/submission/submission-model";
import type { SubmissionRecord } from "../../src/features/submission/submission-model";
import type { SubmissionMockSettings } from "../../src/features/submission/submission-repository";
import { photoDatabase } from "../../src/lib/media/photo-store";
import { captureDatabase } from "../../src/lib/media/capture-data-store";

export async function configureSubmission(page: Page, settings: SubmissionMockSettings = {}) {
  await page.evaluate(async ({ config, settings }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    await new Promise<void>((resolve, reject) => { const tx = db.transaction(config.settings, "readwrite"); tx.objectStore(config.settings).put(settings, "settings"); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); db.close();
  }, { config: submissionDatabase, settings: { delayMs: 80, submittedAt: "2026-10-08T07:00:00.000Z", ...settings } });
}
export async function submissionWorkflow(page: Page, settings: SubmissionMockSettings = {}) {
  await uploadWorkflow(page, "complete"); await configureSubmission(page, settings);
  await page.getByRole("button", { name: "ادامه به بررسی نهایی" }).click(); await expect(page).toHaveURL(/\/insp_demo\/review$/);
  await expect(page.getByRole("heading", { name: "آماده ارسال", exact: true })).toBeVisible();
}
export async function submissionRecord(page: Page) {
  return page.evaluate(async (config) => { const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); }); const record = await new Promise<SubmissionRecord>((resolve) => { const tx = db.transaction(config.records), request = tx.objectStore(config.records).get("insp_demo"); tx.oncomplete = () => resolve(request.result); }); db.close(); return record; }, submissionDatabase);
}
export async function changeSummary(page: Page, options: { missing?: "photo" | "odometer" | "video"; queue?: UploadFixture }) {
  if (options.queue) await seedQueue(page, options.queue);
  if (options.missing) await page.evaluate(async ({ missing, photos, capture }) => {
    const config = missing === "photo" ? photos : capture;
    const db = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); });
    await new Promise<void>((resolve) => { const tx = db.transaction(config.store, "readwrite"), store = tx.objectStore(config.store), request = store.getAll(); request.onsuccess = () => {
      if (missing === "photo") { const record = request.result[0]; store.put({ ...record, blob: undefined, status: "pending", capturedAt: undefined }); }
      else for (const record of request.result) { if (missing === "odometer") delete record.odometer; else delete record.video360; store.put(record); }
    }; tx.oncomplete = () => resolve(); }); db.close();
  }, { missing: options.missing, photos: photoDatabase, capture: captureDatabase });
  // Use real client navigation back to re-read durable state without changing mock authentication.
  await page.getByRole("link", { name: "مرکز ارسال آمادگی ارسال" }).click(); await expect(page).toHaveURL(/\/upload$/); await page.goBack(); await expect(page).toHaveURL(/\/insp_demo\/review$/);
}
