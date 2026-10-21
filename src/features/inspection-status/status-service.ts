import type { CustomerSourceContext } from "@/features/identity/source-context";
import { readFacts } from "@/lib/media/inspection-facts-store";
import { submissionService } from "@/features/submission/submission-service";
import { indexedDBRequestRepository } from "@/features/additional-evidence/request-repository";
import { additionalRoutes, requestActive } from "@/features/additional-evidence/request-model";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { lifecycleRepository } from "./lifecycle-repository";
import { safeResumeHref, type CustomerInspectionStatus } from "./lifecycle-model";

export interface InspectionStatusAdapter { read(scope: CustomerSourceContext, inspectionId: string): Promise<CustomerInspectionStatus | undefined> }
/** Local simulation only. Production replaces this with an authorized backend status adapter. */
export const mockInspectionStatusAdapter: InspectionStatusAdapter = {
 async read(scope, id) {
  const record = await lifecycleRepository.read(scope, id); if (!record) return;
  const submission = await submissionService.recover(id);
  if (submission?.receipt && ["DRAFT", "UPLOAD_PENDING"].includes(record.status)) await lifecycleRepository.reconcileCaptureStage(scope, id, "SUBMITTED");
  if (!submission?.receipt && ["DRAFT", "UPLOAD_PENDING"].includes(record.status) && (await readFacts(id))?.vehicle) {
   const [{createMockInspectionRepository}, {readInspectionSummary}] = await Promise.all([import("@/mocks/inspection-repository"), import("@/features/submission/summary-source")]);
   const summary = await readInspectionSummary(id, createMockInspectionRepository(scope.tenantId));
   await lifecycleRepository.reconcileCaptureStage(scope, id, summary.readiness.captureComplete ? "UPLOAD_PENDING" : "DRAFT");
  }
  const requests = submission?.receipt ? await indexedDBRequestRepository.list(id) : [];
  if (requests.some(requestActive) && !["REJECTED", "FORWARDED"].includes(record.status)) await lifecycleRepository.reconcileMediaRequest(scope, id);
  return lifecycleRepository.read(scope, id);
 }
};
export async function customerEntryDestination(scope: CustomerSourceContext, id: string) {
 const record = await mockInspectionStatusAdapter.read(scope, id); if (!record) return "/";
 if (record.status === "CHANGES_REQUESTED") {
  const active = (await indexedDBRequestRepository.list(id)).find(requestActive);
  return active && !record.corrections.some(c => c.state !== "approved") ? additionalRoutes.list(id, active.id) : inspectionRoutes.receipt(id);
 }
 if (!["DRAFT", "UPLOAD_PENDING"].includes(record.status)) return inspectionRoutes.receipt(id);
 if (record.status === "UPLOAD_PENDING") return inspectionRoutes.upload(id);
 if ((await submissionService.recover(id))?.status === "submitting") return inspectionRoutes.summary(id);
 if (record.resumeHref) return safeResumeHref(id, record.resumeHref);
 const facts = await readFacts(id); return facts?.vehicle ? inspectionRoutes.capture(id) : facts?.location ? inspectionRoutes.vehicle(id) : "/readiness";
}
