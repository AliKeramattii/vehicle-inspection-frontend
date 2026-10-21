import { vehicleColors } from "@/features/vehicle/vehicle-colors";
import { LifecycleRepository, lifecycleRepository } from "@/features/inspection-status/lifecycle-repository";
import { canApproveInspection, caseLifecycle } from "./model";
import type { VehicleFieldCorrection } from "@/features/inspection-status/lifecycle-model";
import {indexedDBRequestRepository,type RequestRepository} from "@/features/additional-evidence/request-repository";
import {requestActive,type EvidenceRequest} from "@/features/additional-evidence/request-model";
import {openSubmissionDatabase} from "@/features/submission/submission-repository";
import {submissionDatabase,type SubmissionRecord} from "@/features/submission/submission-model";
import {indexedDBUploadQueue} from "@/features/upload/queue-repository";
import {latestSubmittedRevisions} from "./review-revisions";
import type {UploadJob} from "@/features/upload/upload-model";
import {photoNamespace} from "@/lib/media/photo-store";
import {inspectionPhotographyTemplate} from "@/features/photography/inspection-template";
import {assertAdmin,assertOwnCase,assignCase,autoAssign,currentEvidence,decisionKey,type OperationsActor,type ReviewCase,type ReviewWorkspace} from "./model";
import {IndexedDbReviewPersistence,type ReviewPersistence} from "./persistence";
export class ReviewRepository{
 constructor(private persistence:ReviewPersistence,private requests:RequestRepository=indexedDBRequestRepository,private random:()=>number=Math.random,private now:()=>string=()=>new Date().toISOString(),private lifecycle:LifecycleRepository|undefined=typeof indexedDB!=="undefined"?lifecycleRepository:undefined,private tenantId="demo"){}
 read(actor:OperationsActor){return this.persistence.transact(w=>{if(actor.role==="platform-admin")return structuredClone(w);if(actor.role!=="reviewer")throw new Error("دسترسی مجاز نیست.");return {...structuredClone(w),cases:w.cases.filter(c=>c.reviewerId===actor.id),history:w.history.filter(h=>w.cases.some(c=>c.id===h.caseId&&c.reviewerId===actor.id))};});}
 importSubmitted(records:readonly ReviewCase[]){return this.persistence.transact(w=>{for(const record of records)if(!w.cases.some(c=>c.id===record.id))w.cases.push(structuredClone(record));if(w.mode==="random")autoAssign(w,{id:"automatic-local",role:"platform-admin"},this.random,this.now());});}
 async updateResubmittedEvidence(id:string,jobs:UploadJob[]){return this.persistence.transact(w=>{const record=w.cases.find(c=>c.id===id);if(!record||record.finalDecision)return;for(const replacement of jobs){if(record.evidenceHistory?.some(j=>j.evidenceKind===replacement.evidenceKind&&j.requirementId===replacement.requirementId&&j.revision===replacement.revision))continue;const index=record.summary.jobs.findIndex(j=>j.evidenceKind===replacement.evidenceKind&&j.requirementId===replacement.requirementId);if(index>=0&&record.summary.jobs[index].revision!==replacement.revision){(record.evidenceHistory??=[]).push(structuredClone(record.summary.jobs[index]));record.summary.jobs[index]=structuredClone(replacement);record.status="in-review";}}});}
 setMode(actor:OperationsActor,mode:ReviewWorkspace["mode"]){return this.persistence.transact(w=>{assertAdmin(actor);w.mode=mode;if(mode==="random")autoAssign(w,actor,this.random,this.now());});}
 setCapacity(actor:OperationsActor,id:string,capacity:number){return this.persistence.transact(w=>{assertAdmin(actor);if(!Number.isSafeInteger(capacity)||capacity<0||capacity>100)throw new Error("ظرفیت باید عدد صحیح از صفر تا صد باشد.");const r=w.reviewers.find(r=>r.id===id);if(!r)throw new Error("کارشناس پیدا نشد.");r.capacity=capacity;if(w.mode==="random")autoAssign(w,actor,this.random,this.now());});}
 assign(actor:OperationsActor,id:string,reviewer:string,reassign=false){return this.persistence.transact(w=>assignCase(w,actor,id,reviewer,this.now(),reassign));}
 async decide(actor:OperationsActor,caseId:string,target:string,revision:string,decision:"approved"|"rejected",reason?:string){
  const record=await this.persistence.transact(w=>{
   const record=w.cases.find(c=>c.id===caseId);if(!record)throw new Error("پرونده پیدا نشد.");assertOwnCase(actor,record);
   if(record.finalDecision)throw new Error("تصمیم نهایی پرونده ثبت شده است.");
   const media=currentEvidence(record,target);if(!media||media.revision!==revision)throw new Error("این نسخه مدرک دیگر جاری نیست.");
   if(decision==="rejected"&&!reason?.trim())throw new Error("دلیل درخواست ثبت مجدد را بنویسید.");
   const id=decisionKey(record,target,revision),previous=record.decisions.find(d=>d.id===id);
   if(previous){if(previous.decision!==decision||previous.reason!==reason?.trim())throw new Error("تصمیم این نسخه ثبت شده است.");return structuredClone(record);}
   record.decisions.push({id,requirementId:target,revision,evidenceId:media.remoteEvidenceId??media.id,decision,reason:reason?.trim(),actorId:actor.id,at:this.now()});
   if(decision==="rejected")record.status="needs-more-evidence";
   else if(record.summary.jobs.filter(j=>j.current&&j.required).every(j=>record.decisions.some(d=>d.revision===j.revision&&d.requirementId===(j.requirementId??j.evidenceKind)&&d.decision==="approved")))record.status="in-review";
   return structuredClone(record);
  });
  if(decision==="rejected")await this.flushRequest(record);
  await this.publishCustomerStatus(record);
 }
 async publishCustomerStatus(record:ReviewCase) {
  // Synchronization can hold an older snapshot while revision/field updates commit.
  // Publish only the latest stored staff projection, never the caller's stale snapshot.
  const latest=await this.persistence.transact(w=>w.cases.find(c=>c.id===record.id));
  if(!latest)return;record=latest;
  if(record.finalDecision?.kind==="rejected")for(const request of await this.requests.list(record.id))if(requestActive(request))await this.requests.change(request.id,r=>({...r,status:"superseded"}));
  if(!this.lifecycle || record.demo)return;
  await this.lifecycle.applyMockProjection(this.tenantId,record.id,{status:caseLifecycle(record),customerExplanation:record.finalDecision?.kind==="rejected"?record.finalDecision.customerReason:undefined,forwarding:record.forwarding});
 }
 async note(actor:OperationsActor,id:string,text:string) {
  return this.persistence.transact(w=>{const r=w.cases.find(c=>c.id===id);if(!r)throw new Error("پرونده پیدا نشد.");assertOwnCase(actor,r);if(!text.trim()||text.length>2000)throw new Error("یادداشت داخلی معتبر بنویسید.");(r.internalNotes??=[]).push({text:text.trim(),actorId:actor.id,at:this.now()});});
 }
 async requestField(actor:OperationsActor,id:string,field:VehicleFieldCorrection["field"],reason:string) {
  const record=await this.persistence.transact(w=>{const r=w.cases.find(c=>c.id===id);if(!r)throw new Error("پرونده پیدا نشد.");assertOwnCase(actor,r);if(r.finalDecision)throw new Error("تصمیم نهایی ثبت شده است.");if(!["plate","color","modelYear"].includes(field)||!reason.trim()||reason.length>2000)throw new Error("مشخصه و دلیل اصلاح را وارد کنید.");return structuredClone(r);});
  if(!this.lifecycle)throw new Error("سرویس اصلاح مشخصات در دسترس نیست.");
  const task:VehicleFieldCorrection={id:crypto.randomUUID(),field,customerReason:reason.trim(),requestedAt:this.now(),requestedBy:actor.id,state:"requested"};
  await this.lifecycle.requestField(this.tenantId,id,task);
  await this.persistence.transact(w=>{const r=w.cases.find(c=>c.id===id)!;(r.fieldCorrections??=[]).push(task);r.status="needs-more-evidence";});
  await this.publishCustomerStatus({...record,status:"needs-more-evidence",fieldCorrections:[...(record.fieldCorrections??[]),task]});
 }
 async approveField(actor:OperationsActor,id:string,taskId:string) {
  await this.persistence.transact(w=>{const r=w.cases.find(c=>c.id===id);if(!r)throw new Error("پرونده پیدا نشد.");assertOwnCase(actor,r);if(r.finalDecision)throw new Error("تصمیم نهایی ثبت شده است.");});
  if(!this.lifecycle)throw new Error("سرویس اصلاح مشخصات در دسترس نیست.");
  const task=await this.lifecycle.approveField(this.tenantId,id,taskId,actor.id);
  const record=await this.persistence.transact(w=>{const r=w.cases.find(c=>c.id===id)!;r.fieldCorrections=(r.fieldCorrections??[]).map(c=>c.id===task.id?task:c);const vehicle=r.summary.inspection.vehicle;
   if(vehicle&&task.proposal){if(task.proposal.field==="plate")vehicle.plate=task.proposal.value;else if(task.proposal.field==="modelYear")vehicle.year=task.proposal.value;else{const color=vehicleColors.find(c=>c.id===task.proposal!.value);if(color){vehicle.colorName=color.label;vehicle.colorHex=color.hex;}}}
   if(!r.fieldCorrections.some(t=>t.state!=="approved"))r.status="in-review";return structuredClone(r);});
  await this.publishCustomerStatus(record);
 }
 async synchronizeFields(id:string) {
  if(!this.lifecycle)return;
  const projection=await this.lifecycle.staffProjection(this.tenantId,id);if(!projection)return;
  await this.persistence.transact(w=>{const r=w.cases.find(c=>c.id===id);if(r)r.fieldCorrections=projection.corrections;});
 }
 async finalize(actor:OperationsActor,id:string,kind:"approved"|"rejected",customerReason?:string) {
  await this.synchronizeFields(id);
  const record=await this.persistence.transact(w=>{const r=w.cases.find(c=>c.id===id);if(!r)throw new Error("پرونده پیدا نشد.");assertOwnCase(actor,r);
   if(r.finalDecision){if(r.finalDecision.kind===kind&&r.finalDecision.customerReason===customerReason?.trim())return structuredClone(r);throw new Error("تصمیم نهایی این پرونده قبلاً ثبت شده است.");}
   if(kind==="rejected"&&(!customerReason?.trim()||customerReason.length>2000))throw new Error("دلیل کامل رد بازدید را برای مشتری بنویسید.");
   if(kind==="approved"&&!canApproveInspection(r))throw new Error("ابتدا تمام مدارک و اصلاحات لازم را جداگانه بررسی و تأیید کنید.");
   r.finalDecision={kind,customerReason:kind==="rejected"?customerReason!.trim():undefined,actorId:actor.id,at:this.now()};r.status="review-complete";if(kind==="approved")r.forwarding={phase:"ready"};return structuredClone(r);
  });
  await this.publishCustomerStatus(record);return record;
 }

