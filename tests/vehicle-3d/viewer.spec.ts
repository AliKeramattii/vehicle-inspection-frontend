import { test, expect, type Page } from "@playwright/test";
import { seedPhotos, enterPhotography } from "../e2e/photography-helpers";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { submissionDatabase } from "../../src/features/submission/submission-model";
const renders=join(tmpdir(),"vehicle-inspection-phase09","screenshots"); mkdirSync(renders,{recursive:true});
test.beforeAll(async({request})=>{
  // A cold Next development compiler hot-reloads shared mock providers when a new route compiles.
  // Compile workflow routes before creating an authenticated browser session, never during it.
  for(const path of ["/","/verify","/readiness","/consent","/inspection/insp_demo/location","/inspection/insp_demo/vehicle","/inspection/insp_demo/capture","/inspection/insp_demo/capture/preview-3d","/inspection/insp_demo/capture/photo/front-45-right/guide","/inspection/insp_demo/capture/photo/front-45-right/review","/api/development/vehicle-model/mobile"]) {
    const response=await request.get(path); expect(response.status(),path).toBe(200);
  }
});
async function photography(page:Page,count=0,retake?:string) {
  // Seed real IndexedDB on an inert same-origin document, before the application mounts.
  await page.route("**/vehicle-preview-fixture",route=>route.fulfill({contentType:"text/html",body:"<!doctype html><title>Fixture</title>"}));
  await page.goto("/vehicle-preview-fixture");await seedPhotos(page,count,retake);await page.unroute("**/vehicle-preview-fixture");
  await page.goto("/");
  // ViewportResize sets this public layout attribute after client hydration. Cold dev SSR forms
  // can otherwise accept native input before React owns the referral/OTP events.
  await page.locator("main[data-overflow]").waitFor();
  await enterPhotography(page);
}
async function preview(page:Page,count=0,retake?:string) { await photography(page,count,retake); await page.getByRole("link",{name:"پیش‌نمایش محلی مدل خودرو"}).click(); await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-ready","true",{timeout:60_000}); }
async function bounds(page:Page) {
  const scene=await page.locator(".vehicle-preview-display").boundingBox(), controls=await page.locator(".vehicle-3d-preview > .vehicle-photo-controls").boundingBox();
  expect(scene).toBeTruthy();expect(controls!.y).toBeGreaterThanOrEqual(scene!.y+scene!.height+7);
  for(const button of await page.locator(".vehicle-3d-preview > .vehicle-photo-controls button").all()) { const box=await button.boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44); }
  const documentBounds=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,body:document.body.scrollHeight,vw:innerWidth,vh:innerHeight}));
  expect(documentBounds.w).toBe(documentBounds.vw); expect(documentBounds.h).toBe(documentBounds.vh);expect(documentBounds.body).toBe(documentBounds.vh);
  await expect(page.locator(".photography-actions")).toBeInViewport();
}
test("real local viewer, presets, shared card selection, controls below and responsive bounds",async({page})=>{
  const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
  await preview(page);
  for(const size of [{width:360,height:800},{width:390,height:844},{width:430,height:932}]) {await page.setViewportSize(size);await bounds(page);await page.screenshot({path:`${renders}/3d-${size.width}.png`});}
  await page.getByRole("button",{name:"نمای خودرو: عقب",exact:true}).click();await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-view","rear");
  await page.screenshot({path:`${renders}/3d-rear-markers.png`});
  await expect(page.locator('.photography-shot-card[data-requirement="rear-plate"]')).toHaveAttribute("aria-pressed","true");
  await page.getByRole("button",{name:"نمای خودرو: بالا",exact:true}).click();await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-view","top");
  await page.getByRole("button",{name:"نمای خودرو: راست",exact:true}).click();await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-view","right");await page.screenshot({path:`${renders}/3d-side-markers.png`});
  await page.locator('.photography-shot-card[data-requirement="front-45-left"]').click();await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-view","front-left");
  await page.locator('.photography-shot-card[data-requirement="front-45-right"]').click();await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-view","front-right");
  expect(errors).toEqual([]);
});
test("pending world marker opens shared guidance by keyboard",async({page})=>{
  await preview(page); const marker=page.locator('.vehicle-world-marker[data-requirement="front-45-right"]'); await expect(marker).toBeVisible(); await marker.focus(); await marker.press("Enter"); await expect(page).toHaveURL(/front-45-right\/guide$/);
});
test("completed marker opens accepted evidence without destroying it",async({page})=>{
  await preview(page,1); await page.locator('.photography-shot-card[data-requirement="front-45-right"]').click();
  const marker=page.locator('.vehicle-world-marker[data-requirement="front-45-right"]');await expect(marker).toHaveAttribute("data-state","complete");await page.screenshot({path:`${renders}/3d-completed-marker.png`});await marker.click();await expect(page).toHaveURL(/front-45-right\/review$/);await expect(page.getByRole("button",{name:"عکاسی مجدد"})).toBeVisible();
});
test("retake marker preserves reviewer reason in the existing guarded flow",async({page})=>{
  await preview(page,1,"front-45-right");const marker=page.locator('.vehicle-world-marker[data-requirement="front-45-right"]');await expect(marker).toHaveAttribute("data-state","attention");await page.screenshot({path:`${renders}/3d-retake-marker.png`});await marker.click();await expect(page).toHaveURL(/front-45-right\/guide$/);await expect(page.getByText("پلاک خوانا نیست.")).toBeVisible();
});
test("model error uses real 2D fallback and retry retains selected requirement",async({page})=>{
  await photography(page); await page.route("**/api/development/vehicle-model/*",route=>route.fulfill({status:503}));await page.getByRole("link",{name:"پیش‌نمایش محلی مدل خودرو"}).click();
  await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-mode","2d");await bounds(page);await page.screenshot({path:`${renders}/fallback.png`});
  await expect(page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]')).toHaveAttribute("aria-pressed","true");
  await page.unroute("**/api/development/vehicle-model/*");await page.getByRole("button",{name:"تلاش مجدد",exact:true}).click();await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-ready","true",{timeout:60_000});
});
test("manual 2D mode and navigation dispose the WebGL context",async({page})=>{
  await page.addInitScript(()=>{
    const getExtension=WebGL2RenderingContext.prototype.getExtension as (name:string)=>unknown;
    let count=0;Object.defineProperty(window,"releasedVehicleContexts",{get:()=>count});
    Object.defineProperty(WebGL2RenderingContext.prototype,"getExtension",{value:function(this:WebGL2RenderingContext,name:string){
      const extension=getExtension.call(this,name);
      if(name==="WEBGL_lose_context"&&extension){const context=extension as WEBGL_lose_context;const release=context.loseContext.bind(context);context.loseContext=()=>{count++;release();};}
      return extension;
    }});
  });
  await preview(page);await page.getByRole("button",{name:"نمای دوبعدی",exact:true}).click();await expect(page.locator(".vehicle-preview-canvas canvas")).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>Reflect.get(window,"releasedVehicleContexts"))).toBeGreaterThan(0);await bounds(page);
  await page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]').click();await expect(page).toHaveURL(/front-45-right\/guide$/);
});
test("loading keeps the existing vehicle artwork visible",async({page})=>{
  await photography(page);
  let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route("**/api/development/vehicle-model/*",async route=>{await pending;await route.continue();});
  try {
    await page.getByRole("link",{name:"پیش‌نمایش محلی مدل خودرو"}).click();
    await expect(page.locator(".vehicle-preview-loading")).toBeVisible();await expect(page.locator(".vehicle-preview-poster img")).toBeVisible();await bounds(page);
    await page.screenshot({path:`${renders}/loading.png`});release();await expect(page.locator(".vehicle-3d-preview")).toHaveAttribute("data-ready","true",{timeout:60_000});
  } finally { release(); }
});
test("WebGL unavailable stays usable in 2D without downloading a model",async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,"WebGL2RenderingContext",{value:undefined,configurable:true}));
  let downloads=0;page.on("request",request=>{if(request.url().includes("/api/development/vehicle-model/"))downloads++;});
  await photography(page);await page.getByRole("link",{name:"پیش‌نمایش محلی مدل خودرو"}).click();
  await expect(page.getByText("این دستگاه از نمای سه‌بعدی پشتیبانی نمی‌کند. نمای دوبعدی فعال است.")).toBeVisible();
  await expect(page.locator(".vehicle-preview-canvas canvas")).toHaveCount(0);await bounds(page);expect(downloads).toBe(0);
  await page.screenshot({path:`${renders}/unsupported.png`});
  await page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]').click();await expect(page).toHaveURL(/front-45-right\/guide$/);
});
test("submitted inspection cannot mount the optional editable viewer",async({page})=>{
  await photography(page);
  await page.evaluate(async config=>{
    const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open(config.name,config.version);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    await new Promise<void>((resolve,reject)=>{const tx=db.transaction(config.records,"readwrite");tx.objectStore(config.records).put({inspectionId:"insp_demo",idempotencyKey:"fixture",status:"queued-for-review",attemptCount:1,receipt:{reference:"BDI-8F31K2",submittedAt:"2026-10-10T08:00:00Z",status:"queued-for-review",estimatedReviewMinutes:120}});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
  },submissionDatabase);
  let downloads=0;page.on("request",request=>{if(request.url().includes("/api/development/vehicle-model/"))downloads++;});
  await page.goto("/inspection/insp_demo/capture/preview-3d");await expect(page).toHaveURL(/\/submitted$/);await expect(page.locator(".vehicle-3d-preview")).toHaveCount(0);expect(downloads).toBe(0);
});
