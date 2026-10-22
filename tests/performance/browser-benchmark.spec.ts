import {test,expect,type Page,type CDPSession} from "@playwright/test";
import {writeFile,mkdir,readFile,readdir} from "node:fs/promises";
import {gzipSync} from "node:zlib";
import {join} from "node:path";
import {photography,mockCamera,fixtureInspectionId} from "../e2e/photography-helpers";
import {submissionWorkflow} from "../e2e/submission-helpers";

type Metric={route:string;repeat:number;readyMs:number;lcpMs:number|null;cls:number;jsEncodedBytes:number;jsDecodedBytes:number;taskMs:number;heapBytes:number;longTaskMs:number;maxInteractionMs:number;resources:string[]};
type LabWindow=Window&{lab:{lcp:number|null;cls:number;longTasks:number;interactions:number[]}};
const output=".agent/reference-review/performance";
const phase=process.env.PERF_PHASE??"diagnostic";
const rows:Metric[]=[];
async function instrument(page:Page){
 await page.addInitScript(()=>{
  const state:LabWindow["lab"]={lcp:null,cls:0,longTasks:0,interactions:[]};(window as unknown as LabWindow).lab=state;
  new PerformanceObserver(list=>{for(const entry of list.getEntries())state.lcp=entry.startTime;}).observe({type:"largest-contentful-paint",buffered:true});
  new PerformanceObserver(list=>{for(const entry of list.getEntries()){const e=entry as PerformanceEntry&{hadRecentInput:boolean;value:number};if(!e.hadRecentInput)state.cls+=e.value;}}).observe({type:"layout-shift",buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())state.longTasks+=e.duration;}).observe({type:"longtask",buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries()){if((e as PerformanceEntry&{interactionId:number}).interactionId)state.interactions.push(e.duration);}}).observe({type:"event",buffered:true,durationThreshold:16} as PerformanceObserverInit);
 });
}
async function throttle(page:Page):Promise<CDPSession>{const cdp=await page.context().newCDPSession(page);await cdp.send("Network.enable");await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:200_000,uploadThroughput:93_750});await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});await cdp.send("Performance.enable");return cdp;}
async function measure(page:Page,cdp:CDPSession,url:string,selector:string,route:string,repeat:number){
 const t=performance.now();await page.goto(url);await expect(page.locator(selector).first()).toBeVisible();const readyMs=performance.now()-t;
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
 const data=await page.evaluate(()=>{const l=(window as unknown as LabWindow).lab,resources=performance.getEntriesByType("resource") as PerformanceResourceTiming[];const js=[...new Map(resources.filter(r=>new URL(r.name).pathname.endsWith(".js")).map(r=>[r.name,r])).values()];return {lcpMs:l.lcp,cls:l.cls,longTaskMs:l.longTasks,maxInteractionMs:Math.max(0,...l.interactions),jsEncodedBytes:js.reduce((n,r)=>n+r.encodedBodySize,0),jsDecodedBytes:js.reduce((n,r)=>n+r.decodedBodySize,0),resources:js.map(r=>new URL(r.name).pathname)};});
 const metrics=await cdp.send("Performance.getMetrics") as {metrics:{name:string;value:number}[]};const metric=(n:string)=>metrics.metrics.find(m=>m.name===n)?.value??0;
 rows.push({route,repeat,readyMs,...data,taskMs:metric("TaskDuration")*1000,heapBytes:metric("JSHeapUsedSize")});
}
test("production mobile startup, capture routes and camera fixture",async({browser})=>{
 for(let repeat=1;repeat<=3;repeat++){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce"});
  const page=await context.newPage();await instrument(page);const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
  const cdp=await throttle(page);await measure(page,cdp,"/",".referral-form, form", "landing",repeat);
  const field=page.getByRole("textbox",{name:"کد معرفی / کد ارجاع"});await field.press("A");await field.press("Backspace");await page.waitForTimeout(100);
  rows[rows.length-1].maxInteractionMs=await page.evaluate(()=>Math.max(0,...(window as unknown as LabWindow).lab.interactions));
  // Setup is outside measured/throttled intervals; no user profile or real media is used.
  await cdp.send("Emulation.setCPUThrottlingRate",{rate:1});await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await mockCamera(page);await photography(page);const id=await fixtureInspectionId(page);
  await cdp.send("Network.clearBrowserCache");await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:200_000,uploadThroughput:93_750});
  await measure(page,cdp,`/inspection/${id}/capture`,".photography-overview","capture",repeat);
  const t=performance.now();await page.locator('.vehicle-photo-marker[data-requirement="front-45-right"]').click();await expect(page.locator(".photography-guide")).toBeVisible();const markerNavigationMs=performance.now()-t;
  await measure(page,cdp,`/inspection/${id}/capture/photo/front-45-right/guide`,".photography-guide","guide",repeat);
  await measure(page,cdp,`/inspection/${id}/capture/photo/front-45-right/camera`,".camera-screen .camera-shutter:enabled","camera-fixture",repeat);
  const media=await page.evaluate(()=>({cameraCalls:(window as Window&{photographyCameraCalls?:number}).photographyCameraCalls,serviceWorkers:typeof navigator.serviceWorker!=="undefined"}));
  const shutter=performance.now();await page.getByRole("button",{name:"ثبت عکس",exact:true}).click();await expect(page.locator(".photo-review-capture img")).toBeVisible();
  const capturePersistMs=performance.now()-shutter;
  const captured=await page.evaluate(async()=>{const r=indexedDB.open("inspection-photos",1);const db=await new Promise<IDBDatabase>(ok=>{r.onsuccess=()=>ok(r.result)});const records=await new Promise<{draft?:{blob:Blob}}[]>(ok=>{const t=db.transaction("photos"),q=t.objectStore("photos").getAll();t.oncomplete=()=>ok(q.result)});db.close();return records.filter(r=>r.draft).map(r=>({size:r.draft!.blob.size,mime:r.draft!.blob.type}));});
  await page.goto(`/inspection/${id}/capture`);expect(await page.evaluate(()=>(window as Window&{stoppedPhotoTracks?:number}).stoppedPhotoTracks??0)).toBeGreaterThanOrEqual(0);
  await mkdir(output,{recursive:true});await writeFile(`${output}/${phase}-mobile-${repeat}.json`,JSON.stringify({markerNavigationMs,capturePersistMs,captured,media,errors},null,2));
  expect(errors).toEqual([]);await context.close();
 }
});
test("production operations routes and durable photo listing",async({page,context})=>{
 await page.setViewportSize({width:1440,height:960});await instrument(page);await submissionWorkflow(page);await page.getByRole("button",{name:"ارسال برای بررسی",exact:true}).click();await expect(page).toHaveURL(/submitted$/);
 await page.goto("/admin/assignments");await page.getByLabel("ارجاع BDI-8F31K2",{exact:true}).selectOption("reviewer-demo");await page.goto("/reviewer");await page.getByRole("link",{name:"مشاهده پرونده"}).click();await expect(page.locator(".review-main-frame img")).toBeVisible();const caseUrl=page.url();
 const cdp=await throttle(page);
 for(let repeat=1;repeat<=3;repeat++){await measure(page,cdp,caseUrl,".review-main-frame img","reviewer-case",repeat);await page.goto("/admin/site-settings");await page.getByRole("combobox",{name:"هویت آزمایشی"}).selectOption("platform-admin");await expect(page.locator(".site-settings-workspace")).toBeVisible();await measure(page,cdp,"/admin/site-settings",".site-settings-workspace","admin-settings",repeat);}
 const state=await page.evaluate(async()=>{const req=indexedDB.open("inspection-photos",1);const db=await new Promise<IDBDatabase>((ok,no)=>{req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});const records=await new Promise<{blob?:Blob}[]>((ok,no)=>{const t=db.transaction("photos"),r=t.objectStore("photos").getAll();t.oncomplete=()=>ok(r.result);t.onerror=()=>no(t.error)});db.close();const sizes=records.flatMap(r=>r.blob?[r.blob.size]:[]);return {fixturePhotoCount:sizes.length,fixtureAverageBytes:sizes.reduce((n,v)=>n+v,0)/sizes.length,fixtureMaxBytes:Math.max(...sizes)};});
 await writeFile(`${output}/${phase}-fixture-sizes.json`,JSON.stringify(state,null,2));
 expect(await context.pages()).toContain(page);
});
test.afterAll(async()=>{
 await mkdir(output,{recursive:true});const files: {path:string;bytes:number;gzipBytes:number}[]=[];
 async function walk(dir:string){for(const item of await readdir(dir,{withFileTypes:true})){const p=join(dir,item.name);if(item.isDirectory())await walk(p);else if(p.endsWith(".js")){const bytes=await readFile(p);files.push({path:p.replaceAll("\\","/"),bytes:bytes.length,gzipBytes:gzipSync(bytes).length});}}}
 await walk(".next/static/chunks");await writeFile(`${output}/${phase}-benchmark.json`,JSON.stringify({phase,conditions:{next:"16.3.8",cpuRate:4,latencyMs:150,downloadBytesPerSecond:200000,uploadBytesPerSecond:93750,repeats:3,cacheDisabled:true},rows,allBuildChunks:files.sort((a,b)=>b.bytes-a.bytes)},null,2));
});
