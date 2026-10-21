import { test, expect, type Page } from "@playwright/test";
import { photography, enterPhotography, requirements } from "./photography-helpers";
import { captureData, mockRecorder, recordedState } from "./capture-package-helpers";
import { inspectionRoutes } from "../../src/features/inspection/inspection-routes";
import { photoDatabase } from "../../src/lib/media/photo-store";
import { requiredMediaCount } from "../../src/features/upload/upload-model";
import { inspectionPhotographyTemplate as template } from "../../src/features/photography/inspection-template";
import { submissionWorkflow } from "./submission-helpers";
import { mkdir } from "node:fs/promises";

test.beforeEach(async({page})=>{
 await page.route("**/site-bootstrap.json",route=>route.fulfill({json:{schemaVersion:1,tenantId:"demo",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"mock"}}));
 await page.addInitScript(()=>localStorage.setItem("inspection-admin-theme","light"));
});
async function bounded(page:Page){expect(await page.evaluate(()=>({x:document.documentElement.scrollWidth<=innerWidth,y:document.documentElement.scrollHeight<=innerHeight}))).toEqual({x:true,y:true});}

test("full customer camera journey accepts each configured photograph, odometer, video, uploads and persists receipt",async({page},info)=>{
 test.skip(info.project.name!=="customer");test.setTimeout(180000);
 page.setDefaultTimeout(10000);
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
 await mockRecorder(page);await photography(page,0);
 await page.locator(".photography-actions a").click();
 for(const [index,photo] of requirements.entries()){
  await expect(page).toHaveURL(new RegExp("/"+photo.id+"/guide$"));
  const choice=page.locator('[data-guide-option="pillar"]');if(await choice.isVisible())await choice.click();
  await page.getByRole("link",{name:"باز کردن دوربین"}).click();await page.getByRole("button",{name:"ثبت عکس",exact:true}).click();
  await expect(page.locator('.photo-review-capture img')).toBeVisible();await expect(page.getByRole("checkbox")).toHaveCount(0);
  const km=page.getByLabel("کیلومتر فعلی",{exact:true});if(await km.isVisible())await km.fill("۴۸٬۳۲۰");
  await page.getByRole("button",{name:"تأیید و ادامه",exact:true}).click();await expect(page).not.toHaveURL(new RegExp('/'+photo.id+'/review$'));
  await expect.poll(()=>page.evaluate(async(config)=>{const db=await new Promise<IDBDatabase>(resolve=>{const r=indexedDB.open(config.name,config.version);r.onsuccess=()=>resolve(r.result);});try{return await new Promise<number>(resolve=>{const r=db.transaction(config.store).objectStore(config.store).getAll();r.onsuccess=()=>resolve(r.result.filter(row=>row.blob?.size&&!row.draft).length);});}finally{db.close();}},photoDatabase)).toBe(index+1);
  if(page.url().includes("/capture/section/"))await page.locator(".photography-actions a").click();
 }
 expect((await captureData(page))[0].kilometers).toBe(48320);
 await expect(page).toHaveURL(new RegExp("video/record$"));await recordedState(page);await page.clock.resume();await page.getByRole("button",{name:"پایان ضبط",exact:true}).click();await expect(page).toHaveURL(/video\/review$/);
 await page.getByRole("button",{name:"تأیید و ذخیره",exact:true}).click();await page.getByRole("button",{name:"ادامه به ارسال",exact:true}).click();await expect(page).toHaveURL(/\/upload$/);
 const next=page.getByRole("button",{name:"ادامه به بررسی نهایی"});await expect(next).toBeEnabled({timeout:30000});await expect(page.getByRole("progressbar",{name:"فایل‌های ارسال شده"})).toHaveAttribute("aria-valuenow",String(requiredMediaCount(template)));
 await next.click();await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);await page.reload();await expect(page.getByRole("heading",{name:"بازدید با موفقیت ارسال شد"})).toBeVisible();
 await page.goto(inspectionRoutes.photo("insp_demo",requirements[0].id,"camera"));await expect(page).toHaveURL(/submitted$/);await bounded(page);expect(errors).toEqual([]);
});

