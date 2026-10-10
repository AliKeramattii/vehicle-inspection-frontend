import { inspectionPhotographyTemplate } from "@/features/photography/inspection-template";
import { indexedDBSubmissionRepository } from "@/features/submission/submission-repository";
import { indexedDBRequestRepository } from "./request-repository";
import { type EvidenceRequest, type EvidenceRequestItem } from "./request-model";

export type RequestFixture = "two-photo" | "one-photo" | "video" | "mixed";
/** Development/test provider only; the production customer cannot create reviewer requests. */
export function fixtureRequest(original: NonNullable<Awaited<ReturnType<typeof indexedDBSubmissionRepository.get>>>, scenario: RequestFixture, round = 1): EvidenceRequest {
  if (!original.receipt || !original.summary) throw new Error("ابتدا بازدید را ارسال کنید.");
  const candidates: EvidenceRequestItem[] = [
    { id: "front", kind: "photo", requirementId: "front-plate", reviewerReason: "پلاک خوانا نیست.", originalEvidenceId: "" },
    { id: "chassis", kind: "photo", requirementId: "chassis-number", reviewerReason: "لطفاً نزدیک‌تر و واضح‌تر عکاسی کنید.", originalEvidenceId: "" },
    { id: "video", kind: "video-360", reviewerReason: "یک دور کامل و پیوسته از خودرو دیده نمی‌شود.", originalEvidenceId: "" },
  ];
  const selected = scenario === "video" ? [candidates[2]] : scenario === "mixed" ? [candidates[0], candidates[2]] : scenario === "one-photo" ? [candidates[0]] : candidates.slice(0, 2);
  const items = selected.map((item) => { const job = original.summary!.jobs.find((job) => job.evidenceKind === item.kind && (item.kind !== "photo" || job.requirementId === item.requirementId)); if (!job) throw new Error("مدرک اولیه این درخواست پیدا نشد."); return { ...item, originalEvidenceId: job.remoteEvidenceId ?? job.id }; });
  return { id: `request-${original.inspectionId}-${round}-${scenario}`, inspectionId: original.inspectionId, version: 1, round, requestedAt: "2026-10-10T07:00:00.000Z", template: inspectionPhotographyTemplate, originalNamespace: original.summary.namespace, items, status: "requested", attemptCount: 0 };
}
export async function activateDevelopmentRequest(inspectionId: string, scenario: RequestFixture = "two-photo") {
  if (process.env.NODE_ENV !== "development") throw new Error("این امکان فقط برای توسعه است.");
  const original = await indexedDBSubmissionRepository.get(inspectionId); if (!original) throw new Error("بازدید ارسال نشده است.");
  const history = await indexedDBRequestRepository.list(inspectionId);
  const request = fixtureRequest(original, scenario, Math.max(0, ...history.map((request) => request.round)) + 1);
  await indexedDBRequestRepository.create(request); return request.id;
}
