import { resolveVehicleGuide } from "@/config/vehicle-assets";
import { z } from "zod";
import { photographyTemplateSchema, photoRequirementSchema, inspectionSectionSchema, supplementalCaptureSchema, type PhotographyTemplate, type InspectionSectionId } from "@/schemas/photography";
import { inspectionPhotographyTemplate as defaultPhotographyTemplate } from "@/features/photography/inspection-template";

export const roles = ["platform-admin", "template-editor", "viewer", "reviewer"] as const;
export type AdminRole = typeof roles[number];
export const roleLabels: Record<AdminRole, string> = { "platform-admin": "مدیر سایت", "template-editor": "ویرایشگر قالب", reviewer: "کارشناس", viewer: "مشاهده‌گر" };
export const permissions = ["viewTemplates", "editDraft", "publish", "branding", "policies", "webhooks", "users"] as const;
export type Permission = typeof permissions[number];
export const permissionLabels: Record<Permission, string> = { viewTemplates: "مشاهده قالب‌ها", editDraft: "ویرایش پیش‌نویس", publish: "انتشار نسخه", branding: "مدیریت برندینگ", policies: "مدیریت سیاست‌ها", webhooks: "مدیریت وب‌هوک‌ها", users: "مدیریت کاربران و دسترسی‌ها" };
export function allowed(role: AdminRole, permission: Permission) {
  return role !== "reviewer" && (role === "platform-admin" || permission === "viewTemplates" || (role === "template-editor" && permission === "editDraft"));
}
export type AdminActor = { id: string; name: string; role: AdminRole };
export const actors: Record<AdminRole, AdminActor> = {
  "platform-admin": { id: "admin-demo", name: "علی محمدی", role: "platform-admin" },
  "template-editor": { id: "editor-demo", name: "سارا رضایی", role: "template-editor" },
  reviewer: {id:"reviewer-demo", name:"علی محمدی", role:"reviewer"},
  viewer: { id: "viewer-demo", name: "مشاهده‌گر نمونه", role: "viewer" },
};
export type PublicationState = "draft" | "published" | "archived";
export const stateLabels: Record<PublicationState, string> = { draft: "پیش‌نویس", published: "منتشر شده", archived: "بایگانی شده" };
export type TemplateVersion = {
  id: string; version: number; revision: number; state: PublicationState;
  snapshot: PhotographyTemplate; updatedAt: string; updatedBy: string; publishedAt?: string;
};
export type AdminTemplate = { id: string; title: string; partner: string; currentPublishedId?: string; versions: TemplateVersion[] };
export type AuditEntry = { id: string; at: string; actor: string; action: string; resource: string };
export type Branding = { displayName: string; logo: "/icons/admin/partner.svg"; primary: "#2563EB" };
export type Webhook = { id: string; label: string; endpoint: string; event: "inspection.submitted" | "additional-evidence.resubmitted"; enabled: boolean };
export type AdminUser = { id: string; name: string; identifier: string; role: AdminRole; active: boolean };
export type AdminWorkspace = {
  templates: AdminTemplate[]; audit: AuditEntry[]; sequence: number;
  branding: Branding; webhooks: Webhook[]; users: AdminUser[];
};
export const sectionLabels: Record<InspectionSectionId, string> = Object.fromEntries(defaultPhotographyTemplate.sections.map(s => [s.id, s.title])) as Record<InspectionSectionId, string>;
export const canonicalAssets = defaultPhotographyTemplate.sections.flatMap(s => s.photoRequirements.map(r => r.sampleImage));
const canonicalIds = new Set(defaultPhotographyTemplate.sections.flatMap(s => s.photoRequirements.map(r => r.id)));
export const adminSnapshotSchema = photographyTemplateSchema.safeExtend({ sections: z.array(inspectionSectionSchema.safeExtend({ photoRequirements: z.array(photoRequirementSchema.strict()).min(1) }).strict()).min(1), captureRequirements: supplementalCaptureSchema.strict().optional() }).strict().superRefine((snapshot, context) => {
  const requirements = snapshot.sections.flatMap(s => s.photoRequirements);
  const fail = (message: string) => context.addIssue({ code: "custom", message });
  if (snapshot.sections.length !== defaultPhotographyTemplate.sections.length) fail("هر هفت بخش قالب باید حفظ شود.");
  if (requirements.length !== canonicalIds.size || requirements.some(r => !canonicalIds.has(r.id))) fail("شناسه‌های دوازده تصویر باید حفظ شوند.");
  if (snapshot.sections.some((s, i) => s.order !== i + 1)) fail("ترتیب بخش‌ها باید پیوسته باشد.");
  if (requirements.some(r => !canonicalAssets.includes(resolveVehicleGuide(r.sampleImage)))) fail("تصویر راهنما باید از دارایی‌های تأییدشده باشد.");
  if (requirements.some(r => r.status !== "pending" || r.reviewerReason !== undefined)) fail("وضعیت شواهد در تعریف قالب قابل ویرایش نیست.");
  if (snapshot.captureRequirements?.odometerRequirementId !== "odometer-on" || snapshot.captureRequirements?.video360Required !== true) fail("کیلومتر و ویدیوی الزامی باید جدا از تصاویر حفظ شوند.");
  if (!requirements.find(r => r.id === "odometer-on")?.required) fail("تصویر کیلومترشمار باید الزامی بماند.");
  if (requirements.some(r => !r.title.trim() || !r.description.trim() || r.instructions.some(t => !t.trim()))) fail("عنوان و راهنمای هر تصویر نمی‌تواند خالی باشد.");
});
export const templateTitleSchema = z.string().trim().min(1, "عنوان قالب را وارد کنید.").max(100);
export function photoCount(version: TemplateVersion) { return version.snapshot.sections.reduce((n,s) => n + s.photoRequirements.length, 0); }
export function pinPublishedTemplate(template: AdminTemplate, versionId: string): PhotographyTemplate {
  const version = template.versions.find(v => v.id === versionId && v.state === "published");
  if (!version) throw new Error("Published template not found");
  return structuredClone(version.snapshot);
}
export function moveRequirement(snapshot: PhotographyTemplate, requirementId: string, direction: -1 | 1) {
  const next = structuredClone(snapshot);
  const section = next.sections.find(s => s.photoRequirements.some(r => r.id === requirementId));
  if (!section) return next;
  const index = section.photoRequirements.findIndex(r => r.id === requirementId);
  const target = index + direction;
  if (target >= 0 && target < section.photoRequirements.length) [section.photoRequirements[index],section.photoRequirements[target]] = [section.photoRequirements[target],section.photoRequirements[index]];
  return next;
}
