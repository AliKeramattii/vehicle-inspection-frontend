import { defaultThemeColors, isLegacyFactoryTheme } from "./theme-colors";
import { openSiteSettingsDb } from "./site-settings-db";
import { allowed, type AdminActor } from "@/features/admin/model";
import { defaultSiteSettings } from "./site-settings.defaults";
import { defaultLocationMap, siteSettingsSchema, validateContext, type SiteBootstrap, type SiteSettings } from "./site-settings.schema";

export type SettingsWorkspace = { revision: number; published: SiteSettings; draft: SiteSettings;
  history: SiteSettings[]; audit: { actor: string; action: string; at: string }[] };
export interface SettingsPersistence {
  transact<T>(key: string, seed: () => SettingsWorkspace, change: (state: SettingsWorkspace) => T): Promise<T>;
}
export class MemorySettingsPersistence implements SettingsPersistence {
  private records = new Map<string,SettingsWorkspace>();
  private tail: Promise<unknown> = Promise.resolve();
  transact<T>(key: string, seed: () => SettingsWorkspace, change: (state: SettingsWorkspace) => T) {
    const next=this.tail.then(()=> { const state=structuredClone(this.records.get(key)??seed()); const result=change(state); this.records.set(key,state); return structuredClone(result); });
    this.tail=next.catch(()=>undefined); return next;
  }
}
export class IndexedDbSettingsPersistence implements SettingsPersistence {
  async transact<T>(key: string, seed: () => SettingsWorkspace, change: (state: SettingsWorkspace) => T): Promise<T> {
    const database=await openSiteSettingsDb();
    return new Promise((resolve,reject)=> {
      const tx=database.transaction("settings","readwrite"), store=tx.objectStore("settings"), request=store.get(key);
      let result:T; let failure:unknown;
      request.onsuccess=()=> { try { const state:SettingsWorkspace=request.result??seed(); result=change(state);store.put(state,key); } catch(e) {failure=e;tx.abort();} };
      tx.oncomplete=()=> {database.close();resolve(result);};
      tx.onabort=tx.onerror=()=> {database.close();reject(failure??new Error("ذخیره تنظیمات ممکن نشد. پیش‌نویس محفوظ است."));};
    });
  }
}
export class SiteSettingsRepository {
  constructor(private storage: SettingsPersistence, private key: string, private bootstrap: SiteBootstrap, private origin: string,
    private initial = defaultSiteSettings(bootstrap.tenantId,bootstrap.apiBaseUrl), private now=()=>new Date().toISOString(), private publishedTemplates: readonly {id:string;version:number}[] = [{id:"body-image-guided",version:1}]) {}
  private seed=():SettingsWorkspace=>({revision:1,published:structuredClone(this.initial),draft:structuredClone(this.initial),history:[structuredClone(this.initial)],audit:[]});
  read(actor?: AdminActor) { if (actor) this.authorize(actor); return this.storage.transact(this.key,this.seed,state=>{
    const result = structuredClone(state);
    const liveDevelopment = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW === "1" &&
      this.bootstrap.settingsSource === "api" && this.initial.tenantId === this.bootstrap.tenantId;
    const approvedSeedTheme = Object.entries(defaultThemeColors).every(([key, value]) => this.initial.theme[key as keyof SiteSettings["theme"]].toLowerCase() === value);
    // Only an untouched seeded workspace adopts the new factory default in its view.
    // Published/edited tenant choices and immutable history remain byte-for-byte intact.
    if ((this.bootstrap.settingsSource === "mock" || (liveDevelopment && approvedSeedTheme)) && this.bootstrap.tenantId === "demo" && state.revision === 1 && state.audit.length === 0 && state.history.length === 1 && state.published.version === 1 &&
      JSON.stringify(state.draft) === JSON.stringify(state.published) && isLegacyFactoryTheme(state.published.theme)) {
      result.published.theme = { ...defaultThemeColors }; result.draft.theme = { ...defaultThemeColors };
    }
    // The opt-in live development seed supplies a missing key/geocoder profile.
    // Resolve published and draft independently: a draft must never hide the live map.
    // Existing keys, explicit disablement, viewport/style choices and stored history survive.
    const runtimeMap = this.initial.application.locationMap;
    if (liveDevelopment && runtimeMap?.enabled && runtimeMap.webMapKey) {
      for (const settings of [result.published, result.draft]) {
        const map = settings.application.locationMap;
        if (!map) settings.application.locationMap = structuredClone(runtimeMap);
        else if (map.enabled && map.webMapKey === null) settings.application.locationMap = {
          ...map, webMapKey: runtimeMap.webMapKey, reverseGeocoding: runtimeMap.reverseGeocoding,
        };
      }
    }
    for (const settings of [result.published, result.draft]) settings.application.locationMap ??= defaultLocationMap();
    return result;
  }); }
  private authorize(actor:AdminActor) { if(!allowed(actor.role,"branding")) throw new Error("نقش فعلی اجازه تغییر تنظیمات سایت را ندارد."); }
  private validate(settings:SiteSettings) { const value=siteSettingsSchema.parse(settings);validateContext(this.bootstrap,value,this.origin);if(!this.publishedTemplates.some(t=>t.id===value.application.template.id&&t.version===value.application.template.version))throw new Error("نسخه قالب منتشرشده معتبر نیست.");return value; }
  save(actor:AdminActor, revision:number, settings:SiteSettings) {
    this.authorize(actor);const valid=this.validate(settings);
    return this.storage.transact(this.key,this.seed,state=> {
      if(state.revision!==revision) throw new Error("تنظیمات در پنجره دیگری تغییر کرده است. نسخه تازه را بارگذاری کنید.");
      state.draft={...valid,version:state.published.version,publishedAt:state.published.publishedAt};state.revision++;
      state.audit.unshift({actor:actor.name,action:"ذخیره پیش‌نویس",at:this.now()});return state;
    });
  }
  publish(actor:AdminActor, revision:number) {
    this.authorize(actor);
    return this.storage.transact(this.key,this.seed,state=> {
      if(state.revision!==revision) throw new Error("نسخه پیش‌نویس تغییر کرده است؛ دوباره بارگذاری کنید.");
      this.validate(state.draft);
      if(JSON.stringify(state.draft)===JSON.stringify(state.published)) return state;
      state.published={...structuredClone(state.draft),version:state.published.version+1,publishedAt:this.now()};
      state.draft=structuredClone(state.published);state.history.push(structuredClone(state.published));state.revision++;
      state.audit.unshift({actor:actor.name,action:"انتشار محلی نمونه",at:this.now()});return state;
    });
  }
  reset(actor:AdminActor, revision:number) { this.authorize(actor);return this.storage.transact(this.key,this.seed,state=> {
    if(state.revision!==revision) throw new Error("پیش‌نویس تغییر کرده است.");
    state.draft=structuredClone(state.published);state.revision++;state.audit.unshift({actor:actor.name,action:"بازگردانی پیش‌نویس",at:this.now()});return state;
  }); }
}
