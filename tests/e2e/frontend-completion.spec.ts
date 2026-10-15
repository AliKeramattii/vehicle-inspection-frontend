import {test,expect} from "@playwright/test";
import {submissionWorkflow,submissionRecord} from "./submission-helpers";
import {seedCandidates,openRequest} from "./additional-evidence-helpers";
import type {EvidenceRequest} from "../../src/features/additional-evidence/request-model";
import {mockRecorder,packageWorkflow,openPackageReview,recordedState,captureData} from "./capture-package-helpers";
import {inspectionPhotographyTemplate} from "../../src/features/photography/inspection-template";

test("Site Settings conflict reload fetches the latest persisted draft before resetting",async({page,context},info)=>{
 test.skip(info.project.name!=="desktop","Two-tab Admin recovery");
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/admin/site-settings");await expect(page.getByLabel("نام کارگزاری",{exact:true})).toBeVisible();
 const second=await context.newPage();
 try {
  await second.goto("/admin/site-settings");await second.getByLabel("نام کارگزاری",{exact:true}).fill("پیش‌نویس پنجره دوم");
  await page.getByLabel("نام کارگزاری",{exact:true}).fill("نسخه تازه پنجره اول");
  await page.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(page.getByText("پیش‌نویس محلی ذخیره شد.",{exact:true})).toBeVisible();
  await second.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(second.getByRole("alert").filter({hasText:"تنظیمات در پنجره دیگری تغییر کرده است."})).toBeVisible();
  await expect(second.getByLabel("نام کارگزاری",{exact:true})).toHaveValue("پیش‌نویس پنجره دوم");
  await second.evaluate(()=>{
    const open=indexedDB.open.bind(indexedDB);
    (window as Window & {restoreSettingsOpen?:()=>void}).restoreSettingsOpen=()=>Object.defineProperty(indexedDB,"open",{configurable:true,value:open});
    Object.defineProperty(indexedDB,"open",{configurable:true,value:(name:string,version?:number)=>{
      if(name!=="inspection-site-settings")return open(name,version);
      const request:{onerror?:()=>void}={};queueMicrotask(()=>request.onerror?.());return request as unknown as IDBOpenDBRequest;
    }});
  });
  await second.getByRole("button",{name:"بارگذاری نسخه تازه",exact:true}).click();
  await second.getByRole("button",{name:"ادامه بدون ذخیره",exact:true}).click();
  await expect(second.getByRole("alert").filter({hasText:"خواندن نسخه تازه ممکن نشد."})).toBeVisible();
  await expect(second.getByLabel("نام کارگزاری",{exact:true})).toHaveValue("پیش‌نویس پنجره دوم");
  await second.evaluate(()=>(window as Window & {restoreSettingsOpen?:()=>void}).restoreSettingsOpen?.());
  await second.getByRole("button",{name:"بارگذاری نسخه تازه",exact:true}).click();
  await second.getByRole("button",{name:"ادامه بدون ذخیره",exact:true}).click();
  await expect(second.getByLabel("نام کارگزاری",{exact:true})).toHaveValue("نسخه تازه پنجره اول");
  await second.getByLabel("نام کارگزاری",{exact:true}).fill("نسخه پس از بازیابی");
  await second.getByRole("button",{name:"ذخیره پیش‌نویس",exact:true}).click();
  await expect(second.getByText("پیش‌نویس محلی ذخیره شد.",{exact:true})).toBeVisible();
  await second.reload();await expect(second.getByLabel("نام کارگزاری",{exact:true})).toHaveValue("نسخه پس از بازیابی");
  expect(errors).toEqual([]);
 } finally {await second.close();}
});

// Approved preservation rule: normal customer headers hide the ID; the receipt retains it LTR.
test("customer reference stays private in capture headers and readable on the durable receipt",async({page},info)=>{
 test.skip(info.project.name!=="customer","Customer reference contract");
 await submissionWorkflow(page);await page.getByRole("link",{name:"مشاهده تصاویر بازدید"}).click();
 await expect(page).toHaveURL(/capture$/);
 await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax",String(inspectionPhotographyTemplate.sections.flatMap(s=>s.photoRequirements).filter(p=>p.required).length));
 await expect(page.locator(".capture-reference")).toHaveCount(0);
 await expect(page.getByText("BDI-8F31K2",{exact:true})).toHaveCount(0);
 await page.goBack();await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();
 await expect(page).toHaveURL(/submitted$/);await expect(page.locator(".receipt-reference bdi")).toHaveText("BDI-8F31K2");await expect(page.locator(".receipt-reference bdi")).toHaveAttribute("dir","ltr");
 await page.reload();await expect(page.locator(".receipt-reference bdi")).toHaveText("BDI-8F31K2");
});

