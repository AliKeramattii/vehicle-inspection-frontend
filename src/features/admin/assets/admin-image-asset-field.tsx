"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { ImagePlus, RotateCcw } from "lucide-react";
import { TextInput } from "@/components/ui/text-input";
import { SecondaryButton } from "@/components/ui/button";
import { useRuntimeSite } from "@/config/site-settings.provider";
import { siteSettingsSchema, type SiteSettings } from "@/config/site-settings.schema";
import { brandingAssets } from "@/config/branding-assets";
import { useAdmin } from "../admin-context";
import { BrandingAssetRepository, type LocalBrandingAsset } from "./asset-repository";
import { useBrandingAsset } from "./use-branding-asset";
export type ImageSettingPath = "identity.logo" | "identity.favicon" | "images.landing" | "images.referral" | "images.otp" | "images.readiness" | "images.consent" | "images.submission";
export const imageSlots: readonly { name: ImageSettingPath; label: string; fallback: string }[] = [
  { name: "identity.logo", label: "لوگوی کارگزاری", fallback: "/icons/admin/partner.svg" },
  { name: "identity.favicon", label: "فاویکن", fallback: "/brand/application-logo.svg" },
  { name: "images.landing", label: "تصویر شروع", fallback: brandingAssets.landing.src },
  { name: "images.referral", label: "تصویر معرفی", fallback: brandingAssets.referral.src },
  { name: "images.otp", label: "تصویر تأیید موبایل", fallback: brandingAssets.otp.src },
  { name: "images.readiness", label: "تصویر آمادگی", fallback: brandingAssets.readiness.src },
  { name: "images.consent", label: "تصویر حریم خصوصی", fallback: brandingAssets.consent.src },
  { name: "images.submission", label: "تصویر ارسال موفق و انتظار کارشناس", fallback: "/illustrations/success/inspection-submitted.svg" },
];
export function imageSetting(settings: SiteSettings, name: ImageSettingPath) {
  return name.startsWith("identity.") ? settings.identity[name.slice(9) as "logo" | "favicon"] : settings.images[name.slice(7) as keyof SiteSettings["images"]];
}
export function AdminImageAssetField({ name, form, published }: { name: ImageSettingPath; form: UseFormReturn<SiteSettings>; published: SiteSettings }) {
  const slot = imageSlots.find(item => item.name === name)!, site = useRuntimeSite(), { actor } = useAdmin();
  const value = useWatch({ control: form.control, name }), reference = typeof value === "string" ? value : null;
  const [pending, setPending] = useState(false), [error, setError] = useState(""), [metadata, setMetadata] = useState<LocalBrandingAsset>(), [failed, setFailed] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null), request = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => request.current?.abort(), []);
  let valid: string | null = null;
  try { const schema = name.startsWith("identity.") ? siteSettingsSchema.shape.identity.shape[name.slice(9) as "logo" | "favicon"] : siteSettingsSchema.shape.images.shape[name.slice(7) as keyof SiteSettings["images"]];
    if (schema.safeParse(reference).success) valid = reference;
  } catch { /* Invalid URL remains a field error, never a requested image. */ }
  const asset = useBrandingAsset(valid, { contextKey: site.contextKey, tenantId: site.bootstrap.tenantId });
  const src = asset.url && asset.url !== failed ? asset.url : slot.fallback;
  const changed = reference !== (imageSetting(published, name) ?? null);
  async function choose(file: File | undefined) {
    if (!file) return;
    request.current?.abort(); const operation = new AbortController(); request.current = operation;
    setPending(true); setError("");
    try {
      const stored = await new BrandingAssetRepository().upload(actor, { contextKey: site.contextKey, tenantId: site.bootstrap.tenantId }, file,
        { favicon: name === "identity.favicon", maxBytes: name === "identity.favicon" ? 512 * 1024 : 8 * 1024 * 1024 }, operation.signal);
      if (operation.signal.aborted) return;
      setMetadata(stored); form.setValue(name, stored.reference, { shouldDirty: true, shouldValidate: true });
    } catch (cause) { if (!operation.signal.aborted) setError(cause instanceof Error ? cause.message : "انتخاب تصویر انجام نشد."); }
    finally { if (!operation.signal.aborted) setPending(false); }
  }
  return <section className="admin-image-asset-field" aria-label={slot.label} aria-busy={pending || asset.loading}>
    <div className="admin-asset-heading"><h3>{slot.label}</h3><span>{changed ? "پیش‌نویس" : "نسخه منتشرشده"}</span></div>
    <div className="admin-asset-preview"><Image src={src} alt={"پیش‌نمایش " + slot.label} width={240} height={112} unoptimized onError={() => { if (asset.url) setFailed(asset.url); }} /></div>
    <div className="admin-asset-actions"><SecondaryButton disabled={pending} onClick={() => fileInput.current?.click()}><ImagePlus size={18} />{reference ? "تعویض تصویر" : "انتخاب فایل"}</SecondaryButton>
      <SecondaryButton disabled={pending || !reference} onClick={() => { form.setValue(name, null, { shouldDirty: true, shouldValidate: true }); setMetadata(undefined); setError(""); }} aria-label={"بازگردانی پیش‌فرض " + slot.label}><RotateCcw size={17} />پیش‌فرض</SecondaryButton></div>
    <input ref={fileInput} type="file" hidden accept={name === "identity.favicon" ? "image/png,image/jpeg,image/webp,image/x-icon,image/vnd.microsoft.icon" : "image/png,image/jpeg,image/webp"}
      aria-label={"انتخاب فایل " + slot.label} onChange={event => { void choose(event.target.files?.[0]); event.target.value = ""; }} />
    <TextInput label={"نشانی " + slot.label} dir="ltr" error={form.getFieldState(name, form.formState).error?.message}
      {...form.register(name, { setValueAs: value => value === "" ? null : value })} />
    <p className="admin-asset-formats">{name === "identity.favicon" ? "PNG، JPEG، WebP یا ICO؛ حداکثر ۵۱۲ کیلوبایت و ۵۱۲ × ۵۱۲ پیکسل." : "PNG، JPEG یا WebP؛ حداکثر ۸ مگابایت. SVG بارگذاری‌شده مجاز نیست."}</p>
    <p className="admin-asset-local">فایل انتخاب‌شده فقط در همین مرورگر ذخیره می‌شود؛ بارگذاری در سرور انجام نشده است.</p>
    <span className="admin-asset-feedback" role="status">{pending ? "در حال بررسی و ذخیره محلی…" : metadata ? metadata.width.toLocaleString("fa-IR") + " × " + metadata.height.toLocaleString("fa-IR") + " پیکسل؛ ذخیره محلی" : ""}</span>
    {(error || asset.error) && <p role="alert" className="admin-field-error">{error || asset.error}</p>}
  </section>;
}
