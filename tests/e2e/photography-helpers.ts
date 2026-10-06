import { expect, type Page } from "@playwright/test";
import { inspectionPhotographyTemplate as template } from "../../src/features/photography/inspection-template";
import { photoDatabase, photoKey, photoNamespace } from "../../src/lib/media/photo-store";

export const requirements = template.sections.flatMap((section) => section.photoRequirements);
export async function seedPhotos(page: Page, count: number, retakeId?: string, draftId?: string) {
  const namespace = photoNamespace("insp_demo", template.templateId, template.templateVersion);
  const photos = requirements.slice(0, count).map((photo) => ({ key: photoKey(namespace, photo.id), namespace, requirementId: photo.id, image: photo.sampleImage,
    status: photo.id === retakeId ? "retake-requested" : "captured" }));
  if (draftId && !photos.some((photo) => photo.requirementId === draftId)) photos.push({ key: photoKey(namespace, draftId), namespace, requirementId: draftId, image: `/assets/inspection/photo-guides/${draftId}.webp`, status: "pending" });
  await page.evaluate(async ({ photos, databaseConfig, draftId }) => {
    // Test-only deterministic evidence. Runtime never treats sample images as customer captures.
    const records = await Promise.all(photos.map(async ({ image, ...record }) => {
      const blob = await (await fetch(image)).blob();
      return { ...record, blob: record.status === "pending" ? undefined : blob, capturedAt: "2026-10-06T00:00:00Z",
        reviewerReason: record.status === "retake-requested" ? "پلاک خوانا نیست." : undefined,
        draft: record.requirementId === draftId ? { blob, capturedAt: "2026-10-06T00:00:00Z" } : undefined };
    }));
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseConfig.name, databaseConfig.version);
      request.onupgradeneeded = () => request.result.createObjectStore(databaseConfig.store, { keyPath: "key" });
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(databaseConfig.store, "readwrite"), store = transaction.objectStore(databaseConfig.store);
      store.clear(); records.forEach((record) => store.put(record));
      transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
    }); database.close();
  }, { photos, databaseConfig: photoDatabase, draftId });
}
export async function photography(page: Page, count = 0, retakeId?: string, draftId?: string) {
  await page.goto("/"); await seedPhotos(page, count, retakeId, draftId);
  await enterPhotography(page);
}
export async function enterPhotography(page: Page) {
  await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
  await page.getByRole("button", { name: "شروع بازدید" }).click();
  await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await page.getByRole("button", { name: "تأیید مشخصات و ادامه" }).click();
  await expect(page).toHaveURL(/\/inspection\/insp_demo\/capture$/);
  await expect(page.getByRole("progressbar")).toBeVisible();
}
export async function snapshotReady(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); })));
}
export async function mockCamera(page: Page) {
  await page.addInitScript(() => {
    const target = window as Window & { photographyCameraCalls?: number; stoppedPhotoTracks?: number };
    target.photographyCameraCalls = 0; target.stoppedPhotoTracks = 0;
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => {
      target.photographyCameraCalls!++;
      const id = location.pathname.split("/").at(-2) ?? "front-45-right";
      const blob = await (await fetch(`/assets/inspection/photo-guides/${id}.webp`)).blob();
      const bitmap = await createImageBitmap(blob), canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0); bitmap.close();
      const stream = canvas.captureStream(5);
      for (const track of stream.getTracks()) { const stop = track.stop.bind(track); track.stop = () => { target.stoppedPhotoTracks!++; stop(); }; }
      return stream;
    } } });
  });
}
