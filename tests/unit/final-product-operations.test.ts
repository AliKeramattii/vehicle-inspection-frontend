import { latestSubmittedRevisions } from "@/features/review-operations/review-revisions";
import { requestNamespace, type EvidenceRequest } from "@/features/additional-evidence/request-model";
import { describe, it, expect, vi } from "vitest";
import { ReviewRepository } from "@/features/review-operations/repository";
import { MemoryReviewPersistence } from "@/features/review-operations/persistence";
import { caseLifecycle, reviewerWorkload, canApproveInspection, type ReviewCase } from "@/features/review-operations/model";
import { MemoryLifecyclePersistence } from "@/features/inspection-status/lifecycle-persistence";
import { LifecycleRepository } from "@/features/inspection-status/lifecycle-repository";
import { createMockCustomerSource } from "@/features/identity/source-context";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { filterReviewCases } from "@/features/review-operations/review-presentation";
import { uploadProgress, type UploadJob } from "@/features/upload/upload-model";
import { adaptInspection } from "@/lib/api/adapters/inspection";
import { inspectionFixture } from "@/mocks/fixtures";
const now=()=>"2026-10-21T08:00:00Z",admin={id:"admin-demo",role:"platform-admin" as const},actor={id:"reviewer-demo",role:"reviewer" as const};
const scope=await createMockCustomerSource("demo").resolve();
function record():ReviewCase {
 const refs=[...template.sections.flatMap(s=>s.photoRequirements.map(p=>({id:p.id,title:p.title,kind:"photo" as const}))),{id:"video-360",title:"ویدیوی ۳۶۰ درجه",kind:"video-360" as const}];
 const jobs:UploadJob[]=refs.map(r=>({id:r.id,inspectionId:"insp_demo",namespace:"original",evidenceKind:r.kind,requirementId:r.kind==="photo"?r.id:undefined,title:r.title,localBlobKey:r.id,revision:"r1",mimeType:r.kind==="photo"?"image/webp":"video/webm",byteSize:10,capturedAt:now(),required:true,current:true,upload:"uploaded",verification:"processing",bytesUploaded:10,attemptCount:1}));
 return {id:"insp_demo",reference:"BDI-8F31K2",customerPhone:"09120004567",submittedAt:now(),template,status:"awaiting-assignment",decisions:[],summary:{inspection:adaptInspection(inspectionFixture),reference:"BDI-8F31K2",namespace:"original",template,jobs,upload:uploadProgress(jobs,jobs.length),processingCount:jobs.length,odometer:{kilometers:48320},capture:{images:{completed:12,total:12,remaining:0,complete:true,percentage:100,attention:false},odometer:true,video:true,complete:true},readiness:{captureComplete:true,requiredMediaUploaded:true,odometerValid:true,blockingUploadFailures:false,factsConfirmed:true,canSubmit:true}}};
}
async function fixture(){const lifecycle=new LifecycleRepository(new MemoryLifecyclePersistence(),now);await lifecycle.register(scope);const requests={list:vi.fn(async()=>[]),get:vi.fn(),create:vi.fn(),change:vi.fn(),acknowledgement:vi.fn(),acknowledge:vi.fn()};const repo=new ReviewRepository(new MemoryReviewPersistence(),requests,()=>0,now,lifecycle);await repo.importSubmitted([record()]);await repo.assign(admin,"insp_demo",actor.id);return {repo,lifecycle};}
describe("explicit whole-inspection decisions",()=>{
 it("publishes the latest saved decision even when synchronization holds an older case snapshot",async()=>{const {repo,lifecycle}=await fixture();const stale=(await repo.read(actor)).cases[0];await repo.finalize(actor,"insp_demo","rejected","خودرو با پرونده مطابقت ندارد.");await repo.publishCustomerStatus(stale);expect((await lifecycle.read(scope,"insp_demo"))?.status).toBe("REJECTED");});
 it("keeps legacy evidence-review-complete cases in capacity until an explicit whole-case decision",()=>{const r=record();r.status="review-complete";r.reviewerId=actor.id;expect(reviewerWorkload({mode:"manual",reviewers:[],cases:[r],history:[]},actor.id)).toBe(1);r.finalDecision={kind:"approved",actorId:actor.id,at:now()};expect(reviewerWorkload({mode:"manual",reviewers:[],cases:[r],history:[]},actor.id)).toBe(0);});
 it("requires the assigned Reviewer and all current evidence approvals",async()=>{const {repo}=await fixture();await expect(repo.finalize(admin,"insp_demo","approved")).rejects.toThrow("دسترسی");await expect(repo.finalize(actor,"insp_demo","approved")).rejects.toThrow("ابتدا");for(const job of record().summary.jobs)await repo.decide(actor,"insp_demo",job.requirementId??job.evidenceKind,job.revision,"approved");const before=(await repo.read(actor)).cases[0];expect(before.finalDecision).toBeUndefined();expect(caseLifecycle(before)).toBe("UNDER_REVIEW");expect(canApproveInspection(before)).toBe(true);const approved=await repo.finalize(actor,"insp_demo","approved");expect(caseLifecycle(approved)).toBe("REVIEW_APPROVED");expect(approved.forwarding?.phase).toBe("ready");expect(approved.finalDecision?.actorId).toBe(actor.id);expect(approved.summary.jobs.every(j=>j.verification==="processing")).toBe(true);await expect(repo.finalize(actor,"insp_demo","approved")).resolves.toEqual(approved);});
 it("full rejection requires public explanation, keeps original evidence and separates staff notes",async()=>{const {repo,lifecycle}=await fixture();await repo.note(actor,"insp_demo","یادداشت فقط برای کارکنان");await expect(repo.finalize(actor,"insp_demo","rejected")).rejects.toThrow("دلیل");const rejected=await repo.finalize(actor,"insp_demo","rejected","خودرو با پرونده مطابقت ندارد.\nبازدید جدید لازم است.");const customer=await lifecycle.read(scope,"insp_demo");expect(caseLifecycle(rejected)).toBe("REJECTED");expect(customer?.customerExplanation).toContain("بازدید جدید");expect(customer).not.toHaveProperty("internalNotes");expect(JSON.stringify(customer)).not.toContain("فقط برای کارکنان");expect(rejected.summary.jobs).toEqual(record().summary.jobs);expect(rejected.internalNotes?.[0].at).toBe(now());});
 it("requests only a named field and allows its submitted proposal to be reviewed",async()=>{const {repo,lifecycle}=await fixture();await expect(repo.requestField({...actor,id:"other"},"insp_demo","color","اصلاح رنگ")).rejects.toThrow();await repo.requestField(actor,"insp_demo","color","رنگ بدنه را اصلاح کنید.");const task=(await lifecycle.read(scope,"insp_demo"))!.corrections[0];await lifecycle.submitField(scope,"insp_demo",task.id,{field:"color",value:"black"});await repo.synchronizeFields("insp_demo");expect((await repo.read(actor)).cases[0].fieldCorrections?.[0].state).toBe("submitted");await repo.approveField(actor,"insp_demo",task.id);expect((await repo.read(actor)).cases[0].summary.inspection.vehicle?.colorName).toBe("مشکی");});
 it("archives prior evidence metadata on replacement, never duplicating blobs",async()=>{const {repo}=await fixture();const old=record().summary.jobs[0];await repo.updateResubmittedEvidence("insp_demo",[{...old,id:"replacement",revision:"r2"}]);const updated=(await repo.read(actor)).cases[0];expect(updated.evidenceHistory?.[0].revision).toBe("r1");expect(updated.summary.jobs[0].revision).toBe("r2");expect(updated.evidenceHistory?.[0]).not.toHaveProperty("blob");});
 it("requires acknowledgement and timestamp before displaying forwarded",()=>{const r=record();r.finalDecision={kind:"approved",actorId:actor.id,at:now()};r.forwarding={phase:"sending"};expect(caseLifecycle(r)).toBe("FORWARD_PENDING");r.forwarding={phase:"failed"};expect(caseLifecycle(r)).toBe("FORWARD_FAILED");r.forwarding={phase:"acknowledged",acknowledgementId:"ack"};expect(caseLifecycle(r)).not.toBe("FORWARDED");r.forwarding.acknowledgedAt=now();expect(caseLifecycle(r)).toBe("FORWARDED");});
 it("searches tracking, phone, Persian plate digits and lifecycle without granting access",()=>{const r=record();expect(filterReviewCases([r],"BDI-8F31K2","all")).toHaveLength(1);expect(filterReviewCases([r],"۰۹۱۲۰۰۰۴۵۶۷","all")).toHaveLength(1);expect(filterReviewCases([r],"","REJECTED")).toHaveLength(0);expect(filterReviewCases([r],"not-found","all")).toHaveLength(0);});
});

