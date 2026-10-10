import { z } from "zod";
import { photographyTemplateSchema, type PhotographyTemplate } from "@/schemas/photography";
import { uploadComplete, uploadJobId, type MediaReference, type UploadJob } from "@/features/upload/upload-model";
import type { SubmissionRecord } from "@/features/submission/submission-model";

const itemBase = z.object({ id: z.string().min(1), reviewerReason: z.string().min(1), originalEvidenceId: z.string().min(1) });
export const requestItemSchema = z.discriminatedUnion("kind", [itemBase.extend({ kind: z.literal("photo"), requirementId: z.string().min(1) }), itemBase.extend({ kind: z.literal("video-360") })]);
export type EvidenceRequestItem = z.infer<typeof requestItemSchema>;
export type SupplementalReceipt = { reference: string; submittedAt: string; evidenceIds: string[]; status: "queued-for-review" };
export type EvidenceRequest = {
  id: string; inspectionId: string; version: number; round: number; requestedAt: string;
  template: PhotographyTemplate; originalNamespace: string; items: EvidenceRequestItem[];
  status: "requested" | "resubmitting" | "resubmitted" | "resubmit-failed" | "resolved" | "superseded";
  idempotencyKey?: string; attemptCount: number; owner?: string; leaseUntil?: number; lastError?: string;
  mutationOwner?: string; mutationLeaseUntil?: number; candidateIds?: string[]; receipt?: SupplementalReceipt;
};
export const requestInputSchema = z.object({ id: z.string().min(1), inspectionId: z.string().min(1), version: z.number().int().positive(), round: z.number().int().positive(), requestedAt: z.string().datetime(), template: photographyTemplateSchema, originalNamespace: z.string(), items: z.array(requestItemSchema).min(1) }).superRefine((value, context) => {
  const configured = new Set(value.template.sections.flatMap((section) => section.photoRequirements.map((photo) => photo.id)));
  const targets = value.items.map((item) => item.kind === "photo" ? item.requirementId : item.kind);
  if (new Set(value.items.map((item) => item.id)).size !== value.items.length || new Set(targets).size !== targets.length) context.addIssue({ code: "custom", message: "Duplicate request target" });
  if (value.items.some((item) => item.kind === "photo" ? !configured.has(item.requirementId) : !value.template.captureRequirements?.video360Required)) context.addIssue({ code: "custom", message: "Unknown evidence requirement" });
});
export const requestDatabase = { name: "inspection-evidence-requests", version: 1, records: "requests", receipts: "mock-receipts", settings: "mock-settings" } as const;
export const requestNamespace = (request: EvidenceRequest) => JSON.stringify([request.inspectionId, request.template.templateId, request.template.templateVersion, "additional-evidence", request.id, request.version]);
export const requestActive = (request: EvidenceRequest) => !request.receipt && !["resubmitted", "resolved", "superseded"].includes(request.status);
export const requestTitle = (request: EvidenceRequest, item: EvidenceRequestItem) => item.kind === "video-360" ? "ویدیوی ۳۶۰ درجه" : request.template.sections.flatMap((section) => section.photoRequirements).find((photo) => photo.id === item.requirementId)!.title;
export function assertRequestScope(request: EvidenceRequest | undefined, submission: SubmissionRecord | undefined, scope: { inspectionId: string; requestId: string; version: number; kind: "photo" | "video-360"; requirementId?: string }, mutable = true) {
  if (!submission?.receipt || submission.inspectionId !== scope.inspectionId || !request || request.originalNamespace !== submission.summary?.namespace || request.inspectionId !== scope.inspectionId || request.id !== scope.requestId || request.version !== scope.version || !requestActive(request) || mutable && request.status === "resubmitting") throw new Error("این درخواست فعال نیست یا به این بازدید تعلق ندارد.");
  const item = request.items.find((item) => item.kind === scope.kind && (item.kind !== "photo" || item.requirementId === scope.requirementId));
  if (!item) throw new Error("ویرایش این مدرک در درخواست کارشناس مجاز نیست.");
  return item;
}
/** A request filters the existing template; it never adds photographs to the inspection. */
export function requestTemplate(request: EvidenceRequest): PhotographyTemplate {
  const targets = new Set(request.items.flatMap((item) => item.kind === "photo" ? [item.requirementId] : []));
  return { ...request.template, sections: request.template.sections.map((section) => ({ ...section, photoRequirements: section.photoRequirements.filter((photo) => targets.has(photo.id)) })).filter((section) => section.photoRequirements.length), captureRequirements: { video360Required: request.items.some((item) => item.kind === "video-360") } };
}
export function requestReadiness(request: EvidenceRequest, media: readonly MediaReference[], jobs: readonly UploadJob[], drafts: readonly string[] = []) {
  const itemMedia = request.items.map((item) => media.find((media) => media.namespace === requestNamespace(request) && media.evidenceKind === item.kind && (item.kind !== "photo" || item.requirementId === media.requirementId)));
  const itemJobs = itemMedia.map((media) => media && jobs.find((job) => job.id === uploadJobId(media) && job.current));
  const captured = itemMedia.filter(Boolean).length;
  const uploaded = itemJobs.filter((job) => job && uploadComplete(job) && job.verification !== "retake-requested").length;
  const canResubmit = requestActive(request) && request.status !== "resubmitting" && captured === request.items.length && uploaded === request.items.length && !drafts.length;
  const lifecycle = request.status !== "requested" ? request.status : canResubmit ? "ready-to-resubmit" : captured || drafts.length ? "in-progress" : "requested";
  return { total: request.items.length, captured, uploaded, itemMedia, itemJobs, drafts, lifecycle, canResubmit,
    failed: itemJobs.filter((job) => job?.upload === "failed").length };
}
export const additionalRoutes = {
  list: (inspectionId: string, requestId: string) => `/inspection/${encodeURIComponent(inspectionId)}/additional-evidence/${encodeURIComponent(requestId)}`,
  photo: (id: string, request: string, requirement: string, stage: "guide" | "camera" | "review") => `${additionalRoutes.list(id, request)}/photo/${encodeURIComponent(requirement)}/${stage}`,
  video: (id: string, request: string, stage: "record" | "review") => `${additionalRoutes.list(id, request)}/video/${stage}`,
};
export function itemHref(request: EvidenceRequest, item: EvidenceRequestItem, stage: "capture" | "review" = "capture") {
  return item.kind === "photo" ? additionalRoutes.photo(request.inspectionId, request.id, item.requirementId, stage === "review" ? "review" : "guide") : additionalRoutes.video(request.inspectionId, request.id, stage === "review" ? "review" : "record");
}
export type AdditionalView = { kind: "list" } | { kind: "photo"; requirementId: string; stage: "guide" | "camera" | "review" } | { kind: "video-360"; stage: "record" | "review" };
export function parseAdditionalView(steps: string[]): AdditionalView | undefined {
  if (!steps.length) return { kind: "list" };
  if (steps.length === 3 && steps[0] === "photo" && ["guide", "camera", "review"].includes(steps[2])) return { kind: "photo", requirementId: steps[1], stage: steps[2] as "guide" | "camera" | "review" };
  if (steps.length === 2 && steps[0] === "video" && ["record", "review"].includes(steps[1])) return { kind: "video-360", stage: steps[1] as "record" | "review" };
}
