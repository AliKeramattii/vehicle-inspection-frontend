"use client";
import { useState } from "react";
import { useAdmin, AdminLink } from "./admin-context";
import { allowed, photoCount, type PublicationState } from "./model";
import { AdminPageHeading, WorkspaceState, PublicationBadge, persian, adminDate } from "./admin-common";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { NativeDialog } from "@/components/ui/native-dialog";
import { InlineAlert } from "@/components/ui/status";
import { adminErrorMessage } from "./repository";
export function TemplateList() {
  const { workspace, repository, actor, refresh, navigate } = useAdmin();
  const [search, setSearch] = useState(""); const [filter, setFilter] = useState<PublicationState | "all">("all");
  const [creating, setCreating] = useState(false); const [title, setTitle] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const templates = workspace?.templates.filter(t => t.title.includes(search) || t.id.includes(search)).filter(t => filter === "all" || t.versions.some(v => v.state === filter)) ?? [];
  async function create() {
    setBusy(true); setError("");
    try { const template = await repository.createTemplate(actor, title); await refresh(); setCreating(false); navigate("/admin/templates/" + template.id); }
    catch (e) { setError(adminErrorMessage(e)); } finally { setBusy(false); }
  }
  return <WorkspaceState><div className="admin-page-scroll">
    <AdminPageHeading title="قالب بازدید" description="تعریف تصاویر، راهنما و نسخه‌های بازدید"
      action={<PrimaryButton disabled={!allowed(actor.role, "editDraft")} onClick={() => { setCreating(true); setTitle(""); setError(""); }}>ایجاد قالب</PrimaryButton>} />
    <div className="admin-panel"><div className="admin-toolbar"><TextInput label="جست‌وجوی قالب" value={search} onChange={e => setSearch(e.target.value)} placeholder="عنوان یا شناسه قالب" />
      <label>وضعیت<select aria-label="وضعیت" value={filter} onChange={e => setFilter(e.target.value as typeof filter)}><option value="all">همه وضعیت‌ها</option><option value="draft">پیش‌نویس</option><option value="published">منتشر شده</option><option value="archived">بایگانی شده</option></select></label></div>
      <div className="admin-table-wrap"><table><caption className="sr-only">قالب‌های بازدید</caption><thead><tr><th>عنوان قالب</th><th>نسخه</th><th>وضعیت</th><th>تصاویر</th><th>بیمه‌گر</th><th>آخرین بروزرسانی</th><th>عملیات</th></tr></thead><tbody>
        {templates.map(t => { const version = (filter !== "all" ? t.versions.findLast(v => v.state === filter) : undefined) ?? t.versions.find(v => v.state === "draft") ?? t.versions.find(v => v.id === t.currentPublishedId) ?? t.versions.at(-1)!;
          return <tr key={t.id}><td><strong>{t.title}</strong><small className="admin-technical" dir="ltr">{t.id}</small></td><td>{persian(version.version)}</td><td><PublicationBadge state={version.state} /></td><td>{persian(photoCount(version))} تصویر</td><td>{t.partner}</td><td>{adminDate(version.updatedAt)}</td><td><AdminLink href={"/admin/templates/" + t.id} className="admin-text-action">مشاهده قالب</AdminLink></td></tr>; })}
      </tbody></table></div>{!templates.length && <p className="admin-empty">قالبی با این جست‌وجو پیدا نشد.</p>}
    </div><p className="admin-footnote">کیلومتر دستی و ویدیوی ۳۶۰ درجه مستقل از تعداد تصاویر هستند.</p>
    {creating && <NativeDialog title="ایجاد قالب از ساختار فعلی" onDismiss={() => setCreating(false)}><p>ساختار هفت بخش و دوازده تصویر، همراه با کیلومتر و ویدیوی مستقل، در پیش‌نویس جدید حفظ می‌شود.</p><TextInput label="عنوان قالب جدید" value={title} onChange={e => setTitle(e.target.value)} error={error || undefined} /><div className="admin-dialog-actions"><SecondaryButton onClick={() => setCreating(false)}>بازگشت</SecondaryButton><PrimaryButton loading={busy} onClick={() => void create()}>ایجاد پیش‌نویس</PrimaryButton></div></NativeDialog>}
    {error && !creating && <InlineAlert tone="destructive">{error}</InlineAlert>}
  </div></WorkspaceState>;
}
