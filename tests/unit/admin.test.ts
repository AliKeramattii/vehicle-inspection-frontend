import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { inspectionPhotographyTemplate as currentTemplate, legacyPhotographyTemplate as inspectionPhotographyTemplate } from "@/features/photography/inspection-template";
import { actors, adminSnapshotSchema, canonicalAssets, moveRequirement, pinPublishedTemplate, allowed, permissions, type AdminRole } from "@/features/admin/model";
import { MemoryAdminPersistence } from "@/features/admin/persistence";
import { MockAdminRepository } from "@/features/admin/repository";
import { initialAdminWorkspace, seedTime } from "@/features/admin/fixtures";
const admin = actors["platform-admin"];
const templateId = inspectionPhotographyTemplate.templateId;
function setup() { const storage = new MemoryAdminPersistence(initialAdminWorkspace(inspectionPhotographyTemplate)); const repo = new MockAdminRepository(storage,() => seedTime); return { storage, repo }; }
async function draft(repo: MockAdminRepository) { return repo.createDraft(admin,templateId,templateId + ":v1"); }
describe("Admin template compatibility", () => {
  it("reuses 7 sections and 12 canonical photo IDs with independent odometer/video", () => {
    const result = adminSnapshotSchema.parse(structuredClone(inspectionPhotographyTemplate));
    expect(result.sections).toHaveLength(7);
    expect(result.sections.flatMap(s => s.photoRequirements)).toHaveLength(12);
    expect(result.captureRequirements).toEqual({odometerRequirementId:"odometer-on",video360Required:true});
    expect(canonicalAssets.every(path => existsSync(join(process.cwd(),"public",path)))).toBe(true);
  });
  it.each(["title","description","instructions","id","asset","order","sections","video","odometer","unknown"])("rejects invalid %s", field => {
    const snapshot = structuredClone(inspectionPhotographyTemplate);
    const first = snapshot.sections[0].photoRequirements[0];
    if (field === "title") first.title = " ";
    if (field === "description") first.description = "";
    if (field === "instructions") first.instructions = [""];
    if (field === "id") first.id = snapshot.sections[0].photoRequirements[1].id;
    if (field === "asset") first.sampleImage = "/assets/inspection/photo-guides/nonexistent.webp";
    if (field === "order") snapshot.sections[0].order = 7;
    if (field === "sections") snapshot.sections.pop();
    if (field === "video") snapshot.captureRequirements!.video360Required = false;
    if (field === "odometer") snapshot.captureRequirements!.odometerRequirementId = "front-plate";
    const input = field === "unknown" ? {...snapshot, unsupportedField:true} : snapshot;
    expect(adminSnapshotSchema.safeParse(input).success).toBe(false);
  });
  it("preserves IDs and updates configured ordering", () => {
    const snapshot = moveRequirement(inspectionPhotographyTemplate,"front-45-right",1);
    expect(snapshot.sections[0].photoRequirements.map(r => r.id)).toEqual(["back-45-right","front-45-right"]);
    expect(inspectionPhotographyTemplate.sections[0].photoRequirements[0].id).toBe("front-45-right");
  });
});
describe("Admin durable service boundary", () => {
  it("creates one draft, saves, persists across repository instances and publishes immutable history", async () => {
    const {repo,storage} = setup(); const version = await draft(repo);
    expect((await draft(repo)).id).toBe(version.id);
    const snapshot = structuredClone(version.snapshot); snapshot.sections[0].photoRequirements[0].title = "عنوان جدید";
    const saved = await repo.saveDraft(admin,templateId,version.id,version.revision,snapshot);
    const reloaded = new MockAdminRepository(storage,() => seedTime);
    expect((await reloaded.read(admin)).templates[0].versions[1].snapshot.sections[0].photoRequirements[0].title).toBe("عنوان جدید");
    const published = await repo.publish(admin,templateId,saved.id,saved.revision);
    await expect(repo.saveDraft(admin,templateId,published.id,published.revision,snapshot)).rejects.toMatchObject({code:"immutable"});
    const w = await repo.read(admin);
    expect(w.templates[0].versions[0].snapshot).toEqual(inspectionPhotographyTemplate);
    expect(w.templates[0].currentPublishedId).toBe(published.id);
    expect(w.audit.some(a => a.action === "انتشار نسخه" && a.actor === admin.name)).toBe(true);
  });
  it("keeps old inspection and additional-evidence pins independent from newly published drafts", async () => {
    const {repo} = setup(); const original = (await repo.read(admin)).templates[0];
    const pinned = pinPublishedTemplate(original,original.currentPublishedId!);
    const v = await draft(repo); v.snapshot.sections[0].photoRequirements[0].title = "جدید";
    const saved = await repo.saveDraft(admin,templateId,v.id,v.revision,v.snapshot);
    await repo.publish(admin,templateId,saved.id,saved.revision);
    const fresh = (await repo.read(admin)).templates[0];
    expect(pinPublishedTemplate(fresh,original.currentPublishedId!)).toEqual(pinned);
    expect(pinned.templateVersion).toBe(1);
    expect(pinned.sections[0].photoRequirements[0].id).toBe("front-45-right");
    expect(inspectionPhotographyTemplate).toEqual(pinned);
    pinned.sections[0].photoRequirements[0].title = "mutated consumer";
    expect(pinPublishedTemplate(fresh,original.currentPublishedId!).sections[0].photoRequirements[0].title).not.toBe("mutated consumer");
  });
  it("rejects stale saves, including concurrent transactions", async () => {
    const {repo} = setup(); const v = await draft(repo);
    const results = await Promise.allSettled([repo.saveDraft(admin,templateId,v.id,v.revision,v.snapshot),repo.saveDraft(admin,templateId,v.id,v.revision,v.snapshot)]);
    expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter(r => r.status === "rejected")).toHaveLength(1);
    await expect(repo.publish(admin,templateId,v.id,v.revision)).rejects.toMatchObject({code:"conflict"});
  });
  it("makes repeated publication idempotent", async () => {
    const {repo} = setup(); const v = await draft(repo);
    await repo.publish(admin,templateId,v.id,v.revision); await repo.publish(admin,templateId,v.id,v.revision);
    expect((await repo.read(admin)).audit.filter(a => a.action === "انتشار نسخه")).toHaveLength(1);
  });
  it("archives a draft without mutating the current published snapshot", async () => {
    const {repo} = setup(); const v = await draft(repo); await repo.archive(admin,templateId,v.id,v.revision);
    const w = await repo.read(admin); expect(w.templates[0].versions[1].state).toBe("archived");
    expect(w.templates[0].currentPublishedId).toBe(templateId + ":v1");
    await expect(repo.saveDraft(admin,templateId,v.id,v.revision,v.snapshot)).rejects.toMatchObject({code:"immutable"});
  });
  it("does not persist invalid edits", async () => {
    const {repo} = setup(); const v = await draft(repo); v.snapshot.sections[0].photoRequirements[0].title = "";
    await expect(repo.saveDraft(admin,templateId,v.id,v.revision,v.snapshot)).rejects.toMatchObject({code:"invalid"});
    expect((await repo.read(admin)).templates[0].versions[1].revision).toBe(1);
  });
  it("creates a new template with stable requirement identities", async () => {
    const {repo} = setup(); const created = await repo.createTemplate(admin,"قالب آزمایشی");
    expect(created.versions[0].snapshot.templateId).toBe(created.id);
    expect(created.versions[0].snapshot.sections.flatMap(s => s.photoRequirements.map(r => r.id))).toEqual(currentTemplate.sections.flatMap(s => s.photoRequirements.map(r => r.id)));
    await expect(repo.createTemplate(admin," ")).rejects.toMatchObject({code:"invalid"});
  });
  it.each(["viewer","template-editor"] as AdminRole[])("denies publishing, branding, users and webhooks for %s", async role => {
    const {repo} = setup(); const v = await draft(repo); const actor = actors[role];
    await expect(repo.publish(actor,templateId,v.id,v.revision)).rejects.toMatchObject({code:"forbidden"});
    await expect(repo.saveBranding(actor,{displayName:"????",logo:"/icons/admin/partner.svg",primary:"#2563EB"})).rejects.toMatchObject({code:"forbidden"});
    await expect(repo.setUserRole(actor,"editor-demo","viewer")).rejects.toMatchObject({code:"forbidden"});
    await expect(repo.setWebhook(actor,"hook-1",true)).rejects.toMatchObject({code:"forbidden"});
  });
  it("allows editor draft changes but rejects viewer writes directly", async () => {
    const {repo} = setup(); const v = await repo.createDraft(actors["template-editor"],templateId,templateId + ":v1");
    await repo.saveDraft(actors["template-editor"],templateId,v.id,v.revision,v.snapshot);
    await expect(repo.saveDraft(actors.viewer,templateId,v.id,v.revision,v.snapshot)).rejects.toMatchObject({code:"forbidden"});
    await expect(repo.createDraft(actors.viewer,templateId,templateId + ":v1")).rejects.toMatchObject({code:"forbidden"});
  });
  it("persists secondary mock configuration and audits role/status changes", async () => {
    const {repo} = setup(); await repo.saveBranding(admin,{displayName:"شریک نمونه جدید",logo:"/icons/admin/partner.svg",primary:"#2563EB"});
    await repo.setWebhook(admin,"hook-1",true); await repo.setUserRole(admin,"editor-demo","viewer");
    const w = await repo.read(admin);
    expect(w.branding.displayName).toBe("شریک نمونه جدید"); expect(w.webhooks[0].enabled).toBe(true); expect(w.users[1].role).toBe("viewer");
    await expect(repo.setUserRole(admin,"admin-demo","viewer")).rejects.toMatchObject({code:"invalid"});
    expect(w.audit).toHaveLength(4);
  });
  it("shares the same permission definition between matrix and repository", () => {
    expect(permissions.every(p => allowed("platform-admin",p))).toBe(true);
    expect(permissions.filter(p => allowed("template-editor",p))).toEqual(["viewTemplates","editDraft"]);
    expect(permissions.filter(p => allowed("viewer",p))).toEqual(["viewTemplates"]);
  });
  it("rolls back failed persistence transactions", async () => {
    const {storage} = setup(); await expect(storage.transact(w => { w.templates = []; throw new Error("failure"); })).rejects.toThrow("failure");
    expect((await storage.read()).templates).toHaveLength(1);
  });
});
