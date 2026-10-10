import type { InspectionRepository } from "@/lib/api/repositories";
import { photographyTemplateSchema } from "@/schemas/photography";
import { photoNamespace } from "@/lib/media/photo-store";
import { readUploadPackage } from "@/features/upload/upload-package";
import { indexedDBUploadQueue } from "@/features/upload/queue-repository";
import { mockInspectionId, mockInspectionReference } from "@/mocks/fixtures";
import { deriveInspectionSummary } from "./submission-model";

export async function readInspectionSummary(id: string, repository: InspectionRepository) {
  const [inspection, plan] = await Promise.all([repository.getInspection(id), repository.getCapturePlan(id)]);
  const template = photographyTemplateSchema.parse(plan), namespace = photoNamespace(id, template.templateId, template.templateVersion);
  const capture = await readUploadPackage(id, namespace, template);
  const jobs = await indexedDBUploadQueue.list();
  // Future API adapter supplies the inspection reference; mocks use the same existing identity.
  return deriveInspectionSummary(inspection, id === mockInspectionId ? mockInspectionReference : id, template, capture, jobs);
}
