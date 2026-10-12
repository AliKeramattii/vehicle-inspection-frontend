import {indexedDBRequestRepository,type RequestRepository} from "@/features/additional-evidence/request-repository";
import {requestActive,type EvidenceRequest} from "@/features/additional-evidence/request-model";
import {openSubmissionDatabase} from "@/features/submission/submission-repository";
import {submissionDatabase,type SubmissionRecord} from "@/features/submission/submission-model";
import {indexedDBUploadQueue} from "@/features/upload/queue-repository";
import {requestNamespace} from "@/features/additional-evidence/request-model";
import type {UploadJob} from "@/features/upload/upload-model";
import {photoNamespace} from "@/lib/media/photo-store";
import {inspectionPhotographyTemplate} from "@/features/photography/inspection-template";
import {assertAdmin,assertOwnCase,assignCase,autoAssign,currentEvidence,decisionKey,type OperationsActor,type ReviewCase,type ReviewWorkspace} from "./model";
import {IndexedDbReviewPersistence,type ReviewPersistence} from "./persistence";
export class ReviewRepository{
 constructor(private persistence:ReviewPersistence,private requests:RequestRepository=indexedDBRequestRepository,private random:()=>number=Math.random,private now:()=>string=()=>new Date().toISOString()){}
 read(actor:OperationsActor){return this.persistence.transact(w=>{if(actor.role==="platform-admin")return structuredClone(w);if(actor.role!=="reviewer")throw new Error("دسترسی مجاز نیست.");return {...structuredClone(w),cases:w.cases.filter(c=>c.reviewerId===actor.id),history:w.history.filter(h=>w.cases.some(c=>c.id===h.caseId&&c.reviewerId===actor.id))};});}
 importSubmitted(records:readonly ReviewCase[]){return this.persistence.transact(w=>{for(const record of records)if(!w.cases.some(c=>c.id===record.id))w.cases.push(structuredClone(record));if(w.mode==="random")autoAssign(w,{id:"automatic-local",role:"platform-admin"},this.random,this.now());});}
 async updateResubmittedEvidence(id:string,jobs:UploadJob[]){return this.persistence.transact(w=>{const record=w.cases.find(c=>c.id===id);if(!record)return;for(const replacement of jobs){const index=record.summary.jobs.findIndex(j=>j.evidenceKind===replacement.evidenceKind&&j.requirementId===replacement.requirementId);if(index>=0&&record.summary.jobs[index].revision!==replacement.revision){record.summary.jobs[index]=structuredClone(replacement);record.status="in-review";}}});}
 setMode(actor:OperationsActor,mode:ReviewWorkspace["mode"]){return this.persistence.transact(w=>{assertAdmin(actor);w.mode=mode;if(mode==="random")autoAssign(w,actor,this.random,this.now());});}
 setCapacity(actor:OperationsActor,id:string,capacity:number){return this.persistence.transact(w=>{assertAdmin(actor);if(!Number.isSafeInteger(capacity)||capacity<0||capacity>100)throw new Error("ظرفیت باید عدد صحیح از صفر تا صد باشد.");const r=w.reviewers.find(r=>r.id===id);if(!r)throw new Error("کارشناس پیدا نشد.");r.capacity=capacity;if(w.mode==="random")autoAssign(w,actor,this.random,this.now());});}
 assign(actor:OperationsActor,id:string,reviewer:string,reassign=false){return this.persistence.transact(w=>assignCase(w,actor,id,reviewer,this.now(),reassign));}
 async decide(actor:OperationsActor,caseId:string,target:string,revision:string,decision:"approved"|"rejected",reason?:string){
  const record=await this.persistence.transact(w=>{
   const record=w.cases.find(c=>c.id===caseId);if(!record)throw new Error("پرونده پیدا نشد.");assertOwnCase(actor,record);
   const media=currentEvidence(record,target);if(!media||media.revision!==revision)throw new Error("این نسخه مدرک دیگر جاری نیست.");
   if(decision==="rejected"&&!reason?.trim())throw new Error("دلیل درخواست ثبت مجدد را بنویسید.");
   const id=decisionKey(record,target,revision),previous=record.decisions.find(d=>d.id===id);
   if(previous){if(previous.decision!==decision||previous.reason!==reason?.trim())throw new Error("تصمیم این نسخه ثبت شده است.");return structuredClone(record);}
   record.decisions.push({id,requirementId:target,revision,evidenceId:media.remoteEvidenceId??media.id,decision,reason:reason?.trim(),actorId:actor.id,at:this.now()});
   if(decision==="rejected")record.status="needs-more-evidence";
   else if(record.summary.jobs.filter(j=>j.current&&j.required).every(j=>record.decisions.some(d=>d.revision===j.revision&&d.requirementId===(j.requirementId??j.evidenceKind)&&d.decision==="approved")))record.status="review-complete";
   return structuredClone(record);
  });
  if(decision==="rejected")await this.flushRequest(record);
 }
 /** Durable decisions act as an outbox; request creation is idempotent and can be retried after interruption. */
 async flushRequest(record:ReviewCase){
  if(record.demo)return;
  const rejected=record.decisions.filter(d=>d.decision==="rejected"&&!d.requestId);if(!rejected.length)return;
  const previous=await this.requests.list(record.id);
  const active=previous.find(requestActive);
  const bytes=new TextEncoder().encode(JSON.stringify([record.id,...rejected.map(d=>d.revision)]));
  const id="review-request-"+btoa(Array.from(bytes,b=>String.fromCharCode(b)).join("")).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");
  if(active&&active.id!==id)return;
  const request:EvidenceRequest={id,inspectionId:record.id,version:1,round:Math.max(0,...previous.map(r=>r.round))+1,requestedAt:rejected[0].at,template:record.template,originalNamespace:record.summary.namespace,status:"requested",attemptCount:0,items:rejected.map(d=>d.requirementId==="video-360"?{id:d.id,kind:"video-360",reviewerReason:d.reason!,originalEvidenceId:d.evidenceId}:{id:d.id,kind:"photo",requirementId:d.requirementId,reviewerReason:d.reason!,originalEvidenceId:d.evidenceId})};
  if(!previous.some(r=>r.id===id))await this.requests.create(request);
  await this.persistence.transact(w=>{const saved=w.cases.find(c=>c.id===record.id)!;for(const d of saved.decisions)if(rejected.some(r=>r.id===d.id))d.requestId=id;});
 }
}
export const reviewRepository=new ReviewRepository(new IndexedDbReviewPersistence());
export async function synchronizeSubmittedCases(){
 const db=await openSubmissionDatabase();
 const records=await new Promise<SubmissionRecord[]>((resolve,reject)=>{const tx=db.transaction(submissionDatabase.records),read=tx.objectStore(submissionDatabase.records).getAll();tx.oncomplete=()=>{db.close();resolve(read.result);};tx.onerror=tx.onabort=()=>{db.close();reject(new Error("خواندن بازدیدهای ارسال‌شده ممکن نشد."));};});
 const valid=records.filter(r=>r.receipt&&r.summary&&(r.summary.template||r.summary.namespace===photoNamespace(r.inspectionId,inspectionPhotographyTemplate.templateId,inspectionPhotographyTemplate.templateVersion))).map(r=>({id:r.inspectionId,reference:r.receipt!.reference,submittedAt:r.receipt!.submittedAt,summary:r.summary!,template:structuredClone(r.summary!.template??inspectionPhotographyTemplate),status:"awaiting-assignment" as const,decisions:[]}));
 await reviewRepository.importSubmitted(valid);
 const workspace=await reviewRepository.read({id:"local-sync",role:"platform-admin"});
 const jobs=await indexedDBUploadQueue.list();
 for(const record of workspace.cases)if(!record.demo){
  const requests=await indexedDBRequestRepository.list(record.id),submitted=new Set(requests.filter(r=>r.receipt).map(requestNamespace));
  const replacements=jobs.filter(j=>submitted.has(j.namespace)&&j.current&&j.upload==="uploaded");
  await reviewRepository.updateResubmittedEvidence(record.id,replacements);await reviewRepository.flushRequest(record);
 }
 // Existing submission and Additional Evidence remain the customer authorization boundary.

}
