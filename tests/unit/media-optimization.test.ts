// Legacy v1 regression fixture; photo-policy-v2.test.ts covers the current eleven-photo package.
import {describe,it,expect,vi,afterEach} from "vitest";
import {readFileSync} from "node:fs";
import {Blob as NodeBlob} from "node:buffer";
import {imagePolicies,imagePixelBudget,imageTarget,photoImagePolicy} from "@/lib/media/image-policy";
import {parseImageHeader} from "@/lib/media/image-header";
import {renderOptimizedImage} from "@/lib/media/image-optimizer-core";
import {photoDraftBlob,type PhotoDraft} from "@/lib/media/photo-store";
import {ThumbnailCache} from "@/lib/media/thumbnail-cache";
import {videoCaptureConstraints,defaultVideoProfile,videoExperimentProfiles} from "@/lib/media/video-profiles";
import {legacyPhotographyTemplate as inspectionPhotographyTemplate} from "@/features/photography/inspection-template";
const binary=(path:string)=>Uint8Array.from(readFileSync(path)).buffer;
const photo=()=>new NodeBlob([binary("public/assets/inspection-vehicle/photo-guides/front-45-right.webp")],{type:"image/webp"}) as unknown as Blob;
afterEach(()=>vi.unstubAllGlobals());
describe("bounded image policy and headers",()=>{
 it("keeps the twelve IDs and treats text/odometer/unknown guidance conservatively",()=>{const rows=inspectionPhotographyTemplate.sections.flatMap(s=>s.photoRequirements);expect(rows).toHaveLength(12);expect(photoImagePolicy(rows[0]).name).toBe("exterior");for(const p of rows.filter(p=>p.checks.some(c=>c.includes("خوانا"))))expect(photoImagePolicy(p).preserveDimensions).toBe(true);expect(photoImagePolicy({checks:[]}).name).toBe("detail");});
 it("never upscales, swaps EXIF axes once and preserves technical resolution",()=>{expect(imageTarget({width:800,height:600,orientation:1},imagePolicies.exterior)).toEqual({width:800,height:600});expect(imageTarget({width:4000,height:3000,orientation:6},imagePolicies.exterior)).toEqual({width:1536,height:2048});expect(imageTarget({width:4000,height:3000,orientation:1},imagePolicies.detail)).toEqual({width:4000,height:3000});});
 it("uses a smaller decoded-pixel budget for low-memory/low-core devices",()=>{expect(imagePixelBudget(2,8)).toBe(8_000_000);expect(imagePixelBudget(undefined,4)).toBe(8_000_000);expect(imagePixelBudget(8,8)).toBe(16_000_000);});
 for(const name of ["front-45-right","odometer-on","chassis-number","spec-plate"])it("reads real WebP sample dimensions: "+name,()=>{const dimensions=parseImageHeader(binary(`public/assets/inspection-vehicle/photo-guides/${name}.webp`));expect(dimensions?.width).toBeGreaterThan(0);expect(dimensions?.height).toBeGreaterThan(0);});
 it("reads actual EXIF orientation before allocating a decoder",()=>{expect(parseImageHeader(binary("tests/e2e/fixtures/orientation-6.jpg"))).toMatchObject({width:2400,height:1600,orientation:6});});
 it("rejects truncated/unknown/oversized metadata safely",()=>{expect(parseImageHeader(new ArrayBuffer(8))).toBeUndefined();expect(parseImageHeader(new ArrayBuffer(100))).toBeUndefined();});
 it("keeps already suitable samples without allocating a bitmap",async()=>{const decode=vi.fn();vi.stubGlobal("createImageBitmap",decode);const result=await renderOptimizedImage(photo(),imagePolicies.exterior,16_000_000);expect(result).toMatchObject({status:"kept-original",reason:"already-suitable"});expect(decode).not.toHaveBeenCalled();});
 it("keeps source on low memory, cancellation and decode failure",async()=>{expect(await renderOptimizedImage(photo(),{...imagePolicies.exterior,suitableBytes:0},1)).toMatchObject({reason:"pixel-budget"});const signal=AbortSignal.abort();expect(await renderOptimizedImage(photo(),imagePolicies.exterior,16_000_000,signal)).toMatchObject({reason:"cancelled"});vi.stubGlobal("createImageBitmap",vi.fn().mockRejectedValue(new Error("decode")));expect(await renderOptimizedImage(photo(),{...imagePolicies.exterior,suitableBytes:0},16_000_000)).toMatchObject({reason:"processing-failed"});});
});
describe("source-first variants",()=>{
 const source=new Blob(["source"]),small=new Blob(["sm"]);
 const draft:PhotoDraft={blob:source,capturedAt:"now",revisionId:"revision",optimizedBlob:small,optimization:{status:"ready",attemptId:"attempt",draftRevision:"revision",policy:"exterior",source:{byteSize:6,mimeType:"image/jpeg"},optimized:{byteSize:2,mimeType:"image/jpeg"}}};
 it("defaults to original, selects smaller only explicitly and falls back after interruption",()=>{expect(photoDraftBlob(draft)).toBe(source);expect(photoDraftBlob({...draft,selectedVariant:"optimized"})).toBe(small);expect(photoDraftBlob({...draft,selectedVariant:"optimized",optimization:{...draft.optimization!,status:"processing"}})).toBe(source);expect(photoDraftBlob({...draft,selectedVariant:"optimized",optimizedBlob:undefined})).toBe(source);});
});
describe("bounded private thumbnail cache",()=>{
 it("deduplicates reads/decodes for a revision and invalidates by revision",async()=>{const cache=new ThumbnailCache(),load=vi.fn(async()=>new Blob(["thumb"]));await Promise.all([cache.get("r1",load),cache.get("r1",load)]);expect(load).toHaveBeenCalledTimes(1);await cache.get("r2",load);expect(load).toHaveBeenCalledTimes(2);cache.clear();expect(cache.size).toBe(0);});
 it("bounds bytes/entries and lets failed previews retry",async()=>{const cache=new ThumbnailCache(10,2);await cache.get("a",async()=>new Blob(["123456"]));await cache.get("b",async()=>new Blob(["123456"]));expect(cache.size).toBe(1);await expect(cache.get("error",async()=>{throw new Error("unavailable")})).rejects.toThrow();await expect(cache.get("error",async()=>new Blob(["ok"]))).resolves.toBeInstanceOf(Blob);cache.clear();expect(cache.size).toBe(0);});
});
it("retains video default while exposing six explicit experimental profiles and supported-only constraints",()=>{expect(defaultVideoProfile).toMatchObject({width:1920,height:1080,videoBitsPerSecond:2_500_000});expect(videoExperimentProfiles).toHaveLength(6);expect(videoCaptureConstraints(defaultVideoProfile,{})).toEqual({});expect(videoCaptureConstraints(defaultVideoProfile,{frameRate:true,width:true})).toEqual({frameRate:{ideal:30},width:{ideal:1920}});});
