import {test,expect,type Page} from "@playwright/test";
import {inspectionPhotographyTemplate as template} from "../../src/features/photography/inspection-template";
import {vehicleIdentificationGuides} from "../../src/features/photography/vehicle-identification-guides";
import {enterPhotography,fixtureInspectionId,seedPhotos,mockCamera,snapshotReady} from "../e2e/photography-helpers";
import {packageWorkflow,mockRecorder,recordedState} from "../e2e/capture-package-helpers";
import {submissionWorkflow,submissionRecord} from "../e2e/submission-helpers";
import {requestNamespace,requestDatabase,type EvidenceRequest,additionalRoutes} from "../../src/features/additional-evidence/request-model";
import {photoKey,photoNamespace} from "../../src/lib/media/photo-store";

async function setup(page:Page){
 await page.goto("/");await seedPhotos(page,11,undefined,undefined,template);
 const id=await fixtureInspectionId(page),namespace=photoNamespace(id,template.templateId,template.templateVersion);
 await page.evaluate(async key=>{const db=await new Promise<IDBDatabase>(r=>{const q=indexedDB.open("inspection-photos",1);q.onsuccess=()=>r(q.result);});await new Promise<void>(r=>{const t=db.transaction("photos","readwrite");t.objectStore("photos").delete(key);t.oncomplete=()=>r();});db.close();},photoKey(namespace,"spec-plate"));
 await enterPhotography(page);await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax","11");await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","10");
 return {id,namespace,capture:`/inspection/${id}/capture`};
}
async function durable(page:Page,key:string){return page.evaluate(async key=>{const db=await new Promise<IDBDatabase>(r=>{const q=indexedDB.open("inspection-photos",1);q.onsuccess=()=>r(q.result);});const result=await new Promise<{alternativeId?:string;selectedAlternativeId?:string;revisionId?:string;draft?:{alternativeId?:string};blob?:Blob}|undefined>(r=>{const t=db.transaction("photos");const q=t.objectStore("photos").get(key);t.oncomplete=()=>r(q.result);});db.close();return result?{alternativeId:result.alternativeId,selectedAlternativeId:result.selectedAlternativeId,revisionId:result.revisionId,draft:result.draft?{alternativeId:result.draft.alternativeId}:undefined,size:result.blob?.size}:undefined;},key);}
for(const choice of vehicleIdentificationGuides)test(`${choice.id}: ten fixed + one choice survives refresh, capture and review`,async({page})=>{
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));await mockCamera(page,choice.src);
 const {capture,namespace}=await setup(page);await page.goto(capture+"/photo/spec-plate/guide");
 await expect(page.getByRole("button",{name:/پیشنهاد/})).toHaveCount(4);await expect(page.getByRole("link",{name:"باز کردن دوربین"})).toHaveCount(0);
 await page.getByRole("button",{name:choice.title,exact:true}).click();await expect(page.locator(".identification-selected")).toContainText(choice.shortTitle);
 await page.reload();await expect(page.locator(".identification-selected")).toContainText(choice.shortTitle);
 expect((await durable(page,photoKey(namespace,"spec-plate")))?.selectedAlternativeId).toBe(choice.id);
 await snapshotReady(page);if(choice.id==="pillar")await page.screenshot({path:".agent/reference-review/photo-policy-v2/guide-390.png"});
 await page.getByRole("link",{name:"باز کردن دوربین"}).click();await expect(page.getByRole("button",{name:"ثبت عکس",exact:true})).toBeEnabled();await page.getByRole("button",{name:"ثبت عکس",exact:true}).click();
 await expect(page).toHaveURL(/spec-plate\/review$/);await expect(page.getByRole("img",{name:/نمونه صحیح:/})).toHaveAttribute("src",new RegExp(choice.src.split("/").at(-1)!.replaceAll(".","\\.")));
 expect((await durable(page,photoKey(namespace,"spec-plate")))?.draft?.alternativeId).toBe(choice.id);
 await page.getByRole("button",{name:"تأیید و ادامه",exact:true}).click();await expect(page).toHaveURL(/section\/engine-details$/);await page.goto(capture);await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","11");
 await page.locator(".photography-categories button").nth(2).click();await expect(page.locator(".photography-selected-heading")).toBeVisible();
 const saved=await durable(page,photoKey(namespace,"spec-plate"));expect(saved?.alternativeId).toBe(choice.id);expect(saved?.draft).toBeUndefined();expect(saved?.size).toBeGreaterThan(0);
 const card=page.locator('.photography-shot-card[data-requirement="spec-plate"]');await card.click();await expect(page.locator(".photography-selected-heading")).toContainText(choice.shortTitle);
 const image=await page.locator(".vehicle-photo-scene .photography-image").boundingBox(),controls=await page.locator(".vehicle-photo-controls").boundingBox();expect(controls!.y).toBeGreaterThanOrEqual(image!.y+image!.height);
 await page.reload();await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","11");expect(errors).toEqual([]);
});

