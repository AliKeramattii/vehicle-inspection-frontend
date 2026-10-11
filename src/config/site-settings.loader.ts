import { SiteConfigurationError, bootstrapSchema, siteSettingsSchema, validateContext, configurationKey, type SiteBootstrap, type SiteSettings } from "./site-settings.schema";
import { defaultSiteSettings } from "./site-settings.defaults";
import { IndexedDbSettingsPersistence, SiteSettingsRepository } from "./site-settings.repository";
export async function readJson(url:string, signal:AbortSignal, fetcher:typeof fetch=fetch) {
  const response=await fetcher(url,{signal,cache:"no-store",credentials:"omit",redirect:"error"});
  if(!response.ok) throw new Error("تنظیمات سایت در دسترس نیست. دوباره تلاش کنید.");
  return response.json() as Promise<unknown>;
}
export async function loadBootstrap(origin:string,signal:AbortSignal,fetcher:typeof fetch=fetch) {
  const bootstrap=bootstrapSchema.parse(await readJson(new URL("/site-bootstrap.json",origin).href,signal,fetcher));
  validateContext(bootstrap,defaultSiteSettings(bootstrap.tenantId,bootstrap.apiBaseUrl),origin);
  return bootstrap;
}
export async function bindDeployment(bootstrap:SiteBootstrap,origin:string) {
  // Deployment identity is a local data-safety guard, never backend authorization.
  const persistence=new IndexedDbSettingsPersistence();
  const bindingKey="deployment-binding:"+origin;
  const settings=defaultSiteSettings(bootstrap.tenantId,bootstrap.apiBaseUrl);
  await persistence.transact(bindingKey,()=>({revision:1,published:settings,draft:settings,history:[],audit:[]}),state=> {
    if(state.published.tenantId!==bootstrap.tenantId || state.published.application.apiBaseUrl!==bootstrap.apiBaseUrl)
      throw new SiteConfigurationError("این نشانی قبلاً به نصب دیگری متصل شده است. برای حفظ فایل‌ها از دامنه مستقل کارگزاری استفاده کنید.");
  });
}
export function mockSettingsRepository(bootstrap:SiteBootstrap,origin:string) {
  return new SiteSettingsRepository(new IndexedDbSettingsPersistence(),configurationKey(bootstrap,origin),bootstrap,origin);
}
export async function loadSettings(bootstrap:SiteBootstrap,origin:string,signal:AbortSignal,fetcher:typeof fetch=fetch):Promise<SiteSettings> {
  await bindDeployment(bootstrap,origin);
  const raw=bootstrap.settingsSource==="mock" ? (await mockSettingsRepository(bootstrap,origin).read()).published :
    await readJson(new URL(bootstrap.siteSettingsEndpoint,origin).href,signal,fetcher);
  const settings=siteSettingsSchema.parse(raw);validateContext(bootstrap,settings,origin);return settings;
}
