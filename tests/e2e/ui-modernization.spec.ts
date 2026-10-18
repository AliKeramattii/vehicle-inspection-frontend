import { semanticColor } from "./color-helpers";
import { chooseDemoLocation } from "./location-helpers";
import {test,expect,type Page} from "@playwright/test";
import {mkdir} from "node:fs/promises";
import {photography,mockCamera,snapshotReady} from "./photography-helpers";
import {packageWorkflow,mockRecorder,recordedState} from "./capture-package-helpers";
import {seedQueue} from "./upload-helpers";
import {submissionWorkflow} from "./submission-helpers";
const failures=new WeakMap<Page,string[]>();
const renders=".agent/reference-review/modernization";
test.beforeEach(async({page})=>{
 await mkdir(renders,{recursive:true});
 const errors:string[]=[];failures.set(page,errors);
 page.on("pageerror",e=>errors.push(e.stack??e.message));
 page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
 page.on("response",r=>{if(r.status()>=400)errors.push(r.status()+" "+r.url());});
});
test.afterEach(({page})=>expect(failures.get(page)??[],"Console/page/resource errors").toEqual([]));
async function screenshot(page:Page,name:string){await snapshotReady(page);await page.screenshot({path:`${renders}/${name}.png`});}
async function viewport(page:Page){
 expect(await page.evaluate(()=>({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight,iw:innerWidth,ih:innerHeight}))).toMatchObject(await page.evaluate(()=>({w:innerWidth,h:innerHeight})));
}
test("live photography preserves navigation, colors, success and below-image controls",async({page},info)=>{
 test.skip(info.project.name!=="customer");
 const errors:string[]=[];page.on("pageerror",e=>errors.push(e.stack??e.message));
 await mockCamera(page);await photography(page);
 await page.evaluate(()=>document.documentElement.style.setProperty("--color-primary","#8B3B18"));
 const completed=page.locator(".inspection-journey-header .bg-success").first();
 await expect(completed).toHaveCSS("background-color",await semanticColor(page,"--color-success"));
 for(const [width,height] of [[360,800],[390,844],[430,932]]){
  await page.setViewportSize({width,height});await viewport(page);
  const image=await page.locator(".photography-image").first().boundingBox(),controls=await page.locator(".vehicle-photo-controls").boundingBox();
  expect(controls!.y).toBeGreaterThanOrEqual(image!.y+image!.height);
  for(const b of await page.locator(".vehicle-photo-controls button").evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})))){expect(b.w).toBeGreaterThanOrEqual(44);expect(b.h).toBeGreaterThanOrEqual(44);}
 }
 await page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]').click();
 await expect(page).toHaveURL(/front-45-right\/guide$/);await expect(page.locator(".inspection-reference")).toHaveCount(0);await screenshot(page,"guide-live-policy");
 await page.getByRole("link",{name:"باز کردن دوربین"}).click();await expect(page.locator(".camera-preview video")).toBeVisible();
 await expect(page.locator('input[type="file"]')).toHaveCount(0);await screenshot(page,"live-camera");
 await page.getByRole("button",{name:"ثبت عکس"}).click();await expect(page).toHaveURL(/front-45-right\/review$/);await expect(page.getByRole("checkbox")).toHaveCount(0);
 expect(errors).toEqual([]);
});
test("manual address and ten-color vehicle selection persist through repository",async({page},info)=>{
 test.skip(info.project.name!=="customer");await page.goto("/");
 await page.getByRole("textbox",{name:"کد معرفی / کد ارجاع"}).fill("A4K9P2");await page.getByRole("button",{name:"شروع بازدید"}).click();await screenshot(page,"otp-branding");
 await page.getByRole("textbox",{name:"کد تأیید پنج‌رقمی"}).fill("12345");await page.getByRole("button",{name:"همه چیز آماده است"}).click();await page.getByRole("checkbox").check();await page.getByRole("button",{name:"تأیید و ادامه"}).click();
 await expect(page.getByText("نقشه هنوز پیکربندی نشده است")).toBeVisible();await expect(page.getByText("موقعیت شما با GPS تطبیق داده شد")).toHaveCount(0);
 await chooseDemoLocation(page);await page.getByRole("button",{name:"تأیید این موقعیت"}).click();
 const color=page.getByRole("combobox",{name:"رنگ بدنه"});await expect(color.locator("option")).toHaveCount(10);await color.selectOption("blue");
 await page.getByRole("button",{name:"تأیید مشخصات و ادامه"}).click();await expect(page).toHaveURL(/\/capture$/);await page.goto("/inspection/insp_demo/vehicle");await expect(color).toHaveValue("blue");await screenshot(page,"vehicle-color-persisted");
});
test("walk-around uses live recording, neutral kit guidance and clean review",async({page},info)=>{
 test.skip(info.project.name!=="customer");await mockRecorder(page);await packageWorkflow(page,{kilometers:48320});
 await page.getByRole("link",{name:"ادامه به ویدیوی ۳۶۰ درجه"}).click();await expect(page.locator('input[type="file"]')).toHaveCount(0);
 await page.getByRole("button",{name:"راهنمای ضبط ویدیو"}).click();await expect(page.getByRole("dialog")).toBeVisible();await page.getByRole("button",{name:"بستن",exact:true}).click();
 await screenshot(page,"360-live-ready");await recordedState(page);
 expect(await page.locator("video").evaluate(e=>Boolean((e as HTMLVideoElement).srcObject))).toBe(true);
 await expect(page.getByText(/۶۵٪|65%/)).toHaveCount(0);
 for(const [width,height] of [[360,800],[390,844],[430,932]]){await page.setViewportSize({width,height});await viewport(page);await screenshot(page,"360-live-recording-"+width);}
 await page.clock.resume();await page.getByRole("button",{name:"پایان ضبط"}).click();await expect(page.locator("video[controls]")).toBeVisible();await screenshot(page,"360-live-review");
 expect(await page.evaluate(()=>(window as Window&{stoppedPhotoTracks?:number}).stoppedPhotoTracks)).toBeGreaterThan(0);
});
test("unsupported recorder has recovery and no gallery fallback",async({page},info)=>{
 test.skip(info.project.name!=="customer");await mockRecorder(page);await packageWorkflow(page,{kilometers:48320});await page.getByRole("link",{name:"ادامه به ویدیوی ۳۶۰ درجه"}).click();
 await page.evaluate(() => Object.defineProperty(window,"MediaRecorder",{configurable:true,value:undefined}));await page.getByRole("button",{name:"فعال کردن دوربین"}).click();await expect(page.locator(".video-capture [role=alert]")).toContainText("پشتیبانی");await expect(page.locator('input[type="file"]')).toHaveCount(0);await screenshot(page,"360-live-unavailable");
});
test("optional mobile GLB has twelve fixed capture-aware markers and no reload on toggle",async({page},info)=>{
 test.skip(info.project.name!=="customer"||process.env.UI_REFINEMENT_DEV!=="1","Explicit local licensed development preview only");
 let downloads=0;page.on("response",r=>{if(r.url().includes("/api/development/vehicle-model/mobile"))downloads++;});
 await packageWorkflow(page,{kilometers:48320,video:"accepted"});expect(downloads).toBe(0);await page.getByRole("button",{name:"3D",exact:true}).click();
 await expect(page.locator(".fixed-inspection-marker")).toHaveCount(12,{timeout:60000});await expect(page.locator(".fixed-inspection-marker").first()).toHaveAttribute("data-state","complete");
 await seedQueue(page,"complete");await expect(page.locator(".fixed-inspection-marker").first()).toHaveAttribute("data-state","complete");
 await page.evaluate(async()=>{const r=indexedDB.open("inspection-upload-queue",1);const db=await new Promise<IDBDatabase>(ok=>r.onsuccess=()=>ok(r.result));await new Promise<void>(ok=>{const tx=db.transaction("jobs","readwrite"),store=tx.objectStore("jobs"),read=store.getAll();read.onsuccess=()=>{const j=read.result.find((j:{requirementId:string})=>j.requirementId==="front-45-right");store.put({...j,verification:"retake-requested",reviewerReason:"پلاک خوانا نیست."});};tx.oncomplete=()=>ok();});db.close();});
 await expect(page.locator('[data-requirement="front-45-right"].fixed-inspection-marker')).toHaveAttribute("data-state","attention");
 const positions=()=>page.locator(".fixed-inspection-marker").evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height];}));
 const before=await positions(),canvas=await page.locator("canvas").boundingBox();await page.mouse.move(canvas!.x+canvas!.width/2,canvas!.y+canvas!.height/2);await page.mouse.down();await page.mouse.move(canvas!.x+canvas!.width/2+60,canvas!.y+canvas!.height/2+20,{steps:8});await page.mouse.up();await page.mouse.wheel(0,-160);expect(await positions()).toEqual(before);
 for(const name of ["عقب","بالا","جلو","چپ","راست"]){await page.getByRole("button",{name:"نمای خودرو: "+name,exact:true}).click();}
 await page.getByRole("button",{name:"2D",exact:true}).click();await page.getByRole("button",{name:"3D",exact:true}).click();expect(downloads).toBe(1);await screenshot(page,"3d-uploaded-and-attention");
 await page.locator('.fixed-inspection-marker[data-requirement="front-45-right"]').click();await expect(page.locator(".marker-guidance")).toContainText("پلاک خوانا نیست.");await expect(page).toHaveURL(/\/capture$/);await page.getByRole("button",{name:"مشاهده عکس ثبت‌شده"}).click();await expect(page).toHaveURL(/front-45-right\/review$/);
});
test("admin assignment and exact reviewer rejection reuse the scoped customer request",async({page},info)=>{
 test.skip(info.project.name!=="desktop");
 await submissionWorkflow(page);
 for(const [width,height] of [[360,800],[390,844],[430,932]]){await page.setViewportSize({width,height});await viewport(page);await screenshot(page,"summary-"+width);}
 await page.getByRole("link",{name:"مرکز ارسال آمادگی ارسال"}).click();await expect(page.getByRole("heading",{name:"همگام‌سازی فایل‌ها"})).toBeVisible();await screenshot(page,"upload-center-shared-branding");
 await page.goBack();await expect(page.getByRole("heading",{name:"آماده ارسال",exact:true})).toBeVisible();await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);
 for(const [width,height] of [[360,800],[390,844],[430,932]]){await page.setViewportSize({width,height});await viewport(page);await screenshot(page,"receipt-"+width);}
 await page.setViewportSize({width:1440,height:960});
 await page.goto("/admin/assignments");await page.getByRole("combobox",{name:"ارجاع BDI-8F31K2"}).selectOption("reviewer-demo");await expect(page.locator(".admin-audit-list")).toContainText("علی محمدی");
 for(const [width,height] of [[1440,960],[1280,800],[1024,768]]){await page.setViewportSize({width,height});await viewport(page);await screenshot(page,"assignment-"+width);}
 await page.goto("/reviewer");await expect(page.getByRole("link",{name:"مشاهده پرونده"})).toBeVisible();await screenshot(page,"reviewer-queue");
 await page.getByRole("link",{name:"مشاهده پرونده"}).click();await expect(page.locator(".review-evidence-media")).toBeVisible();
 for(const [width,height] of [[1440,960],[1280,800],[1024,768]]){await page.setViewportSize({width,height});await viewport(page);await screenshot(page,"reviewer-workspace-"+width);}
 await page.getByLabel("دلیل درخواست ثبت مجدد").fill("پلاک خوانا نیست.");await page.getByRole("button",{name:"درخواست ثبت مجدد",exact:true}).click();await expect(page.getByText("نیاز به مدرک تکمیلی",{exact:true})).toBeVisible();
 const request=await page.evaluate(async()=>{const r=indexedDB.open("inspection-evidence-requests",1),db=await new Promise<IDBDatabase>(ok=>r.onsuccess=()=>ok(r.result));const rows=await new Promise<{id:string;items:{requirementId:string;reviewerReason:string}[]}[]>(ok=>{const tx=db.transaction("requests"),read=tx.objectStore("requests").getAll();tx.oncomplete=()=>ok(read.result);});db.close();return rows[0];});
 expect(request.items).toHaveLength(1);expect(request.items[0].reviewerReason).toBe("پلاک خوانا نیست.");
 await page.getByRole("combobox",{name:"کارشناس نمونه"}).selectOption("reviewer-sara");await expect(page.getByText("این پرونده در صف شما نیست.")).toBeVisible();
 await page.goto("/inspection/insp_demo/additional-evidence/"+encodeURIComponent(request.id));await expect(page.getByText("پلاک خوانا نیست.")).toBeVisible();await expect(page.locator('input[type="file"]')).toHaveCount(0);await screenshot(page,"additional-evidence-reviewer-request");
});
