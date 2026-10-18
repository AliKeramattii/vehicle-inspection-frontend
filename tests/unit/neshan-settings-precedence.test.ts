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
  it("preserves an explicit published map key and all Admin map choices", async () => {
    enablePreview(); const f = fixture(), initial = await f.stored.read();
    const changed = {...initial.draft, application: {...initial.draft.application, locationMap: {...initial.draft.application.locationMap!, webMapKey: "web.admin-fixture", mapType: "standard-night" as const}}};
    const saved = await f.stored.save(actor, initial.revision, changed); await f.stored.publish(actor, saved.revision);
    expect((await f.live.read()).published.application.locationMap).toEqual((await f.stored.read()).published.application.locationMap);
  });
  it("a saved map draft cannot hide a runtime key from the published customer view", async () => {
    enablePreview(); const f = fixture(), initial = await f.stored.read();
    const draftMap = {...initial.draft.application.locationMap!, webMapKey: "web.unpublished-draft", mapType: "standard-night" as const};
    const saved = await f.stored.save(actor, initial.revision, {...initial.draft, application: {...initial.draft.application, locationMap: draftMap}});
    const live = await f.live.read();
    expect(live.published.application.locationMap).toEqual(f.runtime.application.locationMap);
    expect(live.draft.application.locationMap).toEqual(draftMap);
    expect(await f.stored.read()).toEqual(saved);
  });
  it("repairs a partial missing-key publication while preserving its viewport and style without rewriting history", async () => {
    enablePreview(); const f = fixture(), initial = await f.stored.read();
    const partial = {...initial.draft.application.locationMap!, reverseGeocoding: "api" as const, mapType: "standard-night" as const, initialViewport: {latitude: 36, longitude: 52, zoom: 14}};
    const saved = await f.stored.save(actor, initial.revision, {...initial.draft, application: {...initial.draft.application, locationMap: partial}});
    const published = await f.stored.publish(actor, saved.revision), live = await f.live.read();
    expect(live.published.application.locationMap).toEqual({...partial, webMapKey: f.runtime.application.locationMap!.webMapKey});
    expect(live.history).toEqual(published.history); expect(live.audit).toEqual(published.audit);
    expect(await f.stored.read()).toEqual(published);
  });
  it("uses the matching runtime geocoder profile when filling a missing key", async () => {
    enablePreview(); const f = fixture(), initial = await f.stored.read();
    const partial = {...initial.draft.application.locationMap!, reverseGeocoding: "mock" as const};
    const saved = await f.stored.save(actor, initial.revision, {...initial.draft, application: {...initial.draft.application, locationMap: partial}});
    await f.stored.publish(actor, saved.revision);
    expect((await f.live.read()).published.application.locationMap).toMatchObject({webMapKey: f.runtime.application.locationMap!.webMapKey, reverseGeocoding: "api"});
  });
  it("preserves an explicitly disabled map, and never borrows a disabled runtime map's key", async () => {
    enablePreview(); const f = fixture(), initial = await f.stored.read();
    const disabled = {...initial.draft.application.locationMap!, enabled: false};
    const saved = await f.stored.save(actor, initial.revision, {...initial.draft, application: {...initial.draft.application, locationMap: disabled}});
    await f.stored.publish(actor, saved.revision); expect((await f.live.read()).published.application.locationMap).toEqual(disabled);
    const other = fixture(); await other.stored.read(); other.runtime.application.locationMap!.enabled = false;
    expect((await other.live.read()).published.application.locationMap!.webMapKey).toBeNull();
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
