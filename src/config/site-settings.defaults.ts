import { defaultThemeColors } from "./theme-colors";
import { vehicleHeroAssets } from "./vehicle-assets";
import { defaultLocationMap, type SiteSettings } from "./site-settings.schema";
export function defaultSiteSettings(tenantId: string, apiBaseUrl = "/api"): SiteSettings {
  return { schemaVersion: 1, tenantId, version: 1, publishedAt: "2026-10-11T06:30:00.000Z",
    identity: { brokerageName: "شریک بیمه", appTitle: "بازدید خودرو", logo: null, favicon: null, publicEmail: "", publicPhone: "" },
    theme: { ...defaultThemeColors },
    images: { landing: null, referral: null, otp: null, readiness: null, consent: null, submission: null },
    application: { apiBaseUrl, contractVersion: "1", locationMap: defaultLocationMap(), template: { id: "body-image-guided", version: 1 },
      features: { nativeCaptureFallback: true, additionalEvidence: true, supportLink: true } } };
}
export function brokerageFixture(tenantId: "broker-a" | "broker-b", apiBaseUrl = "/api") {
  const settings = defaultSiteSettings(tenantId,apiBaseUrl);
  settings.identity = { ...settings.identity, brokerageName: tenantId === "broker-a" ? "کارگزاری آبی" : "کارگزاری سبز",
    appTitle: "بازدید " + (tenantId === "broker-a" ? "آبی" : "سبز"), logo: tenantId === "broker-a" ? "/icons/security/shield.svg" : "/icons/admin/partner.svg" };
  // These named brokerage fixtures retain explicit tenant colors; the app default is Emerald.
  settings.theme.primary = tenantId === "broker-a" ? "#2563EB" : "#047857";
  settings.images.landing = tenantId === "broker-a" ? vehicleHeroAssets.landing : vehicleHeroAssets.readiness;
  return settings;
}
