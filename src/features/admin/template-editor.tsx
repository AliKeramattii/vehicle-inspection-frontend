"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PhotographyTemplate } from "@/schemas/photography";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { NativeDialog } from "@/components/ui/native-dialog";
import { InlineAlert } from "@/components/ui/status";
import { Icon } from "@/components/ui/icon";
import { useAdmin, AdminLink } from "./admin-context";
import { adminSnapshotSchema, allowed, moveRequirement, type AdminTemplate, type TemplateVersion } from "./model";
import { WorkspaceState, PublicationBadge, persian, adminDate, GuideImage } from "./admin-common";
import { adminErrorMessage } from "./repository";
import { RequirementFields } from "./requirement-fields";
import { RequirementTable } from "./requirement-table";
export function TemplateEditor({ templateId }: { templateId: string }) {
  const { workspace } = useAdmin();
  const template = workspace?.templates.find(t => t.id === templateId);
  return <WorkspaceState>{template ? <TemplateWorkspace template={template} /> : <div className="admin-recovery"><h1>قالب پیدا نشد</h1><AdminLink href="/admin/templates" className="admin-text-action">بازگشت به قالب‌ها</AdminLink></div>}</WorkspaceState>;
}
function TemplateWorkspace({ template }: { template: AdminTemplate }) {
  const { actor, repository, refresh, confirmAction } = useAdmin();
  const [activeId, setActiveId] = useState<string>(() => template.versions.find(v => v.state === "draft")?.id ?? template.currentPublishedId ?? template.versions.at(-1)!.id);
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const active = template.versions.find(v => v.id === activeId) ?? template.versions.find(v => v.state === "draft") ?? template.versions.find(v => v.id === template.currentPublishedId) ?? template.versions.at(-1)!;
  async function draft() {
    setBusy(true); setMessage("");
    try { const result = await repository.createDraft(actor, template.id, active.id); await refresh(); setActiveId(result.id); }
    catch (e) { setMessage(adminErrorMessage(e)); } finally { setBusy(false); }
  }
  return <div className="admin-template-workspace">
    <div className="admin-template-header"><div><p className="admin-breadcrumb"><AdminLink href="/admin/templates">قالب بازدید</AdminLink> / مدیریت قالب‌ها / {template.partner}</p>
      <div className="admin-template-title"><h1>{template.title} <span>نسخه {persian(active.version)}</span></h1><PublicationBadge state={active.state} /></div>
      <p className="admin-footnote">آخرین بروزرسانی: {adminDate(active.updatedAt)} · توسط {active.updatedBy}</p></div>
      <div className="admin-version-controls"><label>نسخه قالب<select aria-label="نسخه قالب" value={active.id} onChange={e => confirmAction(() => setActiveId(e.target.value))}>{template.versions.map(v => <option key={v.id} value={v.id}>نسخه {persian(v.version)} ({v.state === "draft" ? "پیش‌نویس" : v.state === "published" ? "منتشر شده" : "بایگانی شده"})</option>)}</select></label>
        <SecondaryButton disabled={!allowed(actor.role,"editDraft") || active.state !== "published"} loading={busy} onClick={() => confirmAction(() => void draft())}>ایجاد / بازکردن پیش‌نویس</SecondaryButton></div>
    </div>
    {message && <InlineAlert tone="destructive">{message}</InlineAlert>}
    <DraftEditor key={active.id + ":" + actor.id} version={active} template={template} />
  </div>;
}
function DraftEditor({ version: initialVersion, template }: { version: TemplateVersion; template: AdminTemplate }) {
  const { actor, repository, refresh, setDirty, confirmAction, workspace } = useAdmin();
  const [version, setVersion] = useState(initialVersion);
  const [selected, setSelected] = useState(version.snapshot.sections[0].photoRequirements[0].id);
  const [tab, setTab] = useState<"requirements" | "settings" | "history">("requirements");
  const [dialog, setDialog] = useState<"preview" | "publish" | "archive" | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const form = useForm<PhotographyTemplate>({ defaultValues: version.snapshot, resolver: zodResolver(adminSnapshotSchema) });
  const snapshot = useWatch({ control: form.control }) as PhotographyTemplate; const dirty = form.formState.isDirty;
  const editable = version.state === "draft" && allowed(actor.role,"editDraft");
  useEffect(() => { setDirty(dirty); return () => setDirty(false); }, [dirty,setDirty]);
  const requirement = snapshot.sections.flatMap(s => s.photoRequirements).find(r => r.id === selected)!;
  async function save() {
    setError(""); setNotice("");
    if (!await form.trigger()) { setError("عنوان و راهنمای هر تصویر را کامل کنید. ترتیب، ساختار بخش‌ها و تصویر مرجع باید معتبر باشند."); return; }
    setBusy(true);
    try { const result = await repository.saveDraft(actor, template.id, version.id, version.revision, form.getValues()); setVersion(result); form.reset(result.snapshot); await refresh(); setNotice("پیش‌نویس ذخیره شد."); }
    catch (e) { setError(adminErrorMessage(e)); } finally { setBusy(false); }
  }
  async function publish() {
    setBusy(true); setError("");
    try { const result = await repository.publish(actor, template.id, version.id, version.revision); setVersion(result); form.reset(result.snapshot); setDialog(null); await refresh(); setNotice("نسخه منتشر شد. نسخه‌های بازدیدهای قبلی تغییر نکرده‌اند."); }
    catch (e) { setError(adminErrorMessage(e)); setDialog(null); } finally { setBusy(false); }
  }
  async function reload() {
    try { const fresh = await repository.read(actor); const result = fresh.templates.find(t => t.id === template.id)!.versions.find(v => v.id === version.id)!;
      setVersion(result); form.reset(result.snapshot); setError(""); await refresh(); }
    catch (e) { setError(adminErrorMessage(e)); }
  }
  async function archive() {
    setBusy(true);
    try { await repository.archive(actor, template.id, version.id, version.revision); await reload(); setDialog(null); }
    catch (e) { setError(adminErrorMessage(e)); setDialog(null); } finally { setBusy(false); }
  }
  return <form className="admin-editor-form" onSubmit={e => { e.preventDefault(); void save(); }} noValidate>
    <div className="admin-tabs" role="tablist" aria-label="تنظیمات قالب">{([{id:"settings",title:"تنظیمات کلی",icon:"document"},{id:"requirements",title:"نیازمندی‌های عکاسی",icon:"camera"},{id:"history",title:"تاریخچه نسخه‌ها",icon:"clock"}] as const).map(t => <button type="button" key={t.id} role="tab" aria-selected={tab === t.id} aria-controls={"admin-tab-" + t.id} id={"admin-tab-button-" + t.id} onClick={() => setTab(t.id)}><Icon name={t.icon} size={20} />{t.title}</button>)}</div>
    <div className="admin-editor-feedback">{error && <InlineAlert tone="destructive">{error}<button type="button" className="admin-text-action" onClick={() => confirmAction(() => void reload())}>بارگذاری نسخه تازه</button></InlineAlert>}
      {notice && <InlineAlert tone="success">{notice}</InlineAlert>}
      {!editable && <p className="admin-readonly"><Icon name="lock" size={15} />{version.state === "published" ? "نسخه منتشرشده محفوظ است. برای تغییر، پیش‌نویس بسازید." : version.state === "archived" ? "این پیش‌نویس بایگانی شده است." : "نقش فعلی فقط اجازه مشاهده دارد."}</p>}
    </div>
    <div id={"admin-tab-" + tab} role="tabpanel" aria-labelledby={"admin-tab-button-" + tab} className="admin-editor-content">
      {tab === "requirements" && <div className="admin-editor-grid"><RequirementFields form={form} snapshot={snapshot} requirementId={selected} editable={editable && !busy} />
        <RequirementTable snapshot={snapshot} selected={selected} onSelect={setSelected} editable={editable && !busy} onMove={(id,direction) => form.setValue("sections",moveRequirement(snapshot,id,direction).sections,{shouldDirty:true})} /></div>}
      {tab === "settings" && <section className="admin-settings"><h2>ساختار و ترتیب مراحل</h2><p>هفت بخش پشتیبانی می‌شوند. کیلومتر دستی و ویدیوی بازدید الزام‌های مستقل هستند.</p><ol>{snapshot.sections.map((s,i) => <li key={s.id}><strong>{s.title}</strong><span>{persian(s.photoRequirements.length)} تصویر</span><div className="admin-order-actions">{([-1,1] as const).map(direction => <button type="button" key={direction} aria-label={"انتقال بخش " + s.title + (direction === -1 ? " به بالا" : " به پایین")} disabled={!editable || i + direction < 0 || i + direction >= snapshot.sections.length} onClick={() => {
        const next = structuredClone(snapshot.sections); [next[i],next[i+direction]] = [next[i+direction],next[i]]; next.forEach((section,index) => section.order = index+1); form.setValue("sections",next,{shouldDirty:true});
      }}><Icon name="down" size={18} className={direction === -1 ? "rotate-180" : ""} /></button>)}</div></li>)}</ol><InlineAlert>تعریف قالب از شواهد ثبت‌شده جداست. انتشار، نسخه بازدیدهای موجود را تغییر نمی‌دهد.</InlineAlert></section>}
      {tab === "history" && <section className="admin-history"><h2>نسخه‌ها و سابقه انتشار</h2><div className="admin-table-wrap"><table><thead><tr><th>نسخه</th><th>وضعیت</th><th>بروزرسانی</th><th>عامل</th><th>شناسه ثابت نسخه</th></tr></thead><tbody>{template.versions.map(v => <tr key={v.id}><td>{persian(v.version)}</td><td><PublicationBadge state={v.state} /></td><td>{adminDate(v.updatedAt)}</td><td>{v.updatedBy}</td><td><bdi className="admin-technical">{v.id}</bdi></td></tr>)}</tbody></table></div>
        <h3>فعالیت‌های این قالب</h3><ul className="admin-audit-list">{workspace?.audit.filter(a => a.resource.startsWith(template.id)).map(a => <li key={a.id}><strong>{a.action}</strong><span>{a.actor} · {adminDate(a.at)}</span></li>)}</ul></section>}
    </div>
    <footer className="admin-editor-footer"><div className="admin-footer-actions"><PrimaryButton type="button" disabled={!allowed(actor.role,"publish") || version.state !== "draft" || dirty} loading={busy} onClick={async () => { if (await form.trigger()) setDialog("publish"); else setError("اطلاعات قالب معتبر نیست."); }}>انتشار نسخه جدید</PrimaryButton>
      <SecondaryButton type="submit" disabled={!editable || !dirty} loading={busy}>ذخیره پیش‌نویس</SecondaryButton>
      {editable && <button type="button" className="admin-text-action" onClick={() => setDialog("archive")}>بایگانی پیش‌نویس</button>}</div>
      <SecondaryButton onClick={() => setDialog("preview")}><Icon name="enlarge" size={18} />پیش‌نمایش راهنما</SecondaryButton>
      <span className="admin-save-state" role="status">{dirty ? "تغییرات ذخیره نشده" : "نسخه ذخیره‌شده"}</span></footer>
    {dialog === "preview" && <NativeDialog title={"پیش‌نمایش: " + (requirement.title || "نیازمندی")} onDismiss={() => setDialog(null)}><div className="admin-guide-preview"><GuideImage src={requirement.sampleImage} title={requirement.title} /><h3>{requirement.title}</h3><p>{requirement.description}</p><ol>{requirement.instructions.map((text,i) => <li key={i}>{text}</li>)}</ol><p className="admin-footnote">پیش‌نمایش محتوای همین فرم است؛ بدون ذخیره یا تغییر مسیر مشتری.</p></div></NativeDialog>}
    {dialog === "publish" && <NativeDialog title="انتشار نسخه جدید" onDismiss={() => setDialog(null)}><p>نسخه {persian(version.version)} منتشر شود؟ این نسخه یک تصویر ثابت از قالب خواهد بود. بازدیدهای موجود همچنان نسخه قبلی خود را نگه می‌دارند.</p><div className="admin-dialog-actions"><SecondaryButton onClick={() => setDialog(null)}>بازگشت</SecondaryButton><PrimaryButton loading={busy} onClick={() => void publish()}>تأیید انتشار</PrimaryButton></div></NativeDialog>}
    {dialog === "archive" && <NativeDialog title="بایگانی پیش‌نویس" onDismiss={() => setDialog(null)}><p>پیش‌نویس بایگانی می‌شود. نسخه منتشرشده تغییری نمی‌کند.</p><div className="admin-dialog-actions"><SecondaryButton onClick={() => setDialog(null)}>بازگشت</SecondaryButton><PrimaryButton loading={busy} onClick={() => void archive()}>تأیید بایگانی</PrimaryButton></div></NativeDialog>}
  </form>;
}
