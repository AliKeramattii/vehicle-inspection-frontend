import {afterEach,expect,it,vi} from "vitest";
import {optimizeImage} from "@/lib/media/image-optimizer";
import {imagePolicies} from "@/lib/media/image-policy";
const fallback=vi.hoisted(()=>vi.fn());
vi.mock("@/lib/media/image-optimizer-core",()=>({renderOptimizedImage:fallback}));
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();vi.clearAllMocks();});
function setup(throws=false){
 vi.useFakeTimers();const terminate=vi.fn();
 vi.stubGlobal("navigator",{hardwareConcurrency:8,deviceMemory:8});vi.stubGlobal("OffscreenCanvas",class{});vi.stubGlobal("createImageBitmap",vi.fn());
 vi.stubGlobal("Worker",class{onmessage=null;onerror=null;postMessage(){if(throws)throw new DOMException("clone fixture","DataCloneError");}terminate=terminate;});
 fallback.mockResolvedValue({status:"kept-original",reason:"fixture",source:{byteSize:6,mimeType:"image/jpeg"},elapsedMs:0});return terminate;
}
it("cleans worker/timer on postMessage failure before a safe canvas fallback",async()=>{
 const terminate=setup(true);const result=optimizeImage(new Blob(["source"],{type:"image/jpeg"}),imagePolicies.exterior);await vi.advanceTimersByTimeAsync(0);expect(await result).toMatchObject({method:"canvas",status:"kept-original"});expect(terminate).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
});
it("aborts an active worker and removes its timeout without running a fallback",async()=>{
 const terminate=setup();const controller=new AbortController();const result=optimizeImage(new Blob(["source"]),imagePolicies.exterior,controller.signal);controller.abort();expect(await result).toMatchObject({status:"kept-original",reason:"cancelled"});expect(terminate).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);expect(fallback).not.toHaveBeenCalled();
});
it("terminates a stalled worker after its bounded timeout",async()=>{
 const terminate=setup();const result=optimizeImage(new Blob(["source"]),imagePolicies.exterior);await vi.advanceTimersByTimeAsync(12000);expect(await result).toMatchObject({status:"kept-original",reason:"timeout"});expect(terminate).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
});
