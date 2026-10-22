import {act,render,screen} from "@testing-library/react";
import {afterEach,expect,it,vi} from "vitest";
import {EvidencePreview,EvidenceThumbnail} from "@/features/review-operations/evidence-preview";
import {ThumbnailCache} from "@/lib/media/thumbnail-cache";
import type {UploadJob} from "@/features/upload/upload-model";
const read=vi.hoisted(()=>vi.fn());
vi.mock("@/lib/media/photo-store",()=>({readPhoto:read}));
const job:UploadJob={id:"job",namespace:"private-case",inspectionId:"inspection",evidenceKind:"photo",requirementId:"photo",title:"Photo",localBlobKey:"key",revision:"accepted",mimeType:"image/jpeg",byteSize:100,capturedAt:"now",required:true,current:true,upload:"queued",verification:"not-started",bytesUploaded:0,attemptCount:0};
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();read.mockReset();});
it("reuses only compact revision thumbnails and releases mounted URLs without reloading on progress",async()=>{
 const create=vi.fn(()=>"blob:preview"),revoke=vi.fn(),close=vi.fn();const NativeURL=URL;
 vi.stubGlobal("URL",class extends NativeURL{static createObjectURL=create;static revokeObjectURL=revoke;});
 vi.stubGlobal("createImageBitmap",vi.fn(async()=>({width:280,height:160,close})));
 vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockReturnValue({drawImage:vi.fn()} as unknown as CanvasRenderingContext2D);
 vi.spyOn(HTMLCanvasElement.prototype,"toBlob").mockImplementation(callback=>callback(new Blob(["thumb"],{type:"image/jpeg"})));
 read.mockResolvedValue({revisionId:"accepted",blob:new Blob(["private original"],{type:"image/jpeg"})});
 const cache=new ThumbnailCache();const view=render(<EvidencePreview job={job} compact cache={cache}/>);await act(async()=>{});expect(read).toHaveBeenCalledTimes(1);expect(close).toHaveBeenCalledOnce();
 view.rerender(<EvidencePreview job={{...job,upload:"uploading",bytesUploaded:45}} compact cache={cache}/>);await act(async()=>{});expect(read).toHaveBeenCalledTimes(1);
 view.unmount();expect(revoke).toHaveBeenCalledWith("blob:preview");const next=render(<EvidencePreview job={job} compact cache={cache}/>);await act(async()=>{});expect(read).toHaveBeenCalledTimes(1);next.unmount();expect(revoke).toHaveBeenCalledTimes(2);cache.clear();expect(cache.size).toBe(0);
});
it("does not read video data for a visible filmstrip item",()=>{
 vi.stubGlobal("IntersectionObserver",class{observe(){}disconnect(){}});render(<EvidenceThumbnail job={{...job,evidenceKind:"video-360"}}/>);expect(read).not.toHaveBeenCalled();expect(screen.queryByRole("video")).toBeNull();
});
