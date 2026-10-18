"use client";
import { Building2, Palette, Images, ListChecks, MapPinned, HardDrive } from "lucide-react";
import { settingTabs } from "./site-settings-fields";
export const settingsDescriptions: Record<typeof settingTabs[number], string> = {
  "هویت کارگزاری":"نام و نشان کارگزاری و راه‌های تماس عمومی؛ نشان ثابت برنامه مستقل است.",
  "رنگ‌بندی":"رنگ‌های برند و خوانایی متن را پیش از انتشار بررسی کنید.",
  "تصاویر":"شش تصویر صفحات مشتری؛ راهنماهای عکاسی و مدارک ثبت‌شده تغییر نمی‌کنند.",
  "تنظیمات عمومی":"قالب منتشرشده برای بازدیدهای جدید و نمایش پشتیبانی.",
  "اتصال API":"پیکربندی عمومی نصب و نقشه نشان؛ اطلاعات محرمانه وارد نکنید.",
  "فضای ذخیره‌سازی":"مرز ذخیره‌سازی سرور آینده؛ این محیط به سرور تولید متصل نیست.",
};
const icons=[Building2,Palette,Images,ListChecks,MapPinned,HardDrive];
export function SettingsNavigation({tab,onChange}:{tab:typeof settingTabs[number];onChange:(tab:typeof settingTabs[number])=>void}) {
 return <div aria-orientation="horizontal" className="admin-tabs site-settings-tabs" role="tablist" aria-label="بخش تنظیمات">{settingTabs.map((label,index)=>{const Glyph=icons[index];return <button type="button" key={label} role="tab" id={"settings-tab-"+index} aria-controls="settings-panel" aria-selected={tab===label} tabIndex={tab===label?0:-1} onClick={()=>onChange(label)} onKeyDown={event=>{
   const step=event.key==="ArrowDown"||event.key==="ArrowLeft"?1:event.key==="ArrowUp"||event.key==="ArrowRight"?-1:0;
   const next=event.key==="Home"?0:event.key==="End"?settingTabs.length-1:step?(index+step+settingTabs.length)%settingTabs.length:undefined;
   if(next===undefined)return;event.preventDefault();onChange(settingTabs[next]);document.getElementById("settings-tab-"+next)?.focus();
 }}><Glyph size={18} aria-hidden="true"/><span>{label}</span></button>;})}</div>;
}
