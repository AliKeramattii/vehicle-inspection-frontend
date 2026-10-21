import { requiredMediaCount } from "@/features/upload/upload-model";
import type {InspectionLifecycle, VehicleFieldCorrection} from "@/features/inspection-status/lifecycle-model";
import type {PhotographyTemplate} from "@/schemas/photography";
import type {InspectionSummary} from "@/features/submission/submission-model";
import type {UploadJob} from "@/features/upload/upload-model";
export type OperationsActor={id:string;role:"platform-admin"|"reviewer"|"template-editor"|"viewer"};
export type Reviewer={id:string;name:string;active:boolean;capacity:number};
export type ReviewDecision={id:string;requirementId:string;revision:string;evidenceId:string;decision:"approved"|"rejected";reason?:string;actorId:string;at:string;requestId?:string};
export type ReviewCase={id:string;reference:string;submittedAt:string;summary:InspectionSummary;template:PhotographyTemplate;reviewerId?:string;status:"awaiting-assignment"|"in-review"|"needs-more-evidence"|"review-complete";decisions:ReviewDecision[];demo?:boolean; tenantId?:string; customerPhone?:string; evidenceHistory?:UploadJob[]; internalNotes?:{text:string;actorId:string;at:string}[]; fieldCorrections?:VehicleFieldCorrection[]; finalDecision?:{kind:"approved"|"rejected";customerReason?:string;actorId:string;at:string}; forwarding?:{phase:"ready"|"sending"|"retrying"|"acknowledged"|"failed";acknowledgementId?:string;acknowledgedAt?:string}};
export type AssignmentEvent={caseId:string;from?:string;to:string;actorId:string;at:string};
export type ReviewWorkspace={mode:"manual"|"random";reviewers:Reviewer[];cases:ReviewCase[];history:AssignmentEvent[]};
export const caseStatusLabels:Record<ReviewCase["status"],string>={"awaiting-assignment":"در انتظار ارجاع","in-review":"در حال بررسی","needs-more-evidence":"نیاز به مدرک تکمیلی","review-complete":"بررسی تکمیل شد"};
export function assertAdmin(actor:OperationsActor){if(actor.role!=="platform-admin")throw new Error("این عملیات فقط برای مدیر سایت مجاز است.");}
export function assertOwnCase(actor:OperationsActor,record:ReviewCase){if(actor.role!=="reviewer"||actor.id!==record.reviewerId)throw new Error("دسترسی به این پرونده مجاز نیست.");}
export const reviewerWorkload=(w:ReviewWorkspace,id:string)=>w.cases.filter(c=>c.reviewerId===id&&!c.finalDecision).length;
export function eligibleReviewers(w:ReviewWorkspace){return w.reviewers.filter(r=>r.active&&reviewerWorkload(w,r.id)<r.capacity);}
export function assignCase(w:ReviewWorkspace,actor:OperationsActor,id:string,reviewerId:string,at:string,reassign=false){
 assertAdmin(actor);const record=w.cases.find(c=>c.id===id),reviewer=w.reviewers.find(r=>r.id===reviewerId);
 if(!record||!reviewer?.active)throw new Error("پرونده یا کارشناس فعال پیدا نشد.");
 if(record.finalDecision)throw new Error("پرونده تکمیل‌شده قابل ارجاع نیست.");
 if(record.reviewerId===reviewerId)return;
 if(record.reviewerId&&!reassign)throw new Error("پرونده قبلاً ارجاع شده است.");
 if(reviewerWorkload(w,reviewerId)>=reviewer.capacity)throw new Error("ظرفیت کارشناس تکمیل است.");
 w.history.push({caseId:id,from:record.reviewerId,to:reviewerId,actorId:actor.id,at});record.reviewerId=reviewerId;
 if(record.status==="awaiting-assignment")record.status="in-review";
}
export function autoAssign(w:ReviewWorkspace,actor:OperationsActor,random:()=>number,at:string){
 assertAdmin(actor);for(const record of w.cases.filter(c=>!c.reviewerId&&c.status==="awaiting-assignment")){
  const eligible=eligibleReviewers(w);if(!eligible.length)break;
  const sample=random();if(!Number.isFinite(sample)||sample<0||sample>=1)throw new Error("Invalid random source");
  assignCase(w,actor,record.id,eligible[Math.floor(sample*eligible.length)].id,at);
 }
}
export function currentEvidence(record:ReviewCase,target:string):UploadJob|undefined{
 return record.summary.jobs.find(j=>j.current&&j.upload==="uploaded"&&(j.requirementId??j.evidenceKind)===target);
}
export const decisionKey=(record:ReviewCase,target:string,revision:string)=>JSON.stringify([record.id,target,revision]);

export function caseLifecycle(record: ReviewCase): InspectionLifecycle {
 if (record.finalDecision?.kind === "rejected") return "REJECTED";
 if (record.finalDecision?.kind === "approved") {
  if (record.forwarding?.phase === "acknowledged" && record.forwarding.acknowledgementId && record.forwarding.acknowledgedAt) return "FORWARDED";
  if (record.forwarding?.phase === "failed") return "FORWARD_FAILED";
  if (record.forwarding && ["sending","retrying"].includes(record.forwarding.phase)) return "FORWARD_PENDING";
  return "REVIEW_APPROVED";
 }
 if (record.fieldCorrections?.some(t=>t.state!=="approved") || record.status === "needs-more-evidence") return "CHANGES_REQUESTED";
 return record.status === "awaiting-assignment" ? "SUBMITTED" : "UNDER_REVIEW";
}

/** Evidence decisions and the complete-inspection decision are separate. */
export function canApproveInspection(record: ReviewCase) {
 const required = record.summary.jobs.filter(j=>j.current&&j.required);
 return !record.finalDecision && record.summary.readiness.canSubmit && required.length === requiredMediaCount(record.template) &&
  required.every(j=>record.decisions.some(d=>d.requirementId===(j.requirementId??j.evidenceKind)&&d.revision===j.revision&&d.decision==="approved")) &&
  !(record.fieldCorrections??[]).some(t=>t.state!=="approved");
}
