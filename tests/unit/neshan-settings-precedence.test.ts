import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
import { MemorySettingsPersistence, SiteSettingsRepository } from "@/config/site-settings.repository";
import type { SiteBootstrap } from "@/config/site-settings.schema";
import { actors } from "@/features/admin/model";
const bootstrap: SiteBootstrap = {schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "api"};
const origin = "http://localhost:3114", actor = actors["platform-admin"];
function fixture() {
  const storage = new MemorySettingsPersistence(), factory = defaultSiteSettings("demo");
  const runtime = structuredClone(factory);
  runtime.application.locationMap!.webMapKey = "web.authorized-test-fixture";
  runtime.application.locationMap!.reverseGeocoding = "api";
  return {storage, factory, runtime, stored: new SiteSettingsRepository(storage, "tenant", {...bootstrap, settingsSource: "mock"}, origin, factory),
    live: new SiteSettingsRepository(storage, "tenant", bootstrap, origin, runtime)};
}
function enablePreview() { vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW", "1"); }
afterEach(() => vi.unstubAllEnvs());
describe("development runtime map and existing Admin publication", () => {
  it("configures an untouched factory map while preserving branding, an unrelated draft and immutable stored history", async () => {
    enablePreview(); const f = fixture(); const initial = await f.stored.read();
    const branded = await f.stored.save(actor, initial.revision, {...initial.draft, identity: {...initial.draft.identity, appTitle: "عنوان کارگزاری"}});
    const published = await f.stored.publish(actor, branded.revision);
    const saved = await f.stored.save(actor, published.revision, {...published.draft, identity: {...published.draft.identity, publicPhone: "02112345678"}});
    const live = await f.live.read();
    expect(live.published.application.locationMap).toEqual(f.runtime.application.locationMap);
    expect(live.draft.application.locationMap).toEqual(f.runtime.application.locationMap);
    expect(live.published.identity).toEqual(saved.published.identity);
    expect(live.draft.identity).toEqual(saved.draft.identity);
    expect(live.history).toEqual(saved.history); expect(live.audit).toEqual(saved.audit); expect(live.revision).toBe(saved.revision);
    expect(await f.stored.read()).toEqual(saved); // view only; no destructive migration
    const admin = new SiteSettingsRepository(f.storage, "tenant", bootstrap, origin, live.published);
    expect((await admin.read(actor)).draft.application.locationMap).toEqual(live.published.application.locationMap);
    const changed = await admin.save(actor, live.revision, {...live.draft, identity: {...live.draft.identity, publicEmail: "demo@example.test"}});
    const confirmed = await admin.publish(actor, changed.revision);
    expect(confirmed.published.application.locationMap).toEqual(f.runtime.application.locationMap);
  });
  it.each(["published", "draft"] as const)("preserves explicit %s map configuration", async mode => {
    enablePreview(); const f = fixture(), initial = await f.stored.read();
    const changed = {...initial.draft, application: {...initial.draft.application, locationMap: {...initial.draft.application.locationMap!, webMapKey: "web.admin-fixture", mapType: "standard-night" as const}}};
    const saved = await f.stored.save(actor, initial.revision, changed);
    if (mode === "published") await f.stored.publish(actor, saved.revision);
    const live = await f.live.read(), original = await f.stored.read();
    expect(live.published.application.locationMap).toEqual(original.published.application.locationMap);
    expect(live.draft.application.locationMap).toEqual(original.draft.application.locationMap);
  });
  it("preserves an explicitly disabled map and manually changed viewport", async () => {
    enablePreview(); for (const modification of [{enabled: false}, {initialViewport: {latitude: 36, longitude: 52, zoom: 14}}]) {
      const f = fixture(), initial = await f.stored.read();
      const saved = await f.stored.save(actor, initial.revision, {...initial.draft, application: {...initial.draft.application, locationMap: {...initial.draft.application.locationMap!, ...modification}}});
      await f.stored.publish(actor, saved.revision);
      expect((await f.live.read()).published.application.locationMap).toEqual((await f.stored.read()).published.application.locationMap);
    }
  });
  it.each(["production", "test"])("never overlays API settings in %s", async environment => {
    enablePreview(); vi.stubEnv("NODE_ENV", environment); const f = fixture(); await f.stored.read();
    expect((await f.live.read()).published.application.locationMap!.webMapKey).toBeNull();
  });
  it("requires explicit local preview and never changes mock or another tenant", async () => {
    enablePreview(); const f = fixture(); await f.stored.read(); vi.stubEnv("NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW", "0");
    expect((await f.live.read()).published.application.locationMap!.webMapKey).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW", "1");
    const other = new SiteSettingsRepository(f.storage, "tenant", {...bootstrap, tenantId: "broker-b"}, origin, f.runtime);
    expect((await other.read()).published.application.locationMap!.webMapKey).toBeNull();
    expect((await f.stored.read()).published.application.locationMap!.webMapKey).toBeNull();
  });
});
