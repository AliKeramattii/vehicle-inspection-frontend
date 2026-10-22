import {expect,it,vi} from "vitest";
import {createPhotoOptimization} from "@/lib/media/photo-optimization";
import {imagePolicies} from "@/lib/media/image-policy";
const fixture=vi.hoisted(()=>({begin:vi.fn(),finish:vi.fn()}));
vi.mock("@/lib/media/photo-store",()=>({beginPhotoOptimization:fixture.begin,finishPhotoOptimization:fixture.finish,choosePhotoVariant:vi.fn()}));
vi.mock("@/lib/media/image-optimizer",()=>{throw new Error("lazy chunk unavailable");});
it("records recoverable kept-original state if the optimizer chunk fails, authorizing each write separately",async()=>{
 const blob=new Blob(["durable source"],{type:"image/jpeg"});const work={blob,revisionId:"revision",attemptId:"attempt",policy:imagePolicies.exterior};
 fixture.begin.mockResolvedValue(work);fixture.finish.mockResolvedValue(true);
 const authorized=vi.fn(async<T>(operation:(namespace:string)=>Promise<T>)=>operation("authorized-case"));
 expect(await createPhotoOptimization(operation=>authorized(operation) as ReturnType<typeof operation>).prepare("photo",imagePolicies.exterior)).toBe(true);
 expect(authorized).toHaveBeenCalledTimes(2);expect(fixture.finish).toHaveBeenCalledWith("authorized-case","photo",work,expect.objectContaining({status:"kept-original",reason:"optimizer-unavailable",source:{byteSize:blob.size,mimeType:blob.type}}));
});
