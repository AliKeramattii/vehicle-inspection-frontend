import {describe,it,expect,vi} from "vitest";
import {ReviewRepository} from "@/features/review-operations/repository";
import {MemoryReviewPersistence} from "@/features/review-operations/persistence";
import type {ReviewCase} from "@/features/review-operations/model";
import type {UploadJob} from "@/features/upload/upload-model";
import type {RequestRepository} from "@/features/additional-evidence/request-repository";
import type {EvidenceRequest} from "@/features/additional-evidence/request-model";
import {inspectionPhotographyTemplate as template} from "@/features/photography/inspection-template";
const admin={id:"admin",role:"platform-admin" as const},actor={id:"reviewer-demo",role:"reviewer" as const};
const photos=template.sections[0].photoRequirements;
const job=(i:number):UploadJob=>({id:"job-"+i,inspectionId:"case-1",namespace:"original",evidenceKind:"photo",requirementId:photos[i].id,title:photos[i].title,localBlobKey:"blob-"+i,revision:"r-"+i,mimeType:"image/jpeg",byteSize:10,capturedAt:"2026-10-15T00:00:00Z",required:true,current:true,upload:"uploaded",verification:"processing",bytesUploaded:10,attemptCount:1,remoteEvidenceId:"remote-"+i});
const record=():ReviewCase=>({id:"case-1",reference:"BDI-8F31K2",submittedAt:"2026-10-15T00:00:00Z",template,summary:{namespace:"original",jobs:[job(0),job(1)]} as ReviewCase["summary"],status:"awaiting-assignment",decisions:[]});
describe("functional audit reviewer outbox",()=>{
 it("uses requirement-specific decision identity when different photos share a revision string",async()=>{
  const requests:EvidenceRequest[]=[];
  const storage={list:async()=>structuredClone(requests),create:vi.fn(async(r:EvidenceRequest)=>{requests.push(structuredClone(r));})} as unknown as RequestRepository;
  const repo=new ReviewRepository(new MemoryReviewPersistence(),storage,()=>0,()=>"2026-10-15T00:00:00Z");const source=record();source.summary.jobs[1].revision="r-0";
  await repo.importSubmitted([source]);await repo.assign(admin,"case-1",actor.id);
  await repo.decide(actor,"case-1",photos[0].id,"r-0","rejected","علت اول");requests[0].status="resubmitted";
  await repo.decide(actor,"case-1",photos[1].id,"r-0","rejected","علت دوم");
  expect(requests).toHaveLength(2);expect(requests[1].id).not.toBe(requests[0].id);expect(requests[1].items[0].id).not.toBe(requests[0].items[0].id);
 });
 it("recovers a committed request with an uncertain acknowledgement before delivering a second rejection",async()=>{
  const requests:EvidenceRequest[]=[];let uncertain=true;
  const storage={list:async()=>structuredClone(requests),create:vi.fn(async(r:EvidenceRequest)=>{requests.push(structuredClone(r));if(uncertain){uncertain=false;throw new Error("acknowledgement interrupted");}})} as unknown as RequestRepository;
  const repo=new ReviewRepository(new MemoryReviewPersistence(),storage,()=>0,()=>"2026-10-15T00:00:00Z");await repo.importSubmitted([record()]);await repo.assign(admin,"case-1",actor.id);
  await expect(repo.decide(actor,"case-1",photos[0].id,"r-0","rejected","علت اول")).rejects.toThrow("interrupted");
  await repo.decide(actor,"case-1",photos[1].id,"r-1","rejected","علت دوم");
  let saved=(await repo.read(actor)).cases[0];expect(saved.decisions[0].requestId).toBe(requests[0].id);expect(saved.decisions[1].requestId).toBeUndefined();
  requests[0].status="resubmitted";
  await repo.flushRequest(saved);saved=(await repo.read(actor)).cases[0];
  expect(requests).toHaveLength(2);expect(requests[1].items.map(i=>i.kind==="photo"?i.requirementId:i.kind)).toEqual([photos[1].id]);expect(saved.decisions[1].requestId).toBe(requests[1].id);
 });
});
