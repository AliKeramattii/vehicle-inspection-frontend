import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { inspectionPhotographyTemplate as template } from "../../src/features/photography/inspection-template";
import { captureDatabase } from "../../src/lib/media/capture-data-store";
import { photoNamespace } from "../../src/lib/media/photo-store";
import { seedPhotos, enterPhotography } from "./photography-helpers";

export async function mockRecorder(page: Page, unsupported = false) {
  await page.addInitScript(({ bytes, unsupported }) => {
    const counters = window as Window & { recorderStarts?: number; recorderStops?: number };
    class TestRecorder {
      static isTypeSupported(mime: string) { return mime === "video/webm"; }
      state = "inactive"; mimeType = "video/webm";
      onstart?: () => void; onstop?: () => void; onerror?: () => void; ondataavailable?: (event: { data: Blob }) => void;
      start() { this.state = "recording"; counters.recorderStarts = (counters.recorderStarts ?? 0) + 1; queueMicrotask(() => this.onstart?.()); }
      stop() { this.state = "inactive"; counters.recorderStops = (counters.recorderStops ?? 0) + 1; queueMicrotask(() => { this.ondataavailable?.({ data: new Blob([new Uint8Array(bytes)], { type: this.mimeType }) }); this.onstop?.(); }); }
    }
    Object.defineProperty(window, "MediaRecorder", { configurable: true, value: unsupported ? undefined : TestRecorder });
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { async getUserMedia() {
      const counters = window as Window & { photographyCameraCalls?: number; stoppedPhotoTracks?: number };
      counters.photographyCameraCalls = (counters.photographyCameraCalls ?? 0) + 1;
      const image = new Image(); image.src = location.pathname.includes("/photo/odometer-on/") ? "/assets/inspection/photo-guides/odometer-on.webp" : "/assets/inspection/photo-guides/front-45-right.webp"; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext("2d")!.drawImage(image, 0, 0);
      const stream = canvas.captureStream(5); for (const track of stream.getTracks()) { const stop = track.stop.bind(track); track.stop = () => { counters.stoppedPhotoTracks = (counters.stoppedPhotoTracks ?? 0) + 1; stop(); }; } return stream;
    } } });
  }, { bytes: [...readFileSync("tests/e2e/fixtures/walkaround.webm")], unsupported });
}
export async function packageWorkflow(page: Page, options: { photos?: number; kilometers?: number; video?: "accepted" | "draft" | "replacement" | "retake" } = {}) {
  await page.goto("/"); await seedPhotos(page, options.photos ?? 12);
  const namespace = photoNamespace("insp_demo", template.templateId, template.templateVersion);
  await page.evaluate(async ({ config, namespace, options, bytes }) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(config.name, config.version);
      request.onupgradeneeded = () => request.result.createObjectStore(config.store, { keyPath: "namespace" });
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const blob = new Blob([new Uint8Array(bytes)], { type: "video/webm" });
    const evidence = { blob, durationSeconds: 28, metadata: { kind: "video-360", mimeType: blob.type, sizeBytes: blob.size, localBlobKey: `${namespace}:video-360`, capturedAt: "2026-10-08T00:00:00Z" } };
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(config.store, "readwrite"), store = transaction.objectStore(config.store); store.clear();
      store.put({ namespace, odometer: options.kilometers === undefined ? undefined : { kilometers: options.kilometers, updatedAt: "2026-10-08T00:00:00Z" },
        video360: !options.video ? undefined : { state: options.video === "retake" ? "retakeRequired" : "local", accepted: options.video !== "draft" ? evidence : undefined, draft: ["draft", "replacement"].includes(options.video) ? evidence : undefined, reviewerReason: options.video === "retake" ? "یک دور کامل از خودرو دیده نمی‌شود." : undefined } });
      transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
    }); database.close();
  }, { config: captureDatabase, namespace, options, bytes: [...readFileSync("tests/e2e/fixtures/walkaround.webm")] });
  await enterPhotography(page);
}
export async function openPackageReview(page: Page) { await page.getByRole("link", { name: "بررسی نیازمندی‌های بازدید" }).click(); await expect(page.getByRole("heading", { name: "بررسی و ارسال", exact: true })).toBeVisible(); }
export async function recordedState(page: Page) {
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.getByRole("button", { name: "شروع ضبط", exact: true }).click();
  await expect(page.locator(".video-capture")).toHaveAttribute("data-recording-state", "recording");
  await page.clock.fastForward(28000); await expect(page.getByLabel("مدت ضبط")).toContainText("۰۰:۲۸");
}
export async function captureData(page: Page) {
  return page.evaluate(async (config) => {
    const database = await new Promise<IDBDatabase>((resolve) => { const request = indexedDB.open(config.name, config.version); request.onsuccess = () => resolve(request.result); });
    const rows = await new Promise<{ odometer?: { kilometers: number }; video360?: { state: string; accepted?: { blob: Blob }; draft?: { blob: Blob } } }[]>((resolve) => { const request = database.transaction(config.store).objectStore(config.store).getAll(); request.onsuccess = () => resolve(request.result); }); database.close();
    return rows.map((row) => ({ kilometers: row.odometer?.kilometers, state: row.video360?.state, acceptedBytes: row.video360?.accepted?.blob.size ?? 0, draftBytes: row.video360?.draft?.blob.size ?? 0 }));
  }, captureDatabase);
}
