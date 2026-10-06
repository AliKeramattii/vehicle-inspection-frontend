import type { LocalPhoto } from "@/lib/media/photo-store";
import type { InspectionSection, PhotographyTemplate, PhotoRequirement, PhotoRequirementStatus } from "@/schemas/photography";

export const photoStatusLabels: Record<PhotoRequirementStatus, string> = {
  pending: "ثبت نشده", captured: "ثبت شد", uploading: "در حال ارسال", uploaded: "ارسال شد", verified: "تأیید شد", "retake-requested": "نیاز به عکاسی مجدد",
};
export function requirementStatus(photo: PhotoRequirement, records: readonly LocalPhoto[]): PhotoRequirementStatus {
  return records.find((record) => record.requirementId === photo.id)?.status ?? photo.status;
}
export const photoSatisfied = (status: PhotoRequirementStatus) => ["captured", "uploading", "uploaded", "verified"].includes(status);
export type PhotographyVisualState = "pending" | "complete" | "attention";
export function photographyVisualState(photo: PhotoRequirement, records: readonly LocalPhoto[]): PhotographyVisualState {
  const record = records.find((item) => item.requirementId === photo.id);
  const status = requirementStatus(photo, records);
  return status === "retake-requested" || record?.draft ? "attention" : photoSatisfied(status) ? "complete" : "pending";
}
export const photographyStateLabels: Record<PhotographyVisualState, string> = { pending: "ثبت نشده", complete: "ثبت شد", attention: "نیاز به بررسی / عکاسی مجدد" };
export function nextIncompleteRequirement(template: PhotographyTemplate, records: readonly LocalPhoto[]) {
  const section = nextSection(template, records);
  const photo = section && nextRequirement(section, records);
  return section && photo ? { section, photo } : undefined;
}
export function requirementProgress(requirements: readonly PhotoRequirement[], records: readonly LocalPhoto[]) {
  const required = requirements.filter((photo) => photo.required);
  const completed = required.filter((photo) => photoSatisfied(requirementStatus(photo, records))).length;
  const retake = requirements.some((photo) => requirementStatus(photo, records) === "retake-requested");
  // Attention never removes accepted completion credit. Replacement remains atomic.
  const attention = requirements.some((photo) => photographyVisualState(photo, records) === "attention");
  const state: PhotographyVisualState = attention ? "attention" : completed === required.length ? "complete" : completed ? "attention" : "pending";
  return { completed, total: required.length, remaining: required.length - completed, retake, attention, state };
}
export function sectionProgress(section: InspectionSection, records: readonly LocalPhoto[]) {
  return requirementProgress(section.photoRequirements, records);
}
export function photographyProgress(template: PhotographyTemplate, records: readonly LocalPhoto[]) {
  const progress = template.sections.map((section) => sectionProgress(section, records));
  const completed = progress.reduce((total, section) => total + section.completed, 0);
  const total = progress.reduce((total, section) => total + section.total, 0);
  const attention = progress.some((section) => section.attention);
  return { completed, total, remaining: total - completed, percentage: total ? completed / total * 100 : 0, complete: total > 0 && completed === total, attention };
}
export function findRequirement(template: PhotographyTemplate, id: string) {
  for (const section of template.sections) { const photo = section.photoRequirements.find((requirement) => requirement.id === id); if (photo) return { section, photo, index: section.photoRequirements.indexOf(photo) }; }
}
export function nextRequirement(section: InspectionSection, records: readonly LocalPhoto[], confirmedId?: string) {
  return section.photoRequirements.find((photo) => photo.id !== confirmedId && photo.required && !photoSatisfied(requirementStatus(photo, records)));
}
export function nextSection(template: PhotographyTemplate, records: readonly LocalPhoto[]) {
  return [...template.sections].sort((a, b) => a.order - b.order).find((section) => sectionProgress(section, records).remaining > 0);
}
