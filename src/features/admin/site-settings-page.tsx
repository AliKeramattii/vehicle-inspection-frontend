"use client";
import { useEffect,useMemo,useState } from "react";
import { useQuery,useQueryClient } from "@tanstack/react-query";
import { useForm,useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useBrandingAsset } from "./assets/use-branding-asset";
import { useRuntimeSite } from "@/config/site-settings.provider";
import { siteSettingsSchema,validateContext,contrast,type SiteSettings } from "@/config/site-settings.schema";
import { SiteSettingsRepository,IndexedDbSettingsPersistence,type SettingsWorkspace } from "@/config/site-settings.repository";
import { useAdmin } from "./admin-context";
import { AdminPageHeading,WorkspaceState,persian } from "./admin-common";
import { allowed } from "./model";
import { PrimaryButton,SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { NativeDialog } from "@/components/ui/native-dialog";
import { SiteSettingsFields,settingTabs } from "./site-settings-fields";
import "./site-settings.css";
export function SiteSettingsPage() {
  const site=useRuntimeSite(),admin=useAdmin(),cache=useQueryClient();
  const repository=useMemo(()=>new SiteSettingsRepository(new IndexedDbSettingsPersistence(),site.contextKey,site.bootstrap,site.origin,site.settings,undefined,admin.workspace?.templates.flatMap(t=>t.versions.filter(v=>v.state==="published").map(v=>({id:t.id,version:v.version})))),[site.contextKey,site.bootstrap,site.origin,site.settings,admin.workspace]);
  const query=useQuery({queryKey:["admin-site-settings",site.contextKey,admin.actor.id,admin.actor.role],queryFn:()=>repository.read(admin.actor),enabled:allowed(admin.actor.role,"branding"),refetchOnWindowFocus:true});
  if(!allowed(admin.actor.role,"branding"))return <div className="admin-recovery"><InlineAlert tone="destructive">تنظیمات سایت فقط برای مدیر سایت در دسترس است.</InlineAlert></div>;
  if(query.isPending)return <div className="admin-loading" role="status"><div/><div/><p>بارگذاری تنظیمات سایت</p></div>;
  if(!query.data)return <div className="admin-recovery"><InlineAlert tone="destructive">خواندن تنظیمات ممکن نشد.</InlineAlert><SecondaryButton onClick={()=>void query.refetch()}>تلاش مجدد</SecondaryButton></div>;
  return <WorkspaceState><SettingsEditor key={site.contextKey+admin.actor.id+admin.actor.role} state={query.data} repository={repository} reload={async()=>{await cache.invalidateQueries({queryKey:["admin-site-settings",site.contextKey]});}}/></WorkspaceState>;
}
function SettingsEditor({state,repository,reload}:{state:SettingsWorkspace;repository:SiteSettingsRepository;reload:()=>Promise<void>}) {
  const site=useRuntimeSite(),{actor,setDirty,workspace,confirmAction}=useAdmin();
  const form=useForm<SiteSettings>({resolver:zodResolver(siteSettingsSchema),defaultValues:state.draft});
  const values=useWatch({control:form.control}) as SiteSettings;
  const[tab,setTab]=useState<typeof settingTabs[number]>("هویت کارگزاری");
  const[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
  const[preview,setPreview]=useState(false),[publishing,setPublishing]=useState(false);
  const[revision,setRevision]=useState(state.revision);
  const dirty=form.formState.isDirty,canEdit=allowed(actor.role,"branding");
  useEffect(()=>{setDirty(dirty);return()=>setDirty(false);},[dirty,setDirty]);
  async function apply(operation:()=>Promise<SettingsWorkspace>,notice:string) {
    setBusy(true);setError("");setMessage("");
    try{const next=await operation();setRevision(next.revision);form.reset(next.draft);setMessage(notice);await reload();}
    catch(e){setError(e instanceof Error&&!(e instanceof DOMException)?e.message:"ذخیره انجام نشد. تغییرات شما محفوظ است.");}
    finally{setBusy(false);}
  }
  let previewLogo:string|null=null;
  try {
    const checked=siteSettingsSchema.parse({...site.settings,identity:{...site.settings.identity,logo:values.identity.logo}});
    validateContext(site.bootstrap,checked,site.origin);previewLogo=checked.identity.logo;
  } catch { /* Never request an unvalidated asset entered in the editor. */ }
  const resolvedLogo=useBrandingAsset(previewLogo,{contextKey:site.contextKey,tenantId:site.bootstrap.tenantId});
  const errors=Object.values(form.formState.errors);
  const candidates=workspace?.templates.flatMap(t=>t.versions.filter(v=>v.state==="published").map(v=>({id:t.id,version:v.version,title:t.title})))??[];
  return <div className="site-settings-workspace">
    <div className="site-settings-heading"><AdminPageHeading title="تنظیمات سایت" description="شخصی‌سازی نصب کارگزاری؛ انتشار در این محیط فقط محلی و آزمایشی است."/><span>نسخه منتشرشده {persian(state.published.version)}</span></div>
    <div className="admin-tabs site-settings-tabs" role="tablist" aria-label="بخش تنظیمات">{settingTabs.map(label=><button key={label} role="tab" id={"settings-tab-"+settingTabs.indexOf(label)} aria-controls="settings-panel" aria-selected={tab===label} onClick={()=>setTab(label)}>{label}</button>)}</div>
    <form className="site-settings-form" onSubmit={form.handleSubmit(async value=> {
      try {validateContext(site.bootstrap,value,site.origin);}catch(e){setError((e as Error).message);return;}
      const selected=candidates.some(candidate=>candidate.id===value.application.template.id&&candidate.version===Number(value.application.template.version));
      if(!selected){setError("یک نسخه منتشرشده معتبر انتخاب کنید.");return;}
      await apply(()=>repository.save(actor,revision,value),"پیش‌نویس محلی ذخیره شد.");
    })}>
      <div className="site-settings-content">
        <fieldset disabled={!canEdit||busy} className="site-settings-fields" id="settings-panel" role="tabpanel" aria-labelledby={"settings-tab-"+settingTabs.indexOf(tab)}><SiteSettingsFields form={form} tab={tab} published={state.published}/>
          {tab==="تنظیمات عمومی"&&<label>قالب منتشرشده<select aria-label="قالب منتشرشده" value={JSON.stringify([values.application.template.id,values.application.template.version])} onChange={event=>{
            const [id,version]=JSON.parse(event.target.value) as [string,number];form.setValue("application.template",{id,version},{shouldDirty:true});
          }}>{candidates.map(c=><option key={c.id+":"+c.version} value={JSON.stringify([c.id,c.version])}>{c.title} / نسخه {persian(c.version)}</option>)}</select></label>}
        </fieldset>
        <aside className="site-settings-preview" style={{background:values.theme.background,color:values.theme.onBackground}}>
          <p>پیش‌نمایش برند</p>{resolvedLogo.url&&<Image src={resolvedLogo.url!} alt="لوگوی پیش‌نمایش" width={48} height={48} unoptimized/>}<h2>{values.identity.brokerageName}</h2><p>{values.identity.appTitle}</p>
          <span className="site-settings-preview-action" style={{background:values.theme.primary,color:values.theme.onPrimary}}>شروع بازدید</span>
          <p>کنتراست: <bdi>{contrast(values.theme.primary,values.theme.onPrimary).toFixed(2)}</bdi></p><p>تنها پیش‌نمایش؛ قالب و مدارک موجود تغییر نمی‌کنند.</p>
        </aside>
        {(errors.length>0)&&<InlineAlert tone="destructive"><div role="alert">تنظیمات معتبر نیست. عنوان، رنگ‌ها و نشانی تصاویر را بررسی کنید.</div>{Object.entries(form.formState.errors.theme??{}).map(([key,value])=><p key={key}>{typeof value==="object"&&value&&"message" in value?String(value.message):""}</p>)}</InlineAlert>}
        {error&&<InlineAlert tone="destructive">{error}<button type="button" className="admin-text-action" onClick={()=>confirmAction(()=>{setRevision(state.revision);form.reset(state.draft);setError("");void reload();})}>بارگذاری نسخه تازه</button></InlineAlert>}
        {message&&<InlineAlert tone="success">{message}</InlineAlert>}
        {!canEdit&&<InlineAlert>نقش فعلی فقط اجازه مشاهده دارد.</InlineAlert>}
      </div>
      <footer className="admin-editor-footer">
        <div className="admin-footer-actions"><PrimaryButton type="submit" disabled={!canEdit||!dirty} loading={busy}>ذخیره پیش‌نویس</PrimaryButton><SecondaryButton disabled={!canEdit||dirty||busy||JSON.stringify(state.draft)===JSON.stringify(state.published)} onClick={()=>setPublishing(true)}>انتشار تنظیمات</SecondaryButton></div>
        <div className="admin-footer-actions"><SecondaryButton disabled={busy} onClick={()=>setPreview(true)}>پیش‌نمایش</SecondaryButton><SecondaryButton disabled={!canEdit||busy} onClick={()=>confirmAction(()=>void apply(()=>repository.reset(actor,revision),"پیش‌نویس به نسخه منتشرشده بازگشت."))}>بازگردانی پیش‌نویس</SecondaryButton></div>
      </footer>
    </form>
    {publishing&&<NativeDialog title="انتشار تنظیمات محلی" onDismiss={()=>setPublishing(false)}><p>تنظیمات فقط برای همین مرورگر و نصب نمونه منتشر می‌شود. این تغییر انتشار واقعی در سرور نیست.</p><div className="admin-dialog-actions"><SecondaryButton onClick={()=>setPublishing(false)}>بازگشت</SecondaryButton><PrimaryButton loading={busy} onClick={async()=>{await apply(()=>repository.publish(actor,revision),"تنظیمات نمونه منتشر شد.");setPublishing(false);await site.refresh();}}>تأیید انتشار</PrimaryButton></div></NativeDialog>}
    {preview&&<NativeDialog title="پیش‌نمایش تنظیمات سایت" onDismiss={()=>setPreview(false)}><div className="site-settings-dialog-preview" style={{background:values.theme.background,color:values.theme.onBackground}}><h2>{values.identity.brokerageName}</h2><p>{values.identity.appTitle}</p><span className="site-settings-preview-action" style={{background:values.theme.primary,color:values.theme.onPrimary}}>شروع بازدید</span><p>۱۲ تصویر + کیلومتر + ویدیوی ۳۶۰ درجه؛ مستقل از تنظیمات برند</p></div><SecondaryButton onClick={()=>setPreview(false)}>بستن پیش‌نمایش</SecondaryButton></NativeDialog>}
  </div>;
}
