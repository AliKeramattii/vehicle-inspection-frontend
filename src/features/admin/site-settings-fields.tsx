"use client";
import type { UseFormReturn, FieldPath } from "react-hook-form";
import type { SiteSettings } from "@/config/site-settings.schema";
import { AdminImageAssetField, imageSlots } from "./assets/admin-image-asset-field";
import "./assets/admin-assets.css";
import { TextInput } from "@/components/ui/text-input";
import { ApplicationLogo } from "@/components/layout/application-logo";
export const settingTabs=["هویت کارگزاری","رنگ‌بندی","تصاویر","تنظیمات عمومی","اتصال API","فضای ذخیره‌سازی"] as const;
export function SiteSettingsFields({form,tab,published}:{form:UseFormReturn<SiteSettings>;tab:typeof settingTabs[number];published:SiteSettings}) {
  const field=(name:FieldPath<SiteSettings>,label:string,readOnly=false)=> <TextInput key={name} label={label} error={form.getFieldState(name,form.formState).error?.message} {...form.register(name,{setValueAs:value=>name==="application.template.version"?Number(value):value===""&&["application.locationMap.webMapKey","identity.logo","identity.favicon","images.landing","images.referral","images.otp","images.readiness","images.consent"].includes(name)?null:value})} aria-label={label} dir={name.includes("Name")||name.includes("Title")?"rtl":"ltr"} readOnly={readOnly}/>;
  if(tab==="هویت کارگزاری") return <><div className="settings-platform-identity"><ApplicationLogo width={36}/><div><strong>هویت ثابت برنامه</strong><p>این نشان مستقل از لوگو و رنگ‌های قابل تنظیم کارگزاری است.</p></div></div>{field("identity.brokerageName","نام کارگزاری")}{field("identity.appTitle","عنوان اپلیکیشن")}{imageSlots.filter(slot=>slot.name.startsWith("identity.")).map(slot=><AdminImageAssetField key={slot.name} name={slot.name} form={form} published={published}/>)}{field("identity.publicEmail","ایمیل عمومی")}{field("identity.publicPhone","تلفن عمومی")}<p>تصویرها در این محیط محلی ذخیره می‌شوند؛ انتشار روی دستگاه یا مرورگر دیگر منتقل نمی‌شود.</p></>;
  if(tab==="رنگ‌بندی")return <><p className="settings-color-scope">این رنگ‌ها برای برند مشتری هستند؛ پوسته آبی مدیریت مستقل می‌ماند.</p>{(["primary","secondary","background","neutral","onPrimary","onBackground"] as const).map((name,index)=>field(`theme.${name}`,["رنگ اصلی","رنگ ثانویه","پس‌زمینه","رنگ خنثی","متن روی رنگ اصلی","متن روی پس‌زمینه"][index]))}<p>حداقل کنتراست متن ۴٫۵ است. رنگ‌های وضعیت مدارک با رنگ برند جایگزین نمی‌شوند.</p></>;
  if(tab==="تصاویر")return <>{imageSlots.filter(slot=>slot.name.startsWith("images.")).map(slot=><AdminImageAssetField key={slot.name} name={slot.name} form={form} published={published}/>)}<p>خالی یعنی دارایی پیش‌فرض. تصاویر راهنمای عکاسی مستقل و بدون تغییر هستند.</p></>;
  if(tab==="اتصال API")return <>{field("application.apiBaseUrl","نشانی عمومی API",true)}{field("application.contractVersion","نسخه قرارداد",true)}<p>این نشانی از فایل نصب معتبر می‌آید. تغییر آن نیازمند تنظیم مجدد نصب روی دامنه مستقل است.</p><p>وضعیت اتصال: بررسی نشده؛ سرویس واقعی متصل نیست.</p>
<h2>نقشه عمومی نشان</h2>{field("application.locationMap.webMapKey","کلید عمومی وب نقشه نشان")}
<p>فقط کلید وب محدودشده به دامنه؛ کلید خصوصی سرویس آدرس‌یابی را اینجا وارد نکنید.</p>
<label><input type="checkbox" {...form.register("application.locationMap.enabled")}/>نمایش نقشه</label>
<label>آدرس‌یابی<select {...form.register("application.locationMap.reverseGeocoding")}><option value="unavailable">سرویس پیکربندی نشده</option><option value="mock">نمونه آزمایشی</option><option value="api">API همین نصب</option></select></label>
</>;
  if(tab==="فضای ذخیره‌سازی")return <><h2>وضعیت ذخیره‌سازی سرور</h2><p>بررسی نشده؛ اطلاعات سلامت از ASP.NET دریافت نشده است.</p><p>الگوی پوشه: <bdi dir="ltr">INSPECTION_&#123;InspectionId&#125;</bdi></p><p>هیچ مسیر داخلی، مرور فایل یا رشته اتصال نمایش داده نمی‌شود.</p><p>مدت نگهداری و حذف: نیازمند سیاست تأییدشده کارگزاری در سرور.</p></>;
  return <><h2>قالب منتشرشده برای بازدیدهای جدید</h2>{field("application.template.id","شناسه قالب",true)}{field("application.template.version","نسخه قالب",true)}<p>انتخاب تنها از نسخه‌های منتشرشده مجاز است. بازدیدهای موجود نسخه خود را حفظ می‌کنند.</p><label><input type="checkbox" {...form.register("application.features.supportLink")}/>نمایش پشتیبانی</label><p>ثبت زنده با دوربین و مدارک تکمیلی پشتیبانی می‌شوند؛ انتخاب گالری مجاز نیست. کیلومتر و ویدیوی الزامی قابل حذف نیستند.</p></>;
}
