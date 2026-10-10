import { readPhoto, photoKey, type LocalPhoto } from "@/lib/media/photo-store";
import { indexedDBCaptureDataStore } from "@/lib/media/capture-data-store";
import { capturePackageProgress } from "@/features/capture-package/capture-package-model";
import type { PhotographyTemplate } from "@/schemas/photography";
import { acceptedMedia, type MediaReference } from "./upload-model";

/** Only metadata reaches Query/UI. Full-resolution media are read one record at a time, never decoded here. */
export async function readUploadPackage(inspectionId: string, namespace: string, template: PhotographyTemplate) {
  const media: MediaReference[] = [], statuses: LocalPhoto[] = [];
  for (const section of template.sections) for (const requirement of section.photoRequirements) {
    const photo = await readPhoto(photoKey(namespace, requirement.id));
    if (!photo) continue;
    media.push(...acceptedMedia(inspectionId, namespace, template, [photo], { namespace }));
    statuses.push({ key: photo.key, namespace, requirementId: photo.requirementId, status: photo.status });
  }
  const data = await indexedDBCaptureDataStore.get(namespace);
  media.push(...acceptedMedia(inspectionId, namespace, template, [], data));
  return { media, odometer: data.odometer, videoDurationSeconds: data.video360?.accepted?.durationSeconds, capture: capturePackageProgress(template, statuses, data) };
}
