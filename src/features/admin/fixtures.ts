import { inspectionPhotographyTemplate } from "@/features/photography/inspection-template";
import type { AdminWorkspace } from "./model";
export const seedTime = "2026-10-11T06:30:00.000Z";
export function initialAdminWorkspace(): AdminWorkspace {
  const snapshot = structuredClone(inspectionPhotographyTemplate);
  return {
    sequence: 1,
    templates: [{ id: snapshot.templateId, title: "بازدید استاندارد بیمه بدنه", partner: "بیمه ایران", currentPublishedId: snapshot.templateId + ":v1",
      versions: [{ id: snapshot.templateId + ":v1", version: 1, revision: 1, state: "published", snapshot, updatedAt: seedTime, updatedBy: "علی محمدی", publishedAt: seedTime }] }],
    branding: { displayName: "بیمه ایران", logo: "/icons/admin/partner.svg", primary: "#2563EB" },
    webhooks: [{ id: "hook-1", label: "اعلام ارسال بازدید", endpoint: "https://partner.example.invalid/inspection-events", event: "inspection.submitted", enabled: false }],
    users: [
      { id: "admin-demo", name: "علی محمدی", identifier: "admin-demo", role: "platform-admin", active: true },
      { id: "editor-demo", name: "سارا رضایی", identifier: "editor-demo", role: "template-editor", active: true },
      { id: "reviewer-demo", name: "علی محمدی", identifier: "reviewer-demo", role: "reviewer", active: true },
      { id: "reviewer-sara", name: "سارا رضایی", identifier: "reviewer-sara", role: "reviewer", active: true },
      { id: "viewer-demo", name: "مشاهده‌گر نمونه", identifier: "viewer-demo", role: "viewer", active: true },
    ],
    audit: [{ id: "audit-seed", at: seedTime, actor: "علی محمدی", action: "انتشار نسخه پایه", resource: snapshot.templateId + ":v1" }],
  };
}
