import {inspectionPhotographyTemplate} from "@/features/photography/inspection-template";
import type { PhotographyTemplate } from "@/schemas/photography";
import { adminSnapshotSchema, allowed, templateTitleSchema, roles, type AdminActor, type AdminTemplate, type AdminWorkspace, type Permission, type TemplateVersion, type Branding, type AdminRole } from "./model";
import type { AdminPersistence } from "./persistence";
export class AdminError extends Error {
  constructor(public code: "forbidden" | "conflict" | "invalid" | "not-found" | "immutable", message: string) { super(message); }
}
export function adminErrorMessage(error: unknown): string {
  if (error instanceof AdminError) return error.message;
  return "ذخیره‌سازی در دسترس نیست. تغییرات شما حفظ شده‌اند؛ دوباره تلاش کنید.";
}
export interface AdminRepository {
  read(actor: AdminActor): Promise<AdminWorkspace>;
  createDraft(actor: AdminActor, templateId: string, sourceId: string): Promise<TemplateVersion>;
  createTemplate(actor: AdminActor, title: string): Promise<AdminTemplate>;
  saveDraft(actor: AdminActor, templateId: string, versionId: string, revision: number, snapshot: PhotographyTemplate): Promise<TemplateVersion>;
  publish(actor: AdminActor, templateId: string, versionId: string, revision: number): Promise<TemplateVersion>;
  archive(actor: AdminActor, templateId: string, versionId: string, revision: number): Promise<void>;
  saveBranding(actor: AdminActor, branding: Branding): Promise<void>;
  setWebhook(actor: AdminActor, id: string, enabled: boolean): Promise<void>;
  setUserRole(actor: AdminActor, id: string, role: AdminRole): Promise<void>;
}
function authorize(actor: AdminActor, permission: Permission) {
  if (!roles.includes(actor.role) || !allowed(actor.role, permission)) throw new AdminError("forbidden", "نقش فعلی اجازه این عملیات را ندارد.");
}
function templateIn(w: AdminWorkspace, id: string) {
  const template = w.templates.find(t => t.id === id);
  if (!template) throw new AdminError("not-found", "قالب پیدا نشد."); return template;
}
function versionIn(t: AdminTemplate, id: string) {
  const version = t.versions.find(v => v.id === id);
  if (!version) throw new AdminError("not-found", "نسخه پیدا نشد."); return version;
}
function editable(version: TemplateVersion, revision: number) {
  if (version.state !== "draft") throw new AdminError("immutable", "نسخه منتشرشده قابل ویرایش نیست. پیش‌نویس بسازید.");
  if (version.revision !== revision) throw new AdminError("conflict", "این پیش‌نویس در پنجره دیگری تغییر کرده است. نسخه تازه را بارگذاری کنید.");
}
function validate(snapshot: PhotographyTemplate) {
  const parsed = adminSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) throw new AdminError("invalid", "عنوان، راهنما، تصویر مرجع و ترتیب نیازمندی‌ها را بررسی کنید.");
  return parsed.data;
}
export class MockAdminRepository implements AdminRepository {
  constructor(private storage: AdminPersistence, private now = () => new Date().toISOString()) {}
  async read(actor: AdminActor) { authorize(actor, "viewTemplates"); return this.storage.read(); }
  private audit(w: AdminWorkspace, actor: AdminActor, action: string, resource: string) {
    w.sequence++; w.audit.unshift({ id: "audit-" + w.sequence, at: this.now(), actor: actor.name, action, resource });
  }
  async createDraft(actor: AdminActor, templateId: string, sourceId: string) {
    authorize(actor, "editDraft");
    return this.storage.transact(w => {
      const template = templateIn(w, templateId);
      const source = versionIn(template, sourceId);
      const existing = template.versions.find(v => v.state === "draft");
      if (existing) return existing;
      if (source.state !== "published") throw new AdminError("invalid", "پیش‌نویس باید از نسخه منتشرشده ساخته شود.");
      const version = Math.max(...template.versions.map(v => v.version)) + 1;
      const snapshot = structuredClone(source.snapshot); snapshot.templateVersion = version;
      const draft: TemplateVersion = { id: template.id + ":v" + version, version, revision: 1, state: "draft", snapshot, updatedAt: this.now(), updatedBy: actor.name };
      template.versions.push(draft); this.audit(w, actor, "ایجاد پیش‌نویس", draft.id); return draft;
    });
  }
  async createTemplate(actor: AdminActor, title: string) {
    authorize(actor, "editDraft");
    const parsed = templateTitleSchema.safeParse(title);
    if (!parsed.success) throw new AdminError("invalid", "عنوان قالب را وارد کنید.");
    return this.storage.transact(w => {
      w.sequence++; const id = "inspection-template-" + w.sequence;
      const snapshot = structuredClone(inspectionPhotographyTemplate); snapshot.templateId = id; snapshot.templateVersion = 1;
      const template: AdminTemplate = { id, title: parsed.data, partner: w.branding.displayName, versions: [{ id: id + ":v1", version: 1, revision: 1, state: "draft", snapshot, updatedAt: this.now(), updatedBy: actor.name }] };
      w.templates.push(template); this.audit(w, actor, "ایجاد قالب و پیش‌نویس", id); return template;
    });
  }
  async saveDraft(actor: AdminActor, templateId: string, versionId: string, revision: number, snapshot: PhotographyTemplate) {
    authorize(actor, "editDraft"); const parsed = validate(snapshot);
    return this.storage.transact(w => {
      const version = versionIn(templateIn(w, templateId), versionId); editable(version, revision);
      if (parsed.photoPolicyVersion !== version.snapshot.photoPolicyVersion) throw new AdminError("invalid", "سیاست نیازمندی‌های این نسخه قابل تغییر نیست؛ قالب جدید بسازید.");
      if (parsed.templateId !== templateId || parsed.templateVersion !== version.version) throw new AdminError("invalid", "شناسه و نسخه قالب قابل تغییر نیست.");
      version.snapshot = parsed; version.revision++; version.updatedAt = this.now(); version.updatedBy = actor.name;
      this.audit(w, actor, "ذخیره پیش‌نویس", version.id); return version;
    });
  }
  async publish(actor: AdminActor, templateId: string, versionId: string, revision: number) {
    authorize(actor, "publish");
    return this.storage.transact(w => {
      const template = templateIn(w, templateId); const version = versionIn(template, versionId);
      if (version.state === "published") return version; // stable version identity makes repeat publication idempotent
      editable(version, revision); validate(version.snapshot);
      version.state = "published"; version.revision++; version.updatedAt = this.now(); version.publishedAt = this.now(); version.updatedBy = actor.name;
      template.currentPublishedId = version.id; this.audit(w, actor, "انتشار نسخه", version.id); return version;
    });
  }
  async archive(actor: AdminActor, templateId: string, versionId: string, revision: number) {
    authorize(actor, "editDraft"); await this.storage.transact(w => {
      const version = versionIn(templateIn(w, templateId), versionId); editable(version, revision);
      version.state = "archived"; version.revision++; this.audit(w, actor, "بایگانی پیش‌نویس", version.id);
    });
  }
  async saveBranding(actor: AdminActor, branding: Branding) {
    authorize(actor, "branding");
    if (!branding.displayName.trim() || branding.displayName.length > 100 || branding.logo !== "/icons/admin/partner.svg" || branding.primary !== "#2563EB") throw new AdminError("invalid", "نام و تنظیمات برند را بررسی کنید.");
    await this.storage.transact(w => { w.branding = { ...branding, displayName: branding.displayName.trim() }; this.audit(w, actor, "ذخیره برندینگ نمونه", "branding"); });
  }
  async setWebhook(actor: AdminActor, id: string, enabled: boolean) {
    authorize(actor, "webhooks"); await this.storage.transact(w => {
      const hook = w.webhooks.find(h => h.id === id); if (!hook) throw new AdminError("not-found", "وب‌هوک پیدا نشد.");
      hook.enabled = enabled; this.audit(w, actor, "تغییر وضعیت وب‌هوک نمونه", id);
    });
  }
  async setUserRole(actor: AdminActor, id: string, role: AdminRole) {
    authorize(actor, "users");
    if (!roles.includes(role)) throw new AdminError("invalid", "نقش معتبر نیست.");
    await this.storage.transact(w => {
      const user = w.users.find(u => u.id === id); if (!user) throw new AdminError("not-found", "کاربر پیدا نشد.");
      if (user.role === "platform-admin" && role !== "platform-admin" && w.users.filter(u => u.role === "platform-admin" && u.active).length === 1) throw new AdminError("invalid", "حداقل یک مدیر فعال باید باقی بماند.");
      user.role = role; this.audit(w, actor, "تغییر نقش نمونه", id);
    });
  }
}