test("submitted customer, assigned reviewer and two exact retake rounds share durable evidence history",async({page},info)=>{
 test.skip(info.project.name!=="desktop","Cross-feature operations and customer flow");
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 const requests=()=>page.evaluate(async()=>{const open=indexedDB.open("inspection-evidence-requests",1);const db=await new Promise<IDBDatabase>((resolve,reject)=>{open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error);});try{return await new Promise<EvidenceRequest[]>((resolve,reject)=>{const tx=db.transaction("requests"),read=tx.objectStore("requests").getAll();tx.oncomplete=()=>resolve(read.result);tx.onabort=()=>reject(tx.error);});}finally{db.close();}});
 await submissionWorkflow(page);await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);
 const original=await submissionRecord(page);
 await page.goto("/admin/assignments");const assignment=page.getByLabel("ارجاع BDI-8F31K2",{exact:true});await assignment.selectOption("reviewer-demo");await expect(assignment.locator("xpath=ancestor::tr").locator("td").nth(3)).toHaveText("علی محمدی");
 await page.goto("/reviewer/cases/insp_demo");await expect(page.locator(".review-main-frame img")).toBeVisible();
 await page.getByLabel("دلیل درخواست ثبت مجدد").fill("نور تصویر جلو کافی نیست.");await page.getByRole("button",{name:"درخواست ثبت مجدد",exact:true}).click();await expect(page.getByText("تصمیم این نسخه ثبت شد. برای ادامه، مدرک بعدی را انتخاب کنید.")).toBeVisible();
 await expect.poll(async()=>(await requests()).length).toBe(1);let list=await requests();expect(list).toHaveLength(1);const first=list[0];expect(first.items).toHaveLength(1);expect(first.items[0]).toMatchObject({kind:"photo",requirementId:"front-45-right",reviewerReason:"نور تصویر جلو کافی نیست."});
 await openRequest(page,first);await seedCandidates(page,first,1,"complete");await page.getByRole("button",{name:"ارسال مدارک تکمیلی",exact:true}).click();await expect(page.getByRole("heading",{name:"مدارک تکمیلی با موفقیت ارسال شد",exact:true})).toBeVisible();
 await page.goto("/reviewer/cases/insp_demo");await expect(page.getByRole("button",{name:"تأیید مدرک",exact:true})).toBeEnabled();await page.getByRole("button",{name:"تأیید مدرک",exact:true}).click();await expect(page.locator(".review-workspace-counts")).toContainText("۱ تأیید");
 await page.getByRole("button",{name:"مدرک بعدی",exact:true}).click();await page.getByLabel("دلیل درخواست ثبت مجدد").fill("تصویر عقب تار است.");await page.getByRole("button",{name:"درخواست ثبت مجدد",exact:true}).click();await expect(page.locator(".review-decisions")).toContainText("تصویر عقب تار است.");
 await expect.poll(async()=>(await requests()).length).toBe(2);list=await requests();expect(list).toHaveLength(2);const next=list.find(r=>r.id!==first.id)!;expect(next.round).toBe(2);expect(next.items).toHaveLength(1);expect(next.items[0]).toMatchObject({kind:"photo",requirementId:"back-45-right",reviewerReason:"تصویر عقب تار است."});
 expect(await submissionRecord(page)).toEqual(original);await page.getByLabel("کارشناس نمونه").selectOption("reviewer-sara");await expect(page.getByText("این پرونده در صف شما نیست.")).toBeVisible();expect(errors).toEqual([]);
});

test("live video replacement survives a save failure, retains accepted bytes and releases media",async({page},info)=>{
 test.skip(info.project.name!=="customer","Camera lifecycle fixture, no physical camera");
 await mockRecorder(page);await packageWorkflow(page,{kilometers:48320,video:"accepted"});await openPackageReview(page);await page.getByRole("link",{name:"مشاهده ویدیو",exact:true}).click();
 const before=(await captureData(page))[0].acceptedBytes;await page.getByRole("button",{name:"ضبط مجدد",exact:true}).click();await recordedState(page);await page.clock.resume();await page.getByRole("button",{name:"پایان ضبط",exact:true}).click();await expect(page).toHaveURL(/video\/review$/);
 expect((await captureData(page))[0]).toMatchObject({acceptedBytes:before,draftBytes:before});
 await page.evaluate(()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args:Parameters<IDBObjectStore["put"]>){if(this.name==="packages"){IDBObjectStore.prototype.put=put;throw new DOMException("controlled quota failure","QuotaExceededError");}return Reflect.apply(put,this,args);};});
 await page.getByRole("button",{name:"تأیید و ذخیره",exact:true}).click();await expect(page.getByRole("alert").filter({hasText:"ذخیره اطلاعات ممکن نشد"})).toBeVisible();expect((await captureData(page))[0]).toMatchObject({acceptedBytes:before,draftBytes:before});
 await page.getByRole("button",{name:"تأیید و ذخیره",exact:true}).click();await expect(page).toHaveURL(/capture\/review$/);expect((await captureData(page))[0]).toMatchObject({acceptedBytes:before,draftBytes:0});expect(await page.evaluate(()=>(window as Window & {stoppedPhotoTracks?:number}).stoppedPhotoTracks)).toBeGreaterThan(0);
});