 /** Durable decisions act as an outbox; request creation is idempotent and can be retried after interruption. */
 async flushRequest(record:ReviewCase){
  if(record.finalDecision)return;
  if(record.demo)return;
  const previous=await this.requests.list(record.id);
  // A request may have committed before its acknowledgement/link was interrupted.
  // Reconcile exact decision identities before creating a later round.
  const links=record.decisions.filter(d=>d.decision==="rejected"&&!d.requestId).flatMap(d=>{
   const request=previous.find(r=>r.originalNamespace===record.summary.namespace&&r.items.some(i=>i.id===d.id&&i.originalEvidenceId===d.evidenceId&&(i.kind==="photo"?i.requirementId:i.kind)===d.requirementId));
   return request?[{decisionId:d.id,requestId:request.id}]:[];
  });
  if(links.length)await this.persistence.transact(w=>{const saved=w.cases.find(c=>c.id===record.id)!;for(const link of links){const decision=saved.decisions.find(d=>d.id===link.decisionId);if(decision&&!decision.requestId)decision.requestId=link.requestId;}});
  const rejected=record.decisions.filter(d=>d.decision==="rejected"&&!d.requestId&&!links.some(l=>l.decisionId===d.id));if(!rejected.length)return;
  const active=previous.find(requestActive);
  const bytes=new TextEncoder().encode(JSON.stringify([record.id,...rejected.map(d=>d.id)]));
  const id="review-request-"+btoa(Array.from(bytes,b=>String.fromCharCode(b)).join("")).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");
  if(active&&active.id!==id)return;
  const request:EvidenceRequest={id,inspectionId:record.id,version:1,round:Math.max(0,...previous.map(r=>r.round))+1,requestedAt:rejected[0].at,template:record.template,originalNamespace:record.summary.namespace,status:"requested",attemptCount:0,items:rejected.map(d=>d.requirementId==="video-360"?{id:d.id,kind:"video-360",reviewerReason:d.reason!,originalEvidenceId:d.evidenceId}:{id:d.id,kind:"photo",requirementId:d.requirementId,reviewerReason:d.reason!,originalEvidenceId:d.evidenceId})};
  if(!previous.some(r=>r.id===id))await this.requests.create(request);
  await this.persistence.transact(w=>{const saved=w.cases.find(c=>c.id===record.id)!;for(const d of saved.decisions)if(rejected.some(r=>r.id===d.id))d.requestId=id;});
 }
}
export const reviewRepository=new ReviewRepository(new IndexedDbReviewPersistence());
export async function synchronizeSubmittedCases(tenantId="demo",repository=reviewRepository){
 const db=await openSubmissionDatabase();
 const records=await new Promise<SubmissionRecord[]>((resolve,reject)=>{const tx=db.transaction(submissionDatabase.records),read=tx.objectStore(submissionDatabase.records).getAll();tx.oncomplete=()=>{db.close();resolve(read.result);};tx.onerror=tx.onabort=()=>{db.close();reject(new Error("خواندن بازدیدهای ارسال‌شده ممکن نشد."));};});
 const ownership=new Set<string>();for(const record of records){if(tenantId==="demo"&&record.inspectionId==="insp_demo"||await lifecycleRepository.staffProjection(tenantId,record.inspectionId))ownership.add(record.inspectionId);}
 const customerPhones=new Map<string,string>();for(const id of ownership){const projection=await lifecycleRepository.staffProjection(tenantId,id);if(projection)customerPhones.set(id,projection.mobile);}
 const valid=records.filter(r=>ownership.has(r.inspectionId)&&r.receipt&&r.summary&&(r.summary.template||r.summary.namespace===photoNamespace(r.inspectionId,inspectionPhotographyTemplate.templateId,inspectionPhotographyTemplate.templateVersion))).map(r=>({id:r.inspectionId,reference:r.receipt!.reference,submittedAt:r.receipt!.submittedAt,summary:r.summary!,template:structuredClone(r.summary!.template??inspectionPhotographyTemplate),tenantId,customerPhone:customerPhones.get(r.inspectionId),status:"awaiting-assignment" as const,decisions:[]}));
 await repository.importSubmitted(valid);
 const workspace=await repository.read({id:"local-sync",role:"platform-admin"});
 const jobs=await indexedDBUploadQueue.list();
 for(const record of workspace.cases)if(!record.demo){
  const requests=await indexedDBRequestRepository.list(record.id);
  const replacements=latestSubmittedRevisions(record,requests,jobs);
  await repository.updateResubmittedEvidence(record.id,replacements);await repository.flushRequest(record);await repository.synchronizeFields(record.id);await repository.publishCustomerStatus(record);
 }
 // Existing submission and Additional Evidence remain the customer authorization boundary.

}
