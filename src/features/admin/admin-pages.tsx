"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdmin, AdminLink } from "./admin-context";
import { AdminPageHeading, WorkspaceState, adminDate, persian } from "./admin-common";
import { permissions, permissionLabels, roleLabels, roles, allowed, type AdminRole } from "./model";
import { adminErrorMessage } from "./repository";
import { PrimaryButton } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineAlert } from "@/components/ui/status";
import { OperationalSnapshot } from "./operational-snapshot";
import { Icon } from "@/components/ui/icon";
export function AdminOverview() {
  const { workspace } = useAdmin();
  const counts = [{ title: "قالب‌های بازدید", value: workspace?.templates.length ?? 0 }, { title: "نسخه‌های منتشرشده", value: workspace?.templates.flatMap(t => t.versions).filter(v => v.state === "published").length ?? 0 }, { title: "پیش‌نویس‌ها", value: workspace?.templates.flatMap(t => t.versions).filter(v => v.state === "draft").length ?? 0 }, { title: "کاربران نمونه", value: workspace?.users.length ?? 0 }];
  return <WorkspaceState><div className="admin-page-scroll"><AdminPageHeading title="داشبورد" description="نمای کلی تنظیمات و فعالیت‌های محیط نمونه" action={<AdminLink href="/admin/templates" className="admin-primary-link">مدیریت قالب بازدید</AdminLink>} />
    <OperationalSnapshot/><div className="admin-metrics" aria-label="پیکربندی محیط نمونه">{counts.map(c => <section key={c.title}><p>{c.title}</p><strong>{persian(c.value)}</strong></section>)}</div>
    <div className="admin-overview-grid"><section className="admin-panel admin-panel-padding"><h2>فعالیت‌های اخیر</h2><ul className="admin-audit-list">{workspace?.audit.slice(0,8).map(a => <li key={a.id}><strong>{a.action}</strong><span>{a.actor} · {adminDate(a.at)}</span><bdi className="admin-technical">{a.resource}</bdi></li>)}</ul></section>
      <section className="admin-panel admin-panel-padding"><h2>بازدید تصویرمحور</h2><p>قالب پایه شامل هفت بخش و دوازده تصویر است. کیلومتر دستی و ویدیوی ۳۶۰ درجه به‌صورت مستقل تعریف شده‌اند.</p><p>انتشار نسخه جدید، بازدیدهای ثبت‌شده یا درخواست‌های شواهد تکمیلی را تغییر نمی‌دهد.</p><AdminLink href="/admin/templates/body-image-guided" className="admin-text-action">مشاهده قالب پایه</AdminLink></section></div>
    <InlineAlert>این آمار از مخزن محلی نمونه محاسبه می‌شود؛ آمار تولید یا بازدیدهای واقعی نیست.</InlineAlert>
  </div></WorkspaceState>;
}
const brandingForm = z.object({ displayName: z.string().trim().min(1,"نام بیمه‌گر را وارد کنید.").max(100,"نام بیش از حد طولانی است.") });
export function BrandingPage() {
  const { workspace } = useAdmin();
  return <WorkspaceState>{workspace && <BrandingEditor initialName={workspace.branding.displayName} />}</WorkspaceState>;
}
function BrandingEditor({ initialName }: { initialName: string }) {
  const { actor, repository, workspace, refresh, setDirty } = useAdmin();
  const [feedback, setFeedback] = useState(""); const [error, setError] = useState("");
  const form = useForm<z.infer<typeof brandingForm>>({ defaultValues: { displayName: initialName }, resolver: zodResolver(brandingForm) });
  // The form is the only unsaved branding state; saved configuration remains in the repository.
  const dirty = form.formState.isDirty;
  const displayName = useWatch({ control: form.control, name: "displayName" });
  useEffect(() => { setDirty(dirty); return () => setDirty(false); }, [dirty,setDirty]);
  return <div className="admin-page-scroll"><AdminPageHeading action={<AdminLink href="/admin/site-settings" className="admin-primary-link">تنظیمات سایت</AdminLink>} title="برندینگ" description="تنظیمات نمایشی شریک در محیط مدیریت نمونه" />
    <form className="admin-panel admin-compact-form" onSubmit={form.handleSubmit(async values => {
      setError(""); setFeedback("");
      try { await repository.saveBranding(actor, { ...workspace!.branding, displayName: values.displayName }); form.reset(values); setDirty(false); await refresh(); setFeedback("تنظیمات نمونه ذخیره شد."); }
      catch(e) { setError(adminErrorMessage(e)); }
    })}><fieldset disabled={!allowed(actor.role,"branding")}><TextInput label="نام نمایشی بیمه‌گر" {...form.register("displayName")} error={form.formState.errors.displayName?.message} />
      <div className="admin-brand-preview"><Icon name="shield" size={40} /><strong>{displayName}</strong></div>
      <TextInput label="رنگ اصلی برند" value="#2563EB" dir="ltr" readOnly hint="رنگ مصوب در این فاز ثابت است." /><p>نشانه موجود شریک حفظ می‌شود. برای انتخاب لوگو و تصاویر محلی از صفحه تنظیمات سایت استفاده کنید. انتشار روی سرور به سرویس آینده نیاز دارد.</p>
      <PrimaryButton type="submit" loading={form.formState.isSubmitting} disabled={!dirty}>ذخیره تنظیمات نمونه</PrimaryButton></fieldset>
      {error && <InlineAlert tone="destructive">{error}</InlineAlert>}{feedback && <InlineAlert tone="success">{feedback}</InlineAlert>}
    </form><InlineAlert>این تنظیمات فقط در Admin ذخیره می‌شوند و ظاهر مشتری را تغییر نمی‌دهند.</InlineAlert>
  </div>;
}
export function PoliciesPage() {
  return <WorkspaceState><div className="admin-page-scroll"><AdminPageHeading title="سیاست‌ها" description="قواعد فعلی محصول و مرزهای اجرای آینده" />
    <section className="admin-panel admin-panel-padding"><h2>الزامات ثبت و ارسال</h2><dl className="admin-policy-list"><div><dt>ساختار تصاویر</dt><dd>از نسخه قالب بازدید؛ قالب پایه هفت بخش و دوازده تصویر دارد.</dd></div><div><dt>کیلومتر</dt><dd>عدد صحیح غیرمنفی؛ مستقل از فایل‌های رسانه‌ای.</dd></div><div><dt>ویدیوی ۳۶۰ درجه</dt><dd>ویدیوی پیوسته حرکت دور خودرو؛ مستقل از تصاویر.</dd></div><div><dt>ارسال نهایی</dt><dd>ثبت همه الزامات و تکمیل ارسال باینری رسانه‌ها؛ پردازش با تأیید متفاوت است.</dd></div><div><dt>حریم خصوصی</dt><dd>رضایت پیش از ثبت بازدید؛ متن قانونی مشتری در این صفحه ویرایش نمی‌شود.</dd></div></dl></section>
    <InlineAlert>فقط‌خواندنی: تغییر سیاست پذیرش بیمه یا قواعد اجرایی به قرارداد و اعمال سمت ASP.NET نیاز دارد.</InlineAlert>
  </div></WorkspaceState>;
}
export function WebhooksPage() {
  const { workspace, repository, actor, refresh } = useAdmin(); const [error,setError] = useState(""); const [notice,setNotice] = useState(""); const [busy,setBusy] = useState(false);
  return <WorkspaceState><div className="admin-page-scroll"><AdminPageHeading title="وب‌هوک‌ها" description="پیکربندی اعلان‌های شریک در محیط نمونه" />
    <div className="admin-panel admin-table-wrap"><table><thead><tr><th>عنوان</th><th>رویداد</th><th>نشانی مقصد</th><th>وضعیت</th><th>تحویل</th></tr></thead><tbody>{workspace?.webhooks.map(h => <tr key={h.id}><td>{h.label}</td><td><bdi className="admin-technical">{h.event}</bdi></td><td><bdi className="admin-technical">{h.endpoint}</bdi></td><td><Checkbox label={h.enabled ? "فعال در نمونه" : "غیرفعال"} checked={h.enabled} disabled={!allowed(actor.role,"webhooks") || busy} onChange={async e => { setBusy(true); setError(""); setNotice(""); try { await repository.setWebhook(actor,h.id,e.target.checked); await refresh(); setNotice("وضعیت وب‌هوک نمونه ذخیره شد."); } catch(error) { setError(adminErrorMessage(error)); } finally { setBusy(false); } }} /></td><td>اتصال برقرار نشده</td></tr>)}</tbody></table></div>
    {error && <InlineAlert tone="destructive">{error}</InlineAlert>}{notice && <InlineAlert tone="success">{notice}</InlineAlert>}
    <InlineAlert>هیچ درخواست خارجی ارسال نمی‌شود. تحویل، امضا و مدیریت امن کلیدها بر عهده سرویس آینده است.</InlineAlert>
  </div></WorkspaceState>;
}
export function UsersPage() {
  const { workspace, repository, actor, refresh } = useAdmin(); const [error,setError] = useState(""); const [notice,setNotice] = useState(""); const [busy,setBusy] = useState(false);
  return <WorkspaceState><div className="admin-page-scroll"><AdminPageHeading title="کاربران" description="هویت‌ها و نقش‌های محلی آزمایشی" />
    <div className="admin-panel admin-table-wrap"><table><thead><tr><th>نام</th><th>شناسه</th><th>نقش</th><th>وضعیت</th></tr></thead><tbody>{workspace?.users.map(u => <tr key={u.id}><td>{u.name}</td><td><bdi className="admin-technical">{u.identifier}</bdi></td><td><select aria-label={"نقش " + u.name} value={u.role} disabled={!allowed(actor.role,"users") || busy} onChange={async e => { setBusy(true); setError(""); setNotice(""); try { await repository.setUserRole(actor,u.id,e.target.value as AdminRole); await refresh(); setNotice("نقش نمونه ذخیره شد."); } catch(error) { setError(adminErrorMessage(error)); } finally { setBusy(false); } }}>{roles.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}</select></td><td>{u.active ? "فعال" : "غیرفعال"}</td></tr>)}</tbody></table></div>
    {error && <InlineAlert tone="destructive">{error}</InlineAlert>}{notice && <InlineAlert tone="success">{notice}</InlineAlert>}
    <InlineAlert>این مدیریت نقش‌ها نمونه محلی است. ورود و مجوزهای واقعی باید در سرور اعمال شوند.</InlineAlert>
  </div></WorkspaceState>;
}
export function PermissionsPage() {
  return <WorkspaceState><div className="admin-page-scroll"><AdminPageHeading title="دسترسی‌ها" description="ماتریس نقش‌های پشتیبانی‌شده در سرویس نمونه" />
    <div className="admin-panel admin-table-wrap"><table><thead><tr><th>دسترسی</th>{roles.map(r => <th key={r}>{roleLabels[r]}</th>)}</tr></thead><tbody>{permissions.map(permission => <tr key={permission}><th scope="row">{permissionLabels[permission]}</th>{roles.map(role => <td key={role}><span className={allowed(role,permission) ? "admin-permission-yes" : "admin-permission-no"}><Icon name={allowed(role,permission) ? "check" : "lock"} size={18} />{allowed(role,permission) ? "مجاز" : "غیرمجاز"}</span></td>)}</tr>)}</tbody></table></div>
    <p>تعریف مجوزها در این فاز ثابت است. <AdminLink href="/admin/users" className="admin-text-action">تغییر نقش کاربران نمونه</AdminLink></p>
    <InlineAlert>محدودیت‌ها علاوه بر رابط، در مخزن نمونه بررسی می‌شوند؛ تضمین امنیت تولید به احراز هویت و مجوزهای ASP.NET نیاز دارد.</InlineAlert>
  </div></WorkspaceState>;
}
