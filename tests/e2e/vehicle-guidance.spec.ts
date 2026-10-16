import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { photography, mockCamera, snapshotReady } from "./photography-helpers";
import { vehicleIdentificationGuides } from "../../src/features/photography/vehicle-identification-guides";
import { vehicleGhostAssets, vehicleIdentificationAssets } from "../../src/config/vehicle-assets";
const folder=".agent/reference-review/vehicle-guidance/after";
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async({page},info)=>{
 test.skip(info.project.name!=="customer");await mkdir(folder,{recursive:true});
 const messages:string[]=[];errors.set(page,messages);page.on("pageerror",e=>messages.push(e.message));page.on("console",m=>{if(m.type()==="error")messages.push(m.text());});page.on("response",r=>{if(r.status()>=400)messages.push(r.status()+" "+new URL(r.url()).pathname);});
});
test.afterEach(({page},info)=>{if(info.status!=="skipped")expect(errors.get(page)).toEqual([]);});
async function bounds(page:Page){expect(await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.scrollHeight])).toEqual([await page.evaluate(()=>innerWidth),await page.evaluate(()=>innerHeight)]);}
async function shot(page:Page,name:string){await snapshotReady(page);await bounds(page);await page.screenshot({path:folder+"/"+name+".png"});if(["spec-plate-choices-390","spec-plate-guide-windshield","photo-camera-ghost-390","spec-plate-review"].includes(name))await expect(page).toHaveScreenshot(name+".png");}
for(const requirement of ["spec-plate","chassis-number"]){
 test(requirement+" offers four locations, preserves selected guidance, live-only capture and review identity",async({page})=>{
  test.setTimeout(120000);await mockCamera(page, vehicleIdentificationAssets.windshield);await photography(page);
  await page.locator(".photography-categories button").filter({hasText:"موتور و مشخصات"}).click();await page.locator('.photography-shot-card[data-requirement="'+requirement+'"]').click();await page.getByRole("link",{name:/عکاسی نمای بعدی:/}).click();
  await expect(page.locator("[data-guide-option]")).toHaveCount(4);
  expect(await page.evaluate(()=>(window as Window&{photographyCameraCalls?:number}).photographyCameraCalls)).toBe(0);
  for(const [width,height] of [[360,800],[390,844],[430,932]]){await page.setViewportSize({width,height});await shot(page,requirement+"-choices-"+width);const choices=await page.locator("[data-guide-option]").all();for(const c of choices){const box=await c.boundingBox();expect(box!.width).toBeGreaterThanOrEqual(44);expect(box!.height).toBeGreaterThanOrEqual(44);}}
  await page.setViewportSize({width:390,height:844});
  for(const option of vehicleIdentificationGuides){
   const button=page.getByRole("button",{name:option.title});await button.focus();await button.press("Enter");
   await expect(page.getByRole("link",{name:"باز کردن دوربین"})).toHaveAttribute("href",new RegExp(requirement+"/camera$"));
   await expect.poll(()=>page.locator(".photo-guide-image img").getAttribute("src").then(src=>decodeURIComponent(src??""))).toContain(option.src);
   await shot(page,requirement+"-guide-"+option.id);
   if(option.id!=="windshield")await page.getByRole("button",{name:"تغییر محل کد"}).click();
  }
  await page.getByRole("link",{name:"باز کردن دوربین"}).click();await expect(page.getByRole("button",{name:"ثبت عکس",exact:true})).toBeEnabled();await expect(page.locator('input[type="file"]')).toHaveCount(0);await expect(page.locator(".photo-alignment-guide")).toHaveCount(0);
  await page.getByRole("button",{name:"ثبت عکس",exact:true}).click();await expect(page).toHaveURL(new RegExp(requirement+"/review$"));
  await expect(page.getByRole("img",{name:/عکس شما:/})).toHaveAttribute("src",/^blob:/);
  await expect.poll(()=>page.locator(".photo-review-reference img").getAttribute("src").then(src=>decodeURIComponent(src??""))).toContain("windshield-vin.webp");await shot(page,requirement+"-review");
  await page.getByRole("button",{name:"تأیید و ادامه",exact:true}).click();await expect(page).not.toHaveURL(new RegExp(requirement+"/review$"));
 });
}
test("photo-only ghost is faint, view-correct, toggleable, outside evidence and preserves cleanup",async({page})=>{
 await mockCamera(page);await photography(page);await page.getByRole("link",{name:/عکاسی نمای بعدی:/}).click();await page.getByRole("link",{name:"باز کردن دوربین"}).click();await expect(page.getByRole("button",{name:"ثبت عکس",exact:true})).toBeEnabled();
 await expect(page.locator(".photo-alignment-guide")).toHaveAttribute("data-view","front-45-right");await expect(page.locator(".photo-alignment-guide img")).toHaveAttribute("src",vehicleGhostAssets["front-45-right"]);
 const opacity=await page.locator(".photo-alignment-guide img").evaluate(el=>Number(getComputedStyle(el).opacity));expect(opacity).toBeGreaterThan(0);expect(opacity).toBeLessThanOrEqual(.25);
 for(const [width,height] of [[360,800],[390,844],[430,932]]){await page.setViewportSize({width,height});await shot(page,"photo-camera-ghost-"+width);await expect(page.getByRole("button",{name:"ثبت عکس",exact:true})).toBeInViewport();}
 const toggle=page.getByRole("button",{name:/راهنمای قاب‌بندی/});await toggle.focus();await toggle.press("Space");await expect(toggle).toHaveAttribute("aria-pressed","false");await expect(page.locator(".photo-alignment-guide")).toHaveCount(0);await toggle.press("Space");
 await page.getByRole("button",{name:"ثبت عکس",exact:true}).click();await expect(page).toHaveURL(/front-45-right\/review$/);await expect(page.locator(".photo-alignment-guide")).toHaveCount(0);await expect(page.getByRole("img",{name:/عکس شما:/})).toHaveAttribute("src",/^blob:/);await shot(page,"photo-review-no-ghost");
 await expect.poll(()=>page.evaluate(()=>(window as Window&{stoppedPhotoTracks?:number}).stoppedPhotoTracks)).toBeGreaterThan(0);
});
