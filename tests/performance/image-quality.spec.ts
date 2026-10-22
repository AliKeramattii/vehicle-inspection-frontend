import {test,expect,type Page} from "@playwright/test";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import ts from "typescript";
import {inspectionPhotographyTemplate as template} from "../../src/features/photography/inspection-template";
type Core=typeof import("../../src/lib/media/image-optimizer-core");
type LabWindow=Window&{qualityCore:Core};
async function loadCore(page:Page){const files={policy:await readFile("src/lib/media/image-policy.ts","utf8"),header:await readFile("src/lib/media/image-header.ts","utf8"),core:await readFile("src/lib/media/image-optimizer-core.ts","utf8")};const compiled=Object.fromEntries(Object.entries(files).map(([key,value])=>[key,ts.transpileModule(value,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText]));await page.evaluate(async files=>{const make=(code:string)=>URL.createObjectURL(new Blob([code],{type:"text/javascript"}));const policy=make(files.policy),header=make(files.header),core=make(files.core.replaceAll('"./image-policy"',JSON.stringify(policy)).replaceAll('"./image-header"',JSON.stringify(header)));try{(window as unknown as LabWindow).qualityCore=await import(/* webpackIgnore:true */core);}finally{[policy,header,core].forEach(url=>URL.revokeObjectURL(url));}},compiled);}
test("actual twelve samples: native-size JPEG/WebP experiments and text crops",async({page})=>{
 await page.setViewportSize({width:1440,height:960});await page.goto("/foundation");await loadCore(page);
 const requirements=template.sections.flatMap(s=>s.photoRequirements);
 const rows=[];
 for(const requirement of requirements){
  const result=await page.evaluate(async requirement=>{
   const original=new Image();original.src=requirement.sampleImage;await original.decode();const sourceCanvas=document.createElement("canvas");sourceCanvas.width=original.naturalWidth;sourceCanvas.height=original.naturalHeight;sourceCanvas.getContext("2d")!.drawImage(original,0,0);const source=await new Promise<Blob>(ok=>sourceCanvas.toBlob(b=>ok(b!),"image/jpeg",1));
   const detail=!requirement.guidanceTopics||requirement.guidanceTopics.some(t=>["text","focus","ignition"].includes(t))||requirement.checks.some(c=>c.includes("خوانا"));
   const experiments=[];
   for(const mimeType of ["image/jpeg","image/webp"] as const)for(const quality of [.8,.88,.9]){
    const result=await (window as unknown as LabWindow).qualityCore.renderOptimizedImage(source,{name:detail?"detail":"exterior",maxLongEdge:detail?2560:2048,suitableBytes:0,quality,mimeType,preserveDimensions:detail},16_000_000);
    let sampledPsnr:number|undefined;
    if(result.status==="ready"&&mimeType==="image/jpeg"&&quality===(detail ? .9 : .88)){
     const candidate=await createImageBitmap(result.blob);const canvas=document.createElement("canvas");canvas.width=candidate.width;canvas.height=candidate.height;const context=canvas.getContext("2d")!;context.drawImage(sourceCanvas,0,0,canvas.width,canvas.height);const before=context.getImageData(0,0,canvas.width,canvas.height).data;context.drawImage(candidate,0,0);const after=context.getImageData(0,0,canvas.width,canvas.height).data;let error=0,count=0;for(let p=0;p<before.length;p+=32)for(let c=0;c<3;c++){error+=(before[p+c]-after[p+c])**2;count++;}sampledPsnr=10*Math.log10(255**2/(error/count||Number.EPSILON));
     if(["chassis-number","odometer-on","spec-plate"].includes(requirement.id)){
      const sheet=document.createElement("canvas"),w=Math.min(650,original.naturalWidth),h=250,sx=(original.naturalWidth-w)/2,sy=requirement.id==="odometer-on"?original.naturalHeight*.31:original.naturalHeight*.32;sheet.id="quality-sheet";sheet.width=w*2;sheet.height=h+30;sheet.style.cssText="position:fixed;top:0;left:0;z-index:99999;max-width:none;background:white";const s=sheet.getContext("2d")!;s.fillStyle="white";s.fillRect(0,0,sheet.width,sheet.height);s.fillStyle="black";s.font="16px sans-serif";s.fillText("SOURCE JPEG 1.0",10,22);s.fillText("CANDIDATE JPEG "+quality,w+10,22);s.drawImage(sourceCanvas,sx,sy,w,h,0,30,w,h);s.drawImage(candidate,sx,sy,w,h,w,30,w,h);document.getElementById("quality-sheet")?.remove();document.body.append(sheet);
     }
     candidate.close();canvas.width=1;canvas.height=1;
    }
    experiments.push({mimeType,quality,status:result.status,reason:result.status==="kept-original"?result.reason:undefined,bytes:result.status==="ready"?result.blob.size:source.size,elapsedMs:result.elapsedMs,dimensions:result.status==="ready"?result.optimized:result.source,sampledPsnr});
   }
   sourceCanvas.width=1;sourceCanvas.height=1;return {id:requirement.id,detail,inputBytes:source.size,width:original.naturalWidth,height:original.naturalHeight,experiments};
  },requirement);
  rows.push(result);
  const accepted=result.experiments.find(e=>e.mimeType==="image/jpeg"&&e.quality===(result.detail ? .9 : .88));expect(accepted?.status).toBe("ready");expect(accepted?.sampledPsnr).toBeGreaterThan(30);
  if(["chassis-number","odometer-on","spec-plate"].includes(requirement.id)){await page.locator("#quality-sheet").screenshot({path:`.agent/reference-review/performance/quality-${requirement.id}.png`});await page.locator("#quality-sheet").evaluate(e=>e.remove());}
 }
 await mkdir(".agent/reference-review/performance",{recursive:true});await writeFile(".agent/reference-review/performance/image-quality-matrix.json",JSON.stringify({note:"JPEG100 capture-equivalents of canonical samples at native size, not real customer captures or binding insurance thresholds",rows},null,2));
});
test("EXIF orientation is applied once in bitmap and HTML-image fallback",async({page})=>{
 await page.route("**/performance-fixtures/orientation-6.jpg",async route=>route.fulfill({contentType:"image/jpeg",body:await readFile("tests/e2e/fixtures/orientation-6.jpg")}));await page.goto("/foundation");await loadCore(page);
 const result=await page.evaluate(async()=>{
  const source=await(await fetch("/performance-fixtures/orientation-6.jpg")).blob();const core=(window as unknown as LabWindow).qualityCore;
  const render=async()=>{const result=await core.renderOptimizedImage(source,{name:"exterior",maxLongEdge:2048,suitableBytes:0,quality:.88,mimeType:"image/jpeg",preserveDimensions:false},16_000_000);if(result.status!=="ready")return result;
   const image=new Image(),url=URL.createObjectURL(result.blob);try{image.src=url;await image.decode();const c=document.createElement("canvas");c.width=1;c.height=1;c.getContext("2d")!.drawImage(image,0,0,10,10,0,0,1,1);const pixel=[...c.getContext("2d")!.getImageData(0,0,1,1).data];return {status:result.status,width:image.naturalWidth,height:image.naturalHeight,pixel};}finally{URL.revokeObjectURL(url);}};
  const bitmap=await render(),original=window.createImageBitmap;Object.defineProperty(window,"createImageBitmap",{configurable:true,value:undefined});let fallback;try{fallback=await render();}finally{Object.defineProperty(window,"createImageBitmap",{configurable:true,value:original});}return {bitmap,fallback};
 });
 for(const value of [result.bitmap,result.fallback]){expect(value).toMatchObject({status:"ready",width:1365,height:2048});if("pixel" in value){expect(value.pixel[2]).toBeGreaterThan(200);expect(value.pixel[0]).toBeLessThan(30);}}
});