test("responsive eleven-photo overview and option selection, no document overflow",async({page})=>{
 const {capture}=await setup(page);
 for(const [width,height]of [[320,568],[360,800],[390,844],[430,932],[768,1024]]){
  await page.setViewportSize({width,height});await page.goto(capture);await snapshotReady(page);
  const bounds=await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,vw:innerWidth,vh:innerHeight}));expect(bounds.w).toBeLessThanOrEqual(bounds.vw);expect(bounds.h).toBeLessThanOrEqual(bounds.vh);
  const image=await page.locator(".vehicle-photo-scene .photography-image").boundingBox(),controls=await page.locator(".vehicle-photo-controls").boundingBox();expect(controls!.y).toBeGreaterThanOrEqual(image!.y+image!.height);
  await page.screenshot({path:`.agent/reference-review/photo-policy-v2/overview-${width}.png`});
  await page.goto(capture+"/photo/spec-plate/guide");await expect(page.getByRole("button",{name:/پیشنهاد/})).toHaveCount(4);await page.screenshot({path:`.agent/reference-review/photo-policy-v2/choices-${width}.png`});if(width===390)await expect(page).toHaveScreenshot("four-location-choices-390.png");
 }
});


test("fresh current overview shows zero of eleven with the same 2D layout",async({page})=>{
 await page.goto("/");await seedPhotos(page,0,undefined,undefined,template);await enterPhotography(page);
 await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax","11");await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow","0");
 await snapshotReady(page);await page.screenshot({path:".agent/reference-review/photo-policy-v2/overview-empty-390.png"});await expect(page).toHaveScreenshot("eleven-photo-overview-390.png");
});


test("eleven photos plus separate video upload and submit, Reviewer sees chosen evidence",async({page})=>{
 await mockCamera(page,vehicleIdentificationGuides[3].src);await submissionWorkflow(page,{},template);
 await expect(page.getByText("۱۱ از ۱۱ تصویر تکمیل شده",{exact:true})).toBeVisible();await expect(page.getByText("۱۲ از ۱۲ فایل ارسال شده",{exact:true})).toBeVisible();
 await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);
 const record=await submissionRecord(page);expect(record.summary!.jobs.filter(j=>j.evidenceKind==="photo")).toHaveLength(11);expect(record.summary!.jobs.filter(j=>j.evidenceKind==="video-360")).toHaveLength(1);
 expect(record.summary!.jobs.find(j=>j.requirementId==="spec-plate")?.alternativeId).toBe("pillar");
 await page.reload();await expect(page).toHaveURL(/submitted$/);await page.goto(`/inspection/${record.inspectionId}/capture/photo/spec-plate/guide`);await expect(page).toHaveURL(/submitted$/);
 await page.setViewportSize({width:1440,height:960});await page.goto("/admin/assignments");await page.getByLabel("ارجاع BDI-8F31K2",{exact:true}).selectOption("reviewer-demo");await page.goto("/reviewer");await page.getByRole("link",{name:"مشاهده پرونده"}).click();
 await page.getByRole("button",{name:/پلاک مشخصات خودرو.*ستون کنار درب راننده/}).click();await expect(page.locator(".review-workspace")).toContainText("ستون کنار درب راننده");
 await page.screenshot({path:".agent/reference-review/photo-policy-v2/reviewer-1440.png"});
 // The existing request mechanism opens this logical group only; all originals stay locked.
 await page.getByLabel("دلیل درخواست ثبت مجدد",{exact:true}).fill("کد خودرو خوانا نیست.");await page.getByRole("button",{name:"درخواست ثبت مجدد",exact:true}).click();
 await expect(page.getByText("تصمیم این نسخه ثبت شد. برای ادامه، مدرک بعدی را انتخاب کنید.")).toBeVisible();
 const request=await page.evaluate(async ({config,id})=>{const db=await new Promise<IDBDatabase>(resolve=>{const q=indexedDB.open(config.name,config.version);q.onsuccess=()=>resolve(q.result);});const requests=await new Promise<EvidenceRequest[]>(resolve=>{const tx=db.transaction(config.records),q=tx.objectStore(config.records).getAll();tx.oncomplete=()=>resolve(q.result);});db.close();return requests.find(r=>r.inspectionId===id)!;},{config:requestDatabase,id:record.inspectionId});
 expect(request.items).toHaveLength(1);expect(request.items[0]).toMatchObject({kind:"photo",requirementId:"spec-plate",reviewerReason:"کد خودرو خوانا نیست."});
 await page.setViewportSize({width:390,height:844});await page.goto(additionalRoutes.photo(record.inspectionId,request.id,"spec-plate","guide"));await expect(page.getByRole("button",{name:/پیشنهاد/})).toHaveCount(4);
 await expect(page.getByText("نیاز به عکاسی مجدد: کد خودرو خوانا نیست.")).toBeVisible();
 await page.getByRole("button",{name:vehicleIdentificationGuides[3].title,exact:true}).click();await page.getByRole("link",{name:"باز کردن دوربین",exact:true}).click();await expect(page.getByRole("button",{name:"ثبت عکس",exact:true})).toBeEnabled();await page.getByRole("button",{name:"ثبت عکس",exact:true}).click();await expect(page).toHaveURL(/spec-plate\/review$/);
 await page.getByRole("button",{name:"تأیید و ادامه",exact:true}).click();await expect(page).toHaveURL(new RegExp(`/additional-evidence/${request.id}$`));
 expect((await durable(page,photoKey(record.summary!.namespace,"spec-plate")))?.alternativeId).toBe("pillar");
 expect((await durable(page,photoKey(requestNamespace(request),"spec-plate")))?.alternativeId).toBe("windshield");
 await expect(page.getByRole("button",{name:"ارسال مدارک تکمیلی",exact:true})).toBeEnabled();
 await page.goto(additionalRoutes.photo(record.inspectionId,request.id,"engine-bay","guide"));await expect(page.getByRole("link",{name:"باز کردن دوربین"})).toHaveCount(0);
});


