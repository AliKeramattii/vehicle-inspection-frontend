import { indexedDBSubmissionRepository } from "@/features/submission/submission-repository";
import { readFacts, pinPhotographyTemplate } from "@/lib/media/inspection-facts-store";
import { indexedDBPhotoStore, photoNamespace } from "@/lib/media/photo-store";
import { indexedDBCaptureDataStore } from "@/lib/media/capture-data-store";
import { inspectionPhotographyTemplate, legacyPhotographyTemplate } from "./inspection-template";

/** Conservative compatibility: pre-policy facts or media remain twelve-photo v1. No data is rewritten. */
export async function inspectionPhotoTemplate(inspectionId: string) {
 const facts = await readFacts(inspectionId);
 if (facts?.photographyTemplate) return facts.photographyTemplate;
 if (typeof indexedDB !== "undefined") {
  const saved = await indexedDBSubmissionRepository.get(inspectionId);
  if (saved?.summary?.template) return pinPhotographyTemplate(inspectionId, saved.summary.template);
  if (saved?.summary?.namespace === photoNamespace(inspectionId,legacyPhotographyTemplate.templateId,legacyPhotographyTemplate.templateVersion)) return pinPhotographyTemplate(inspectionId, legacyPhotographyTemplate);
 }
 let legacy = Boolean(facts);
 if (!legacy && typeof indexedDB !== "undefined") {
  const namespace = photoNamespace(inspectionId, legacyPhotographyTemplate.templateId, legacyPhotographyTemplate.templateVersion);
  legacy = (await indexedDBPhotoStore.list(namespace)).length > 0;
  if (!legacy) { const data = await indexedDBCaptureDataStore.get(namespace); legacy = Boolean(data.odometer || data.video360); }
 }
 return pinPhotographyTemplate(inspectionId, legacy ? legacyPhotographyTemplate : inspectionPhotographyTemplate);
}
