import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { chooseDemoLocation } from "./location-helpers";
import { photography, mockCamera } from "./photography-helpers";
import { packageWorkflow, mockRecorder, recordedState } from "./capture-package-helpers";
import { uploadWorkflow } from "./upload-helpers";
import { submissionWorkflow } from "./submission-helpers";
import { requestedWorkflow } from "./additional-evidence-helpers";
const folder = ".agent/reference-review/final-ui-ux/" + (process.env.FINAL_UI_REVIEW ?? "after");
const customer = [[320,568],[360,800],[390,844],[430,932],[768,1024]], operations = [[1024,768],[1280,800],[1440,960],[1920,1080]];
test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "customer", "The review explicitly sets all customer and operations viewports");
  test.setTimeout(180000); await mkdir(folder,{recursive:true});
  await page.route("**/site-bootstrap.json", route=>route.fulfill({json:{schemaVersion:1,tenantId:"demo",apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"mock"}}));
  await page.addInitScript(()=>{if(!localStorage.getItem("inspection-admin-theme"))localStorage.setItem("inspection-admin-theme","light");});
});
async function capture(page:Page,name:string,sizes=customer) {
  const rows=[];
  for(const [width,height] of sizes){
    await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);
    await page.locator('img').evaluateAll(images=>Promise.all(images.map(image=>{(image as HTMLImageElement).loading="eager";return (image as HTMLImageElement).decode().catch(()=>null);})));
    await page.evaluate(()=>{for(const selector of [".customer-viewport>main",".consent-scroll",".summary-scroll",".receipt-content",".photo-scroll",".upload-list-scroll",".additional-scroll"])document.querySelectorAll(selector).forEach(node=>{node.scrollTop=0;});});
    rows.push(await page.evaluate(({width,height})=>({width,height,overflow:{x:document.documentElement.scrollWidth>innerWidth,y:document.documentElement.scrollHeight>innerHeight},actions:[...document.querySelectorAll<HTMLElement>('.bottom-sticky-cta button,.bottom-sticky-cta a,.photography-primary,.camera-shutter,.recorder-record')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({text:e.textContent?.trim(),box:e.getBoundingClientRect().toJSON()}))}),{width,height}));
    await page.screenshot({path:folder+"/"+name+"-"+width+".png"});
  }
  await writeFile(folder+"/"+name+".json",JSON.stringify(rows,null,2));
  await page.setViewportSize({width:390,height:844});
}

test("final UI review: setup and selected photography",async({page})=>{
  await page.goto("/");await expect(page.getByLabel("کد معرفی / کد ارجاع")).toBeVisible();await capture(page,"landing");
  await page.getByLabel("کد معرفی / کد ارجاع").fill("A4K9P2");await page.getByRole("button",{name:"شروع بازدید"}).click();await expect(page.getByLabel("کد تأیید پنج‌رقمی")).toBeVisible();await capture(page,"otp");
  await page.getByLabel("کد تأیید پنج‌رقمی").fill("12345");await expect(page.getByRole("button",{name:"همه چیز آماده است"})).toBeEnabled();await capture(page,"readiness");
  await page.getByRole("button",{name:"همه چیز آماده است"}).click();await expect(page.getByRole("checkbox")).toBeVisible();await capture(page,"consent");
  await page.getByRole("checkbox").check();await page.getByRole("button",{name:"تأیید و ادامه"}).click();await chooseDemoLocation(page);await capture(page,"location");
  await page.getByRole("button",{name:"تأیید این موقعیت"}).click();await expect(page.getByRole("button",{name:"تأیید مشخصات و ادامه"})).toBeVisible();await capture(page,"vehicle");
  await page.getByRole("button",{name:"تأیید مشخصات و ادامه"}).click();await expect(page.getByRole("progressbar")).toBeVisible();await capture(page,"photography-empty");
});

test("final UI review: live photo and walkaround boundaries",async({page})=>{
  await mockCamera(page);await photography(page,0);await page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]').click();await expect(page.getByRole("heading",{name:"راهنمای عکاسی"})).toBeVisible();await capture(page,"photo-guidance");
  await page.getByRole("link",{name:"باز کردن دوربین"}).click();await expect(page.getByRole("button",{name:"ثبت عکس"})).toBeEnabled();await capture(page,"camera");
  await page.getByRole("button",{name:"ثبت عکس"}).click();await expect(page.getByRole("button",{name:"تأیید و ادامه"})).toBeVisible();await capture(page,"photo-review");
  await mockRecorder(page);await packageWorkflow(page,{kilometers:48320});await page.getByRole("link",{name:"ادامه به ویدیوی ۳۶۰ درجه"}).click();await capture(page,"video-ready");
  await recordedState(page);await capture(page,"video-recording",[[390,844],[430,932]]);await page.clock.resume();await page.getByRole("button",{name:"پایان ضبط"}).click();await expect(page).toHaveURL(/video\/review$/);await capture(page,"video-review");
});

test("final UI review: upload readiness receipt and retake",async({page})=>{
  await uploadWorkflow(page,"mixed");await capture(page,"upload-mixed");
  await submissionWorkflow(page);await capture(page,"summary");await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);await capture(page,"receipt");
});

test("final UI review: additional evidence",async({page})=>{
  await requestedWorkflow(page);await expect(page.getByRole("heading",{name:"مدارک تکمیلی",exact:true})).toBeVisible();await capture(page,"retake");
});

test("final UI review: Admin configuration and Reviewer decisions",async({page})=>{
  await page.goto("/admin");await expect(page.getByRole("heading",{name:"داشبورد",exact:true})).toBeVisible();await capture(page,"admin-dashboard",operations);
  await page.goto("/admin/site-settings");await expect(page.getByLabel("نام کارگزاری",{exact:true})).toBeVisible();await capture(page,"admin-settings",operations);
  await page.getByRole("button",{name:"پیش‌نمایش",exact:true}).click();await expect(page.getByRole("dialog")).toBeVisible();await capture(page,"branding-preview",[[390,844],[1440,960]]);await page.getByRole("button",{name:"بستن پیش‌نمایش"}).click();
  await page.getByRole("switch",{name:"پوسته تیره"}).check();await capture(page,"admin-settings-dark",operations);
  await submissionWorkflow(page);await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);await page.setViewportSize({width:1440,height:960});await page.goto("/admin/assignments");await page.getByLabel("ارجاع BDI-8F31K2",{exact:true}).selectOption("reviewer-demo");
  await page.goto("/reviewer");await page.getByRole("switch",{name:"پوسته تیره"}).uncheck();await expect(page.getByRole("link",{name:"مشاهده پرونده"})).toBeVisible();await capture(page,"reviewer-queue",operations);
  await page.getByRole("link",{name:"مشاهده پرونده"}).click();await expect(page.locator(".review-thumbnail img").first()).toBeVisible();await capture(page,"reviewer-evidence",operations);
  await page.getByRole("textbox",{name:"دلیل درخواست ثبت مجدد"}).fill("پلاک خوانا نیست.");await capture(page,"reviewer-retake",[[390,844],[768,1024],[1440,960]]);
});