test("photography controls, selection context and touch targets remain usable across short, tablet and landscape viewports",async({page},info)=>{
 test.skip(info.project.name!=="customer");await photography(page,2);
 for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[768,1024],[844,390]]){
  await page.setViewportSize({width,height});await bounded(page);
  const controls=page.locator('.vehicle-photo-controls');await controls.scrollIntoViewIfNeeded();
  const image=(await page.locator('.vehicle-photo-scene .photography-image').boundingBox())!,box=(await controls.boundingBox())!;expect(box.y).toBeGreaterThanOrEqual(image.y+image.height);
  for(const target of await controls.getByRole('button').all()){const b=(await target.boundingBox())!;expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);}
  const card=page.locator('.photography-shot-card[data-requirement="front-plate"]');await card.click();await expect(page.locator('.photography-selection-context')).toContainText("ثبت نشده");await expect(page.locator('.photography-primary')).toContainText("پلاک");
  await page.getByRole('button',{name:'عکس باقی‌مانده بعدی'}).click();await expect(page.locator('.photography-shot-card[aria-pressed=true]')).toHaveAttribute('data-requirement','front-45-left');
  const marker=page.locator('.vehicle-photo-marker[aria-pressed=true]');await marker.focus();await expect(marker).toBeFocused();expect(await marker.evaluate(e=>getComputedStyle(e).outlineStyle)).not.toBe('none');const hit=(await marker.boundingBox())!;expect(hit.width).toBeGreaterThanOrEqual(44);expect(hit.height).toBeGreaterThanOrEqual(44);
 }
});

test("Admin palette and HEX edit one draft, native dialog restores focus and customer publication remains explicit",async({page},info)=>{
 test.skip(info.project.name!=="desktop");await page.goto('/admin/site-settings');await page.getByRole('tab',{name:'رنگ‌بندی',exact:true}).click();
 const hex=page.getByLabel('رنگ اصلی',{exact:true}),picker=page.getByLabel('رنگ اصلی، انتخاب از پالت',{exact:true});await picker.fill('#164e63');await expect(hex).toHaveValue('#164E63');await expect(page.getByRole('button',{name:'ذخیره پیش‌نویس',exact:true})).toBeEnabled();
 await hex.fill('#0369A1');await expect(picker).toHaveValue('#0369a1');
 const preview=page.getByRole('button',{name:'پیش‌نمایش',exact:true});await preview.click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('button',{name:'بستن',exact:true}).locator('svg')).toBeVisible();await page.keyboard.press('Escape');await expect(preview).toBeFocused();await expect(hex).toHaveValue('#0369A1');await bounded(page);
 await mkdir('.agent/reference-review/final-ui-ux/after',{recursive:true});await page.screenshot({path:'.agent/reference-review/final-ui-ux/after/admin-color-editor-1440.png'});
});

test("Reviewer evidence context separates file state and human decisions with keyboard-accessible details",async({page},info)=>{
 test.skip(info.project.name!=="desktop");await submissionWorkflow(page);await page.getByRole('button',{name:'ارسال برای بررسی',exact:true}).click();await expect(page).toHaveURL(/submitted$/);await page.goto('/admin/assignments');await page.getByLabel('ارجاع BDI-8F31K2',{exact:true}).selectOption('reviewer-demo');await page.goto('/reviewer');await page.getByRole('link',{name:'مشاهده پرونده'}).click();
 await expect(page.locator('.review-selected-metadata')).toContainText('تصویر ثبت‌شده');await expect(page.getByText('تصمیم کارشناس: هنوز بررسی نشده',{exact:true})).toBeVisible();
 const details=page.getByRole('button',{name:'اطلاعات پرونده',exact:true});await details.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(details).toBeFocused();await page.getByRole('button',{name:'مدرک بعدی',exact:true}).click();await expect(page.locator('.review-current-evidence')).toContainText(requirements[1].title);await bounded(page);
});
test("refresh restores a verified draft; expired identity requires reauthentication without losing evidence",async({page},info)=>{
 test.skip(info.project.name!=="customer");await photography(page,1);await page.reload();await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","1");
 await page.evaluate(()=>{for(const key of Object.keys(sessionStorage).filter(key=>key.startsWith("inspection-mock-session:"))){const session=JSON.parse(sessionStorage.getItem(key)!);session.expiresAt=Date.now()-1;sessionStorage.setItem(key,JSON.stringify(session));}});
 await page.reload();await expect(page.getByText("برای مشاهده این بازدید، هویت خود را از مسیر کارگزاری تأیید کنید.")).toBeVisible();await page.getByRole("link",{name:"تأیید هویت و ادامه"}).click();await enterPhotography(page);await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","1");await expect(page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]')).toHaveAttribute("data-state","complete");
});
