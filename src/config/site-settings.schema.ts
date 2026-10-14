import { z } from "zod";

export const tenantIdSchema = z.string().regex(/^[a-z][a-z0-9-]{1,47}$/);
export class SiteConfigurationError extends Error {}
const publicUrl = z.string().max(500).refine(value => {
  if (/[%\\\s?#]/.test(value) || value.includes("..") || value.startsWith("//")) return false;
  if (value.startsWith("/")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "نشانی باید مسیر محلی یا HTTPS معتبر باشد.");
export const bootstrapSchema = z.object({
  schemaVersion: z.literal(1), tenantId: tenantIdSchema,
  apiBaseUrl: publicUrl, siteSettingsEndpoint: publicUrl,
  settingsSource: z.enum(["mock", "api"]).default("api"),
}).strict();
const imageRef = publicUrl.refine(value => /\.(png|webp|jpe?g|ico)$/i.test(value) || /^\/icons\/[\w/-]+\.svg$/.test(value), "تصویر معتبر PNG، WebP یا JPEG انتخاب کنید.");
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const locationMapSchema = z.object({
  enabled: z.boolean(),
  webMapKey: z.string().trim().min(1).max(250).nullable(),
  mapType: z.enum(["dreamy", "standard-night"]),
  initialViewport: z.object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    zoom: z.number().int().min(3).max(18),
  }).strict(),
  reverseGeocoding: z.enum(["unavailable", "mock", "api"]),
}).strict();
export type LocationMapConfiguration = z.infer<typeof locationMapSchema>;
export const defaultLocationMap = (): LocationMapConfiguration => ({ enabled: true, webMapKey: null, mapType: "dreamy", initialViewport: { latitude: 35.699739, longitude: 51.338097, zoom: 12 }, reverseGeocoding: "unavailable" });
export const siteSettingsSchema = z.object({
  schemaVersion: z.literal(1), tenantId: tenantIdSchema, version: z.number().int().positive(),
  publishedAt: z.iso.datetime(),
  identity: z.object({
    brokerageName: z.string().trim().min(1).max(50), appTitle: z.string().trim().min(1).max(60),
    logo: imageRef.nullable(), favicon: imageRef.nullable(),
    publicEmail: z.union([z.email(), z.literal("")]), publicPhone: z.string().max(30),
  }).strict(),
  theme: z.object({ primary: color, secondary: color, background: color, neutral: color,
    onPrimary: color, onBackground: color }).strict(),
  images: z.object({ landing: imageRef.nullable(), referral: imageRef.nullable(), otp: imageRef.nullable(),
    readiness: imageRef.nullable(), consent: imageRef.nullable(), submission: imageRef.nullable().optional() }).strict(),
  application: z.object({
    apiBaseUrl: publicUrl, contractVersion: z.literal("1"),
    locationMap: locationMapSchema.optional(),
    template: z.object({ id: z.string().min(1).max(80), version: z.number().int().positive() }).strict(),
    features: z.object({ nativeCaptureFallback: z.literal(true), additionalEvidence: z.literal(true), supportLink: z.boolean() }).strict(),
  }).strict(),
}).strict().superRefine((settings, context) => {
  for (const [foreground, background, path] of [
    [settings.theme.onPrimary, settings.theme.primary, "primary"],
    [settings.theme.onBackground, settings.theme.background, "background"],
    [settings.theme.secondary, settings.theme.background, "secondary"],
  ]) if (contrast(foreground, background) < 4.5) context.addIssue({ code: "custom", path: ["theme", path], message: "کنتراست متن باید حداقل ۴٫۵ باشد." });
});
export type SiteBootstrap = z.infer<typeof bootstrapSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const rgb = [1,3,5].map(start => parseInt(hex.slice(start,start+2),16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  };
  const x=luminance(a), y=luminance(b); return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function resolvePublicUrl(value: string, origin: string) {
  return new URL(value, origin).href;
}
export function validateContext(bootstrap: SiteBootstrap, settings: SiteSettings, origin: string) {
  const base = new URL(bootstrap.apiBaseUrl, origin), endpoint = new URL(bootstrap.siteSettingsEndpoint, origin);
  if (base.pathname === "/" || !/^\/api(?:\/|$)/.test(base.pathname) || endpoint.origin !== base.origin ||
    !endpoint.pathname.startsWith(base.pathname.replace(/\/$/,"") + "/")) throw new SiteConfigurationError("نشانی API با تنظیمات نصب سازگار نیست.");
  if (settings.tenantId !== bootstrap.tenantId || settings.application.apiBaseUrl !== bootstrap.apiBaseUrl) throw new SiteConfigurationError("تنظیمات متعلق به این نصب نیست.");
  const assets=[settings.identity.logo,settings.identity.favicon,...Object.values(settings.images)].filter((v):v is string=>Boolean(v));
  if (assets.some(value => { const url=new URL(value,origin); const local = new RegExp("^/__local-branding/"+bootstrap.tenantId+"/[a-f0-9-]{36}\\.(png|jpg|webp|ico)$").test(value); return ![origin,base.origin].includes(url.origin) || (!value.startsWith("https:") && !/^\/(images|icons|branding)\//.test(value) && value !== "/favicon.ico" && !local); })) throw new SiteConfigurationError("نشانی دارایی برند مجاز نیست.");
}
export function configurationKey(bootstrap: SiteBootstrap, origin: string) {
  return JSON.stringify([new URL(origin).origin, bootstrap.tenantId, resolvePublicUrl(bootstrap.apiBaseUrl,origin), resolvePublicUrl(bootstrap.siteSettingsEndpoint,origin)]);
}
export function apiUrl(bootstrap: SiteBootstrap, origin: string, path: string) {
  if (!/^\/[a-zA-Z0-9/_-]+$/.test(path) || path.includes("..")) throw new Error("Invalid API path");
  return new URL(bootstrap.apiBaseUrl.replace(/\/$/,"")+path,origin).href;
}