describe("pre-API revision reconciliation",()=>{
 it("does not replay an archived correction revision over the current revision",async()=>{
  const {repo}=await fixture();const old=record().summary.jobs[0], second={...old,id:"second",revision:"r2"},third={...old,id:"third",revision:"r3"};
  await repo.updateResubmittedEvidence("insp_demo",[second]);await repo.updateResubmittedEvidence("insp_demo",[third]);await repo.updateResubmittedEvidence("insp_demo",[second]);
  const result=(await repo.read(actor)).cases[0];expect(result.summary.jobs[0].revision).toBe("r3");expect(result.evidenceHistory?.map(j=>j.revision)).toEqual(["r1","r2"]);
 });
 it("never changes a finalized case's accepted evidence during synchronization",async()=>{
  const {repo}=await fixture();await repo.finalize(actor,"insp_demo","rejected","رد نهایی");
  await repo.updateResubmittedEvidence("insp_demo",[{...record().summary.jobs[0],id:"late",revision:"late-revision"}]);
  expect((await repo.read(actor)).cases[0].summary.jobs[0].revision).toBe("r1");
 });
});

describe("acknowledged request rounds",()=>{
 function round(round:number,job:UploadJob):EvidenceRequest{return {id:`round-${round}`,inspectionId:"insp_demo",version:1,round,requestedAt:now(),template,originalNamespace:"original",items:[{id:`item-${round}`,kind:"photo",requirementId:job.requirementId!,reviewerReason:"ثبت مجدد",originalEvidenceId:"previous"}],status:"resubmitted",attemptCount:1,receipt:{reference:"BDI-8F31K2",submittedAt:now(),evidenceIds:[job.id],status:"queued-for-review"}};}
 it("uses the latest acknowledged request round regardless of job/IndexedDB order",()=>{
  const base=record().summary.jobs[0],old={...base,id:"r2",revision:"r2"},fresh={...base,id:"r3",revision:"r3"};const a=round(1,old),b=round(2,fresh);old.namespace=requestNamespace(a);fresh.namespace=requestNamespace(b);
  expect(latestSubmittedRevisions(record(),[a,b],[fresh,old])).toEqual([fresh]);expect(latestSubmittedRevisions(record(),[b,a],[old,fresh])).toEqual([fresh]);
 });
 it("rejects unacknowledged job IDs, foreign inspection scopes and superseded requests",()=>{
  const job={...record().summary.jobs[0],id:"replacement"},r=round(1,job);job.namespace=requestNamespace(r);
  expect(latestSubmittedRevisions(record(),[{...r,receipt:{...r.receipt!,evidenceIds:["other"]}}],[job])).toEqual([]);
  expect(latestSubmittedRevisions(record(),[{...r,inspectionId:"other"}],[job])).toEqual([]);
  expect(latestSubmittedRevisions(record(),[{...r,status:"superseded"}],[job])).toEqual([]);
 });
 it("does not revive an older round when the new acknowledged job is unavailable",()=>{
  const old={...record().summary.jobs[0],id:"old"},a=round(1,old),b=round(2,{...old,id:"missing"});old.namespace=requestNamespace(a);
  expect(latestSubmittedRevisions(record(),[a,b],[old])).toEqual([]);
 });
});
