import {test,expect,type Page} from "@playwright/test";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import ts from "typescript";
import {photography,fixtureInspectionId} from "./photography-helpers";
import {photoNamespace} from "../../src/lib/media/photo-store";
import {inspectionPhotographyTemplate as template} from "../../src/features/photography/inspection-template";
type Store=typeof import("../../src/lib/media/photo-store");
type TestWindow=Window&{testPhotos:Store};
async function loadStore(page:Page){const code=ts.transpileModule(await readFile("src/lib/media/photo-store.ts","utf8"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;await page.evaluate(async code=>{const url=URL.createObjectURL(new Blob([code],{type:"text/javascript"}));try{(window as unknown as TestWindow).testPhotos=await import(/* webpackIgnore:true */url);}finally{URL.revokeObjectURL(url);}},code);}
async function largeDraft(page:Page){
 await page.addInitScript(()=>{Object.defineProperty(navigator,"deviceMemory",{configurable:true,value:8});Object.defineProperty(navigator,"hardwareConcurrency",{configurable:true,value:8});});
 await photography(page);const id=await fixtureInspectionId(page),namespace=photoNamespace(id,template.templateId,template.templateVersion);await loadStore(page);
 const source=await page.evaluate(async namespace=>{const image=new Image();image.src="/assets/inspection-vehicle/photo-guides/front-45-right.webp";await image.decode();const canvas=document.createElement("canvas");canvas.width=4096;canvas.height=Math.round(4096*image.naturalHeight/image.naturalWidth);canvas.getContext("2d")!.drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob>(ok=>canvas.toBlob(b=>ok(b!),"image/jpeg",1));await (window as unknown as TestWindow).testPhotos.indexedDBPhotoStore.saveDraft(namespace,"front-45-right",{blob,capturedAt:"2026-10-22T00:00:00Z"});canvas.width=1;canvas.height=1;return {size:blob.size,hash:[...new Uint8Array(await crypto.subtle.digest("SHA-256",await blob.arrayBuffer()))].map(v=>v.toString(16).padStart(2,"0")).join("")};},namespace);
 const {size,hash}=source;expect(size).toBeGreaterThan(600*1024);await page.goto(`/inspection/${id}/capture/photo/front-45-right/review`);await expect(page.locator(".photo-review-capture img")).toBeVisible();return {id,namespace,size,hash};
}
async function result(page:Page,namespace:string){await loadStore(page);return page.evaluate(async namespace=>{const store=(window as unknown as TestWindow).testPhotos,record=await store.readPhoto(store.photoKey(namespace,"front-45-right"));const hash=async(blob?:Blob)=>blob?[...new Uint8Array(await crypto.subtle.digest("SHA-256",await blob.arrayBuffer()))].map(v=>v.toString(16).padStart(2,"0")).join(""):undefined;return {draftHash:await hash(record?.draft?.blob),sourceHash:await hash(record?.sourceBlob),blob:record?.blob?.size,original:record?.sourceBlob?.size,revision:record?.revisionId,draft:record?.draft?.blob.size,candidate:record?.draft?.optimizedBlob?.size,selected:record?.draft?.selectedVariant,optimization:record?.imageOptimization,draftStatus:record?.draft?.optimization?.status};},namespace);}
test.beforeEach(async({},info)=>test.skip(info.project.name!=="customer"));
test("worker candidate is opt-in, survives refresh and retains the source on acceptance",async({page})=>{
 const {id,namespace,size,hash}=await largeDraft(page);const failed:string[]=[];page.on("pageerror",e=>failed.push(e.message));
 await page.getByRole("button",{name:"آماده‌سازی نسخه کم‌حجم (آزمایشی)"}).click();const source=page.getByRole("button",{name:/^اصل عکس ·/}),candidate=page.getByRole("button",{name:/^نسخه کم‌حجم ·/});await expect(candidate).toBeVisible();await expect(source).toHaveAttribute("aria-pressed","true");
 let data=await result(page,namespace);expect(data.draft).toBe(size);expect(data.draftHash).toBe(hash);expect(data.candidate).toBeLessThan(size*.9);expect(data.selected).toBe("source");
 await candidate.click();await expect(candidate).toHaveAttribute("aria-pressed","true");await page.reload();await expect(page.getByRole("button",{name:/^نسخه کم‌حجم ·/})).toHaveAttribute("aria-pressed","true");
 await mkdir(".agent/reference-review/performance",{recursive:true});await page.screenshot({path:".agent/reference-review/performance/optimized-review-390.png"});
 await page.getByRole("button",{name:"تأیید و ادامه",exact:true}).click();await expect(page).toHaveURL(new RegExp(`/inspection/${id}/capture/photo/`));data=await result(page,namespace);expect(data.original).toBe(size);expect(data.sourceHash).toBe(hash);expect(data.blob).toBeLessThan(size);expect(data.draft).toBeUndefined();expect(data.optimization).toMatchObject({status:"ready",selectedVariant:"optimized",method:"worker"});expect(failed).toEqual([]);
 await writeFile(".agent/reference-review/performance/optimized-ui-result.json",JSON.stringify(data,null,2));
});
test("low-memory policy keeps the source and never claims an upload",async({page})=>{
 const {namespace,size}=await largeDraft(page);await page.evaluate(()=>Object.defineProperty(navigator,"deviceMemory",{configurable:true,value:1}));
 await page.getByRole("button",{name:"آماده‌سازی نسخه کم‌حجم (آزمایشی)"}).click();await expect(page.getByText("نسخه مناسب کوچک‌تری آماده نشد؛ اصل عکس انتخاب شده است.")).toBeVisible();const data=await result(page,namespace);expect(data.draft).toBe(size);expect(data.candidate).toBeUndefined();expect(data.draftStatus).toBe("kept-original");await expect(page.getByRole("button",{name:"تأیید و ادامه",exact:true})).toBeEnabled();
});
test("interrupted worker is recoverable after refresh without touching the source",async({page})=>{
 const {namespace,size}=await largeDraft(page);await page.evaluate(()=>{class PausedWorker{onmessage=null;onerror=null;postMessage(){}terminate(){}}Object.defineProperty(window,"Worker",{configurable:true,value:PausedWorker});});
 await page.getByRole("button",{name:"آماده‌سازی نسخه کم‌حجم (آزمایشی)"}).click();await expect(page.locator(".photo-optimization")).toHaveAttribute("aria-busy","true");await expect.poll(async()=> (await result(page,namespace)).draftStatus).toBe("processing");
 await page.reload();await expect(page.getByText("آماده‌سازی قبلی کامل نشده است. می‌توانید اصل عکس را تأیید کنید یا دوباره تلاش کنید.")).toBeVisible();expect((await result(page,namespace)).draft).toBe(size);await page.getByRole("button",{name:"تلاش دوباره برای کاهش حجم"}).click();await expect(page.getByRole("button",{name:/^نسخه کم‌حجم ·/})).toBeVisible();
});
test("unsupported worker and failed browser decode preserve an original draft",async({page})=>{
 const {namespace,size}=await largeDraft(page);await page.evaluate(()=>{Object.defineProperty(window,"Worker",{configurable:true,value:undefined});window.createImageBitmap=async()=>{throw new Error("decode fixture")};});await page.getByRole("button",{name:"آماده‌سازی نسخه کم‌حجم (آزمایشی)"}).click();await expect(page.getByText("نسخه مناسب کوچک‌تری آماده نشد؛ اصل عکس انتخاب شده است.")).toBeVisible();expect((await result(page,namespace)).draft).toBe(size);
});
test("real IndexedDB CAS rejects obsolete work and quota failure preserves accepted/source Blobs",async({page})=>{
 await page.goto("/foundation");await loadStore(page);
 const state=await page.evaluate(async()=>{
  const api=(window as unknown as TestWindow).testPhotos,ns="performance-transaction-fixture",id="front-45-right";
  const source=await(await fetch("/assets/inspection-vehicle/photo-guides/front-45-right.webp")).blob();await api.indexedDBPhotoStore.saveDraft(ns,id,{blob:source,capturedAt:"first"});await api.indexedDBPhotoStore.confirm(ns,id);const accepted=await api.readPhoto(api.photoKey(ns,id));
  await api.indexedDBPhotoStore.saveDraft(ns,id,{blob:source,capturedAt:"replacement"});
  const policy={name:"exterior" as const,maxLongEdge:2048,suitableBytes:0,quality:.88,mimeType:"image/jpeg" as const,preserveDimensions:false};
  const old=await api.beginPhotoOptimization(ns,id,policy);await api.indexedDBPhotoStore.saveDraft(ns,id,{blob:source,capturedAt:"newest"});
  const late=await api.finishPhotoOptimization(ns,id,old,{status:"kept-original",reason:"fixture",source:{byteSize:source.size,mimeType:source.type},elapsedMs:1});
  const work=await api.beginPhotoOptimization(ns,id,policy),put=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(value:unknown,key?:IDBValidKey){if((value as {draft?:{optimization?:{status:string}}}).draft?.optimization?.status==="kept-original")throw new DOMException("quota fixture","QuotaExceededError");return key===undefined?put.call(this,value):put.call(this,value,key);};let quota=false;
  try{await api.finishPhotoOptimization(ns,id,work,{status:"kept-original",reason:"fixture",source:{byteSize:source.size,mimeType:source.type},elapsedMs:1});}catch{quota=true;}finally{IDBObjectStore.prototype.put=put;}
  const preserved=await api.readPhoto(api.photoKey(ns,id));await api.indexedDBPhotoStore.confirm(ns,id);const confirmed=await api.readPhoto(api.photoKey(ns,id));const afterConfirm=await api.finishPhotoOptimization(ns,id,work,{status:"kept-original",reason:"fixture",source:{byteSize:source.size,mimeType:source.type},elapsedMs:1});
  return {late,quota,acceptedUnchanged:preserved?.revisionId===accepted?.revisionId,acceptedBytes:preserved?.blob?.size,sourceBytes:preserved?.draft?.blob.size,expected:source.size,afterConfirm,confirmedStatus:confirmed?.imageOptimization?.status};
 });
 expect(state).toMatchObject({late:false,quota:true,acceptedUnchanged:true,afterConfirm:false,confirmedStatus:"kept-original"});expect(state.acceptedBytes).toBe(state.expected);expect(state.sourceBytes).toBe(state.expected);
});


test("deferred review and guidance retain accessible focus and bounded responsive viewports",async({page})=>{
 const {id}=await largeDraft(page);
 for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[768,1024]]){
  await page.setViewportSize({width,height});
  await expect(page.getByRole("button",{name:"تأیید و ادامه",exact:true})).toBeInViewport();
  const bounds=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,body:document.body.scrollHeight,innerWidth,innerHeight,dir:document.documentElement.dir}));
  expect(bounds).toMatchObject({width,innerWidth:width,height,body:height,innerHeight:height,dir:"rtl"});
  await page.screenshot({path:`.agent/reference-review/performance/review-${width}.png`});
 }
 await page.goto(`/inspection/${id}/capture/photo/front-45-right/guide`);
 await expect(page.locator(".photo-route h2")).toBeFocused();
 await page.getByRole("link",{name:"باز کردن دوربین",exact:true}).click();
 await expect(page.locator(".camera-screen")).toBeVisible();
});

