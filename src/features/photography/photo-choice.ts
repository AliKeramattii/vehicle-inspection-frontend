import type { PhotoRequirement } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { hasIdentificationChoices, identificationPhoto, vehicleIdentificationGuides } from "./vehicle-identification-guides";

export function validPhotoChoice(photo: PhotoRequirement, alternativeId?: string) {
  return !photo.choice || photo.choice.alternatives.some(id => id === alternativeId);
}
export function assertPhotoChoice(photo: PhotoRequirement, alternativeId?: string) {
  if (!validPhotoChoice(photo, alternativeId)) throw new Error("یکی از چهار محل کد را انتخاب کنید.");
}
/** Accepted identity and an unconfirmed replacement identity are separate, just like their Blobs. */
export function evidencePhoto(photo: PhotoRequirement, record?: Pick<LocalPhoto, "alternativeId" | "draft">, includeDraft = true): PhotoRequirement {
  if (!hasIdentificationChoices(photo)) return photo;
  const id = includeDraft && record?.draft ? record.draft.alternativeId : record?.alternativeId;
  const choice = vehicleIdentificationGuides.find(choice => choice.id === id);
  return identificationPhoto(photo, choice);
}
