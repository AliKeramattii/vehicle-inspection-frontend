import { mockInitialInspectionId } from "../../src/features/identity/source-context";
import { chooseDemoLocation } from "./location-helpers";
import { expect, type Page } from "@playwright/test";
import { type PhotographyTemplate } from "../../src/schemas/photography";
import { legacyPhotographyTemplate as template } from "../../src/features/photography/inspection-template";
import { photoDatabase, photoKey, photoNamespace } from "../../src/lib/media/photo-store";

export const requirements = template.sections.flatMap((section) => section.photoRequirements);
/** Fixtures use the same tenant/attempt identity as the mock source adapter, including verified returns. */
export async function verifiedFixtureInspectionId(page:Page):Promise<string|undefined> {
 return page.evaluate(()=>{if(location.origin==="null")return;return Object.values(sessionStorage).flatMap(raw=>{try{const s=JSON.parse(raw);return s?.mode==="mock"&&s.expiresAt>Date.now()&&typeof s.inspectionId==="string"?[s.inspectionId]:[];}catch{return [];}})[0];});
}
export async function fixtureInspectionId(page:Page):Promise<string> {
 const current=await verifiedFixtureInspectionId(page);
 if(typeof current==="string")return current;
 const tenant=await page.evaluate(async()=>{const bootstrap=await(await fetch("/site-bootstrap.json")).json();return String(bootstrap.tenantId);});
 return mockInitialInspectionId(tenant);
}
export async function seedPhotos(page: Page, count: number, retakeId?: string, draftId?: string, policy: PhotographyTemplate = template) {
  const inspectionId=await fixtureInspectionId(page);
  // Explicit version pin: legacy regression fixtures stay v1, current policy tests request v2.
  await page.evaluate(async ({inspectionId,policy})=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const q=indexedDB.open("inspection-confirmed-facts",1);q.onupgradeneeded=()=>q.result.createObjectStore("facts",{keyPath:"inspectionId"});q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
    await new Promise<void>((resolve,reject)=>{const tx=db.transaction("facts","readwrite"),store=tx.objectStore("facts"),q=store.get(inspectionId);q.onsuccess=()=>store.put({...q.result,inspectionId,photographyTemplate:policy});tx.oncomplete=()=>resolve();tx.onabort=tx.onerror=()=>reject(tx.error);});db.close();
  },{inspectionId,policy});
  const namespace = photoNamespace(inspectionId, policy.templateId, policy.templateVersion);
  const photos = policy.sections.flatMap(s=>s.photoRequirements).slice(0, count).map((photo) => ({ key: photoKey(namespace, photo.id), namespace, requirementId: photo.id, image: photo.sampleImage,
    alternativeId: photo.choice ? "pillar" : undefined, status: photo.id === retakeId ? "retake-requested" : "captured" }));
  if (draftId && !photos.some((photo) => photo.requirementId === draftId)) photos.push({ key: photoKey(namespace, draftId), namespace, requirementId: draftId, image: `/assets/inspection-vehicle/photo-guides/${draftId}.webp`, alternativeId: undefined, status: "pending" });
  await page.evaluate(async ({ photos, databaseConfig, draftId }) => {
    // Test-only deterministic evidence. Runtime never treats sample images as customer captures.
    const records = await Promise.all(photos.map(async ({ image, ...record }) => {
      const blob = await (await fetch(image)).blob();
      return { ...record, blob: record.status === "pending" ? undefined : blob, capturedAt: "2026-10-06T00:00:00Z",
        reviewerReason: record.status === "retake-requested" ? "پلاک خوانا نیست." : undefined,
        draft: record.requirementId === draftId ? { blob, alternativeId:record.alternativeId, capturedAt: "2026-10-06T00:00:00Z" } : undefined };
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
export async function enterPhotography(page: Page, inspectionId?:string) {
  inspectionId ??= await fixtureInspectionId(page);
  // A verified return now restores its existing attempt instead of repeating OTP/consent.
  const returning = await page.evaluate(id => Object.values(sessionStorage).some(raw => {
    try { const session=JSON.parse(raw);return session?.mode==="mock"&&session.inspectionId===id&&session.expiresAt>Date.now(); } catch { return false; }
  }),inspectionId);
  async function existingCaptureReady(){
    await page.goto(`/inspection/${encodeURIComponent(inspectionId!)}/capture`);
    const progress=page.getByRole("progressbar"),setup=page.getByText("برای شروع عکاسی، موقعیت و مشخصات خودرو را تأیید کنید.");
    await expect(progress.or(setup)).toBeVisible();return progress.isVisible();
  }
  if(returning){
    if(await existingCaptureReady())return;
    await page.goto("/readiness");
  }else{
    await page.getByRole("textbox", { name: "کد معرفی / کد ارجاع" }).fill("A4K9P2");
    await page.getByRole("button", { name: "شروع بازدید" }).click();
    await page.getByRole("textbox", { name: "کد تأیید پنج‌رقمی" }).fill("12345");
    await expect(page).not.toHaveURL(/\/verify$/);
    if(!page.url().endsWith("/readiness")){
      if(await existingCaptureReady())return;
      await page.goto("/readiness");
    }
  }
  await page.getByRole("button", { name: "همه چیز آماده است" }).click();
  await page.getByRole("checkbox").check(); await page.getByRole("button", { name: "تأیید و ادامه" }).click();
  await expect(page).toHaveURL(/\/location$/);await expect(page.getByRole("button",{name:"تأیید این موقعیت"})).toBeVisible();
  await chooseDemoLocation(page);
  await page.getByRole("button", { name: "تأیید این موقعیت" }).click();
  await page.getByRole("button", { name: "تأیید مشخصات و ادامه" }).click();
  await expect(page).toHaveURL(new RegExp("/inspection/"+inspectionId+"/capture$"));
  await expect(page.getByRole("progressbar")).toBeVisible();
}
export async function snapshotReady(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((image) => { image.loading = "eager"; return image.decode(); })));
}
export async function mockCamera(page: Page, sampleImage?: string) {
  await page.addInitScript((sampleImage?: string) => {
    const target = window as Window & { photographyCameraCalls?: number; stoppedPhotoTracks?: number };
    target.photographyCameraCalls = 0; target.stoppedPhotoTracks = 0;
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia: async () => {
      target.photographyCameraCalls!++;
      const id = location.pathname.split("/").at(-2) ?? "front-45-right";
      const blob = await (await fetch(sampleImage ?? `/assets/inspection-vehicle/photo-guides/${id}.webp`)).blob();
      const bitmap = await createImageBitmap(blob), canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0); bitmap.close();
      const stream = canvas.captureStream(5);
      for (const track of stream.getTracks()) { const stop = track.stop.bind(track); track.stop = () => { target.stoppedPhotoTracks!++; stop(); }; }
      return stream;
    } } });
  }, sampleImage);
}