test("a worker initialization failure safely uses the bounded browser canvas",async({page})=>{
 const {namespace,size,hash}=await largeDraft(page);
 await page.evaluate(()=>{class FailedWorker{onmessage=null;onerror:((event:Event)=>void)|null=null;postMessage(){queueMicrotask(()=>this.onerror?.(new Event("error")));}terminate(){}}Object.defineProperty(window,"Worker",{configurable:true,value:FailedWorker});});
 await page.getByRole("button",{name:"آماده‌سازی نسخه کم‌حجم (آزمایشی)"}).click();await expect(page.getByRole("button",{name:/^نسخه کم‌حجم ·/})).toBeVisible();
 const data=await result(page,namespace);expect(data.draftHash).toBe(hash);expect(data.candidate).toBeLessThan(size*.9);expect(data.selected).toBe("source");
});

test("current customer overview keeps media modules idle and does not download optional 3D",async({page})=>{
 const resources:string[]=[];page.on("request",request=>{if(/\.glb|vehicle-scene|react-three/.test(request.url()))resources.push(request.url());});
 await photography(page);
 await expect(page.locator(".capture-reference")).toHaveCount(0);
 await expect(page.locator(".camera-screen, .video-capture, canvas")).toHaveCount(0);
 const image=(await page.locator(".vehicle-photo-scene").boundingBox())!,controls=(await page.locator(".vehicle-photo-controls").boundingBox())!;expect(controls.y).toBeGreaterThanOrEqual(image.y+image.height);expect(resources).toEqual([]);
});
