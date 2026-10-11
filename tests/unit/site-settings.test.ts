import {describe,it,expect,vi} from "vitest";
import {bootstrapSchema,siteSettingsSchema,validateContext,configurationKey,contrast,apiUrl,type SiteBootstrap} from "@/config/site-settings.schema";
import {defaultSiteSettings,brokerageFixture} from "@/config/site-settings.defaults";
import {MemorySettingsPersistence,SiteSettingsRepository} from "@/config/site-settings.repository";
import {loadBootstrap,readJson} from "@/config/site-settings.loader";
import {actors} from "@/features/admin/model";
const origin="https://visit.example";
const boot=(tenantId="demo"):SiteBootstrap=>({schemaVersion:1,tenantId,apiBaseUrl:"/api",siteSettingsEndpoint:"/api/public/site-settings",settingsSource:"mock"});
const create=()=>new SiteSettingsRepository(new MemorySettingsPersistence(),"demo",boot(),origin);
describe("public deployment configuration",()=> {
  it("validates both fictional brokerage fixtures and contrast",()=>{for(const id of ["broker-a","broker-b"] as const){const settings=brokerageFixture(id);expect(siteSettingsSchema.safeParse(settings).success).toBe(true);expect(()=>validateContext(boot(id),settings,origin)).not.toThrow();expect(contrast(settings.theme.primary,settings.theme.onPrimary)).toBeGreaterThanOrEqual(4.5);}});
  it.each(["//evil.example/api","http://evil.example/api","https://user:pass@evil.example/api","/api/../private","/api%2fother","javascript:alert(1)"])("rejects unsafe API %s",value=>{expect(bootstrapSchema.safeParse({...boot(),apiBaseUrl:value}).success).toBe(false);});
  it("rejects public secrets and unsupported schema fields",()=>{expect(bootstrapSchema.safeParse({...boot(),connectionString:"private"}).success).toBe(false);const settings=defaultSiteSettings("demo");expect(siteSettingsSchema.safeParse({...settings,storageRoot:"private"}).success).toBe(false);expect(siteSettingsSchema.safeParse({...settings,schemaVersion:2}).success).toBe(false);});
  it("rejects low contrast, wrong tenant, settings API override and unsafe asset origin",()=>{
    const settings=defaultSiteSettings("demo");expect(siteSettingsSchema.safeParse({...settings,theme:{...settings.theme,primary:"#FFFFFF"}}).success).toBe(false);
    expect(()=>validateContext(boot("broker-b"),settings,origin)).toThrow();
    expect(()=>validateContext(boot(),{...settings,application:{...settings.application,apiBaseUrl:"https://evil.example/api"}},origin)).toThrow();
    expect(()=>validateContext(boot(),{...settings,images:{...settings.images,landing:"https://evil.example/car.webp"}},origin)).toThrow();
  });
  it("isolates cache keys by origin, tenant and endpoint",()=>{expect(configurationKey(boot("broker-a"),origin)).not.toBe(configurationKey(boot("broker-b"),origin));expect(configurationKey(boot(),origin)).not.toBe(configurationKey(boot(),"https://another.example"));expect(configurationKey(boot(),origin)).not.toBe(configurationKey({...boot(),siteSettingsEndpoint:"/api/public/site-settings-v2"},origin));});
  it("selects same-origin or trusted HTTPS API from deployment only",()=>{expect(apiUrl(boot(),origin,"/inspections")).toBe(origin+"/api/inspections");expect(apiUrl({...boot(),apiBaseUrl:"https://api.broker.example/api"},origin,"/inspections")).toBe("https://api.broker.example/api/inspections");expect(()=>apiUrl(boot(),origin,"//evil.example")).toThrow();expect(()=>apiUrl(boot(),origin,"/../secret")).toThrow();});
  it("loads bootstrap from origin without query-controlled endpoints, cache, cookies or redirects",async()=>{
    const fetcher=vi.fn(async()=>new Response(JSON.stringify(boot())));
    const signal=new AbortController().signal;
    expect(await loadBootstrap(origin,signal,fetcher)).toEqual(boot());
    expect(fetcher).toHaveBeenCalledWith(origin+"/site-bootstrap.json",{signal,cache:"no-store",credentials:"omit",redirect:"error"});
  });
  it("fails closed on missing or invalid configuration",async()=>{await expect(readJson(origin+"/site-bootstrap.json",new AbortController().signal,vi.fn(async()=>new Response("",{status:503})))).rejects.toThrow();await expect(loadBootstrap(origin,new AbortController().signal,vi.fn(async()=>new Response(JSON.stringify({...boot(),tenantId:"../x"}))))).rejects.toThrow();});
});
describe("Site Settings lifecycle",()=>{
  it("rejects unpublished template references in the service without changing the draft",async()=>{
    const repo=create(),state=await repo.read();
    expect(()=>repo.save(actors["platform-admin"],state.revision,{...state.draft,application:{...state.draft.application,template:{id:"draft-only",version:2}}})).toThrow();
    expect(await repo.read()).toEqual(state);
  });
  it("defaults a valid public bootstrap to the API source",()=>{
    const {settingsSource: omitted,...bootstrap}=boot();void omitted;
    expect(bootstrapSchema.parse(bootstrap).settingsSource).toBe("api");
  });
  it("saves only draft, publishes immutable history and resumes persisted settings",async()=>{
    const repo=create();const initial=await repo.read();const draft=structuredClone(initial.draft);draft.identity.brokerageName="کارگزاری جدید";
    const saved=await repo.save(actors["platform-admin"],initial.revision,draft);expect(saved.published.identity.brokerageName).toBe(initial.published.identity.brokerageName);
    const published=await repo.publish(actors["platform-admin"],saved.revision);expect(published.published.version).toBe(2);expect(published.history[0]).toEqual(initial.published);
    expect((await repo.read()).published.identity.brokerageName).toBe("کارگزاری جدید");
    const repeated=await repo.publish(actors["platform-admin"],published.revision);expect(repeated.history).toHaveLength(2);expect(repeated.audit).toHaveLength(2);
  });
  it("rejects stale overwrites and resets to published without data loss",async()=>{const repo=create();const initial=await repo.read();const draft=structuredClone(initial.draft);draft.identity.appTitle="عنوان جدید";const saved=await repo.save(actors["platform-admin"],initial.revision,draft);await expect(repo.save(actors["platform-admin"],initial.revision,draft)).rejects.toThrow();const reset=await repo.reset(actors["platform-admin"],saved.revision);expect(reset.draft).toEqual(initial.published);});
  it.each(["template-editor","viewer"] as const)("restricts mutations for %s in repository",async role=>{const repo=create(),state=await repo.read();expect(()=>repo.save(actors[role],state.revision,state.draft)).toThrow();expect(()=>repo.publish(actors[role],state.revision)).toThrow();expect(()=>repo.reset(actors[role],state.revision)).toThrow();});
  it("isolates settings across brokerage records",async()=>{const storage=new MemorySettingsPersistence();const a=new SiteSettingsRepository(storage,"a",boot("broker-a"),origin,brokerageFixture("broker-a"));const b=new SiteSettingsRepository(storage,"b",boot("broker-b"),origin,brokerageFixture("broker-b"));const current=await a.read();await a.save(actors["platform-admin"],current.revision,{...current.draft,identity:{...current.draft.identity,appTitle:"تنها آبی"}});expect((await b.read()).draft.identity.appTitle).toBe("بازدید سبز");});
  it("rejects unsupported evidence switches and tenant modifications",async()=>{const repo=create(),state=await repo.read();expect(()=>repo.save(actors["platform-admin"],state.revision,{...state.draft,tenantId:"broker-b"})).toThrow();expect(()=>repo.save(actors["platform-admin"],state.revision,{...state.draft,application:{...state.draft.application,features:{...state.draft.application.features,nativeCaptureFallback:false as true}}})).toThrow();});
});