test("current eleven-photo odometer entry and live recorder remain separate and durable",async({page})=>{
 await mockRecorder(page);await packageWorkflow(page,{},template);await page.getByRole("link",{name:"ثبت کیلومتر فعلی",exact:true}).click();
 await expect(page.locator(".photo-review-capture img")).toBeVisible();await page.getByRole("button",{name:"تأیید و ادامه",exact:true}).click();await expect(page.getByLabel("کیلومتر فعلی")).toHaveAttribute("aria-invalid","true");
 await page.getByLabel("کیلومتر فعلی").fill("۴۸٬۳۲۰");await page.getByRole("button",{name:"تأیید و ادامه",exact:true}).click();await expect(page).toHaveURL(/video\/record$/);
 await recordedState(page);await expect(page.getByLabel("مدت ضبط")).toContainText("۰۰:۲۸");await page.getByRole("button",{name:"پایان ضبط",exact:true}).click();await page.clock.resume();
 await expect(page).toHaveURL(/video\/review$/);await expect(page.locator(".walkaround-review")).toBeVisible();await page.getByRole("button",{name:"تأیید و ذخیره",exact:true}).click();await expect(page).toHaveURL(/capture\/review$/);
 await expect(page.getByText("۱۱ از ۱۱",{exact:false}).first()).toBeVisible();await expect.poll(()=>page.evaluate(()=>(window as Window&{stoppedPhotoTracks?:number}).stoppedPhotoTracks??0)).toBeGreaterThan(0);
});


test("Admin displays eleven logical requirements and the four-choice group without changing historical publications",async({page})=>{
 await page.setViewportSize({width:1440,height:960});await page.goto("/admin/templates/body-image-guided");
 await expect(page.locator(".admin-requirement-list tbody tr")).toHaveCount(11);await page.getByRole("button",{name:"ویرایش پلاک مشخصات خودرو",exact:true}).click();
 await expect(page.locator(".admin-requirement-editor")).toContainText("یکی از چهار محل کد");await expect(page.getByRole("checkbox",{name:"این تصویر الزامی است"})).toBeDisabled();
 await snapshotReady(page);await page.screenshot({path:".agent/reference-review/photo-policy-v2/admin-1440.png"});
});
