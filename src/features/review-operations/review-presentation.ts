import { lifecycleLabels } from "@/features/inspection-status/lifecycle-model";
import type { UploadJob } from "@/features/upload/upload-model";
import { caseLifecycle, type ReviewCase } from "./model";
export const evidenceDecision = (record: ReviewCase, job?: UploadJob) => job ? record.decisions.find(decision => decision.revision === job.revision && decision.requirementId === (job.requirementId ?? job.evidenceKind)) : undefined;
export function reviewCounts(record: ReviewCase) {
 const current=record.summary.jobs.filter(job=>job.current);
 return {total:current.length,approved:current.filter(job=>evidenceDecision(record,job)?.decision==="approved").length,attention:current.filter(job=>evidenceDecision(record,job)?.decision==="rejected").length,remaining:current.filter(job=>!evidenceDecision(record,job)).length};
}
const normalize=(value:string)=>value.toLowerCase().replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776)).replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632)).trim();
export function filterReviewCases(cases: readonly ReviewCase[], search:string, status:string) {
 const term=normalize(search);
 return cases.filter(record=>(status==="all"||record.status===status||caseLifecycle(record)===status)&&normalize([record.reference,record.customerPhone,lifecycleLabels[caseLifecycle(record)],record.summary.inspection.vehicle?.make,record.summary.inspection.vehicle?.model,...Object.values(record.summary.inspection.vehicle?.plate??{})].join(" ")).includes(term));
}
