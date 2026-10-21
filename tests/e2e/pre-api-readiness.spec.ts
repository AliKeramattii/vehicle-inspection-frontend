import { requiredMediaCount } from "../../src/features/upload/upload-model";
import { inspectionPhotographyTemplate } from "../../src/features/photography/inspection-template";
import { test, expect, type Page, type Locator } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { photography, snapshotReady } from "./photography-helpers";
import { packageWorkflow } from "./capture-package-helpers";
import { seedQueue } from "./upload-helpers";
const folder=".agent/reference-review/pre-api/renders";
async function bounded(page:Page) {
 expect(await page.evaluate(()=>({x:document.documentElement.scrollWidth>innerWidth,y:document.documentElement.scrollHeight>innerHeight}))).toEqual({x:false,y:false});
}
async function reachable(page:Page,control:Locator) {
 await expect(control).toBeInViewport();const b=await control.boundingBox();expect(b).not.toBeNull();expect(b!.height).toBeGreaterThanOrEqual(44);expect(b!.y+b!.height).toBeLessThanOrEqual(page.viewportSize()!.height+1);
}
for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[768,1024],[1440,960]]) {
 test(`pre-API customer controls, evidence and upload recovery remain bounded at ${width}x${height}`,async({page},info)=>{
  test.skip(info.project.name!=="customer");test.setTimeout(60_000);await mkdir(folder,{recursive:true});await page.setViewportSize({width,height});const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  await photography(page);await bounded(page);await reachable(page,page.locator(".photography-actions a"));await snapshotReady(page);await page.screenshot({path:`${folder}/photography-${width}.png`});
  const controls=page.locator(".vehicle-photo-controls");await controls.scrollIntoViewIfNeeded();const image=(await page.locator(".vehicle-photo-scene .photography-image").boundingBox())!,row=(await controls.boundingBox())!;
  expect(row.y).toBeGreaterThanOrEqual(image.y+image.height);expect(await controls.evaluate(e=>e.closest(".vehicle-photo-scene"))).toBeNull();
  for(const button of await controls.getByRole("button").all()){await button.scrollIntoViewIfNeeded();const box=(await button.boundingBox())!;expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
  await page.goto("/inspection/insp_demo/capture/photo/front-45-right/guide");await expect(page.getByRole("heading",{name:"راهنمای عکاسی"})).toBeVisible();await bounded(page);await reachable(page,page.getByRole("link",{name:"باز کردن دوربین"}));
  await packageWorkflow(page,{kilometers:48320,video:"accepted"});await seedQueue(page,"failed");
  await page.goto("/inspection/insp_demo/capture/photo/odometer-on/review");await expect(page.getByLabel("کیلومتر فعلی",{exact:true})).toHaveValue("۴۸٬۳۲۰");await bounded(page);await snapshotReady(page);await page.screenshot({path:`${folder}/odometer-${width}.png`});
  await page.goto("/inspection/insp_demo/capture/video/review");await expect(page.locator("video[controls]")).toBeVisible();await bounded(page);await snapshotReady(page);await page.screenshot({path:`${folder}/video-review-${width}.png`});
  await page.goto("/inspection/insp_demo/upload");await expect(page.locator(".upload-row")).toHaveCount(requiredMediaCount(inspectionPhotographyTemplate));await bounded(page);await expect(page.getByRole("button",{name:"تلاش مجدد همه"})).toBeVisible();await snapshotReady(page);await page.screenshot({path:`${folder}/upload-failed-${width}.png`});
  expect(errors).toEqual([]);
 });
}
