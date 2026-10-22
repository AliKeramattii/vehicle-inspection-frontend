import {expect,it,vi} from "vitest";
import {acceptedMedia,photoRevision} from "@/features/upload/upload-model";
import {durableUploadMedia} from "@/features/upload/media-source";
import {inspectionPhotographyTemplate as template} from "@/features/photography/inspection-template";
import type {LocalPhoto} from "@/lib/media/photo-store";
const read=vi.hoisted(()=>vi.fn());
vi.mock("@/lib/media/photo-store",async original=>({...await original<typeof import("@/lib/media/photo-store")>(),readPhoto:read}));
it("uploads only the confirmed selected payload; optimization drafts cannot change an active revision",async()=>{
 const original=new Blob(["original accepted photo"],{type:"image/jpeg"}),source=new Blob(["replacement original source"],{type:"image/jpeg"}),candidate=new Blob(["small"],{type:"image/jpeg"});
 const requirement=template.sections[0].photoRequirements[0];
 const record:LocalPhoto={key:"key",namespace:"case",requirementId:requirement.id,status:"captured",capturedAt:"now",revisionId:"accepted",blob:original,draft:{blob:source,capturedAt:"later",revisionId:"replacement",selectedVariant:"optimized",optimizedBlob:candidate}};
 const [oldJob]=acceptedMedia("inspection","case",template,[record],{namespace:"case"});read.mockResolvedValue(record);
 expect(oldJob.byteSize).toBe(original.size);expect(await durableUploadMedia.read(oldJob)).toBe(original);
 const confirmed={...record,blob:candidate,sourceBlob:source,revisionId:"replacement",draft:undefined};read.mockResolvedValue(confirmed);
 const [newJob]=acceptedMedia("inspection","case",template,[confirmed],{namespace:"case"});
 expect(newJob.byteSize).toBe(candidate.size);expect(newJob.revision).toBe(photoRevision(confirmed));expect(await durableUploadMedia.read(newJob)).toBe(candidate);
 expect(await durableUploadMedia.isCurrent(oldJob)).toBe(false);await expect(durableUploadMedia.read(oldJob)).rejects.toThrow();expect(confirmed.sourceBlob).toBe(source);
});
