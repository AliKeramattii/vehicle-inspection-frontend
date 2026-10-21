import { requestNamespace, type EvidenceRequest } from "@/features/additional-evidence/request-model";
import type { UploadJob } from "@/features/upload/upload-model";
import type { ReviewCase } from "./model";

/** Request round and acknowledged job IDs, never IndexedDB iteration order, decide the current revision. */
export function latestSubmittedRevisions(record: ReviewCase, requests: readonly EvidenceRequest[], jobs: readonly UploadJob[]): UploadJob[] {
 const rounds = requests.filter(r => r.inspectionId === record.id && r.originalNamespace === record.summary.namespace && r.receipt && r.status !== "superseded")
  .toSorted((a,b) => b.round - a.round || b.version - a.version || a.id.localeCompare(b.id));
 const seen = new Set<string>(), selected: UploadJob[] = [];
 for (const request of rounds) for (const item of request.items) {
  const target = item.kind === "photo" ? item.requirementId : item.kind;
  if (seen.has(target)) continue;
  seen.add(target);
  const job = jobs.find(j => j.inspectionId === record.id && j.namespace === requestNamespace(request) && j.evidenceKind === item.kind &&
   (item.kind !== "photo" || j.requirementId === item.requirementId) && j.current && j.upload === "uploaded" && request.receipt!.evidenceIds.includes(j.id));
  if (job) selected.push(job);
 }
 return selected;
}
