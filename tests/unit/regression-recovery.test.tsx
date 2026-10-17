import {readFileSync} from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createBrowserCapabilityService } from "@/features/readiness/browser-capabilities";
import { DeviceReadiness } from "@/features/readiness/device-readiness";
import { canContinueReadiness, createMockCapabilityService } from "@/features/readiness/capabilities";
import { MemorySettingsPersistence, SiteSettingsRepository } from "@/config/site-settings.repository";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
import { defaultThemeColors, legacyFactoryTheme } from "@/config/theme-colors";
import type { SiteBootstrap } from "@/config/site-settings.schema";
const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });
const boot: SiteBootstrap = { schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "api" };
function device(cameraPermission: () => string) {
    const camera = vi.fn(), gps = vi.fn();
    vi.stubGlobal("isSecureContext", true);
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: camera }, geolocation: { getCurrentPosition: gps }, permissions: { query: async ({ name }: {
                name: string;
            }) => ({ state: name === "camera" ? cameraPermission() : "denied" }) }, storage: { estimate: async () => ({ quota: 512 * 1024 * 1024, usage: 0 }) } });
    vi.stubGlobal("MediaRecorder", { isTypeSupported: () => true });
    return { camera, gps };
}
describe("joint regression recovery", () => {
    it("ships an Emerald development example so live setup cannot reintroduce the old blue factory palette",()=>{const sample=JSON.parse(readFileSync("tools/dev-neshan-proxy/site-settings.example.json","utf8"));expect(sample.theme).toEqual(defaultThemeColors);expect(sample.application.locationMap.webMapKey).toBeNull();});
    it("uses the approved live demo theme for a pristine old factory record without rewriting history", async () => {
        vi.stubEnv("NODE_ENV", "development");
        vi.stubEnv("NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW", "1");
        const storage = new MemorySettingsPersistence(), old = defaultSiteSettings("demo");
        old.theme = { ...legacyFactoryTheme };
        const stored = new SiteSettingsRepository(storage, "demo", boot, "http://localhost:3114", old);
        await stored.read();
        const live = new SiteSettingsRepository(storage, "demo", boot, "http://localhost:3114", defaultSiteSettings("demo"));
        const view = await live.read();
        expect(view.published.theme).toEqual(defaultThemeColors);
        expect(view.draft.theme).toEqual(defaultThemeColors);
        expect(view.history[0].theme).toEqual(legacyFactoryTheme);
        expect((await stored.read()).published.theme).toEqual(legacyFactoryTheme);
    });
    it.each(["edited", "production", "custom seed"])("preserves intentional API branding for %s", async (mode) => {
        vi.stubEnv("NODE_ENV", mode === "production" ? "production" : "development");
        vi.stubEnv("NEXT_PUBLIC_LOCAL_SETTINGS_PREVIEW", "1");
        const storage = new MemorySettingsPersistence(), old = defaultSiteSettings("demo");
        old.theme = { ...legacyFactoryTheme };
        const stored = new SiteSettingsRepository(storage, "branding", boot, "http://localhost:3114", old);
        await stored.read();
        if (mode === "edited")
            await storage.transact("branding", () => { throw Error("missing"); }, s => { s.revision = 2; });
        const initial = defaultSiteSettings("demo");
        if (mode === "custom seed")
            initial.theme.primary = "#7c2d12";
        const live = new SiteSettingsRepository(storage, "branding", boot, "http://localhost:3114", initial);
        expect((await live.read()).published.theme).toEqual(legacyFactoryTheme);
    });
    it("does not show a pointless recheck when only GPS permission is denied", async () => {
        const api = device(() => "prompt");
        render(<DeviceReadiness service={createBrowserCapabilityService()}/>);
        await waitFor(() => expect(screen.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled());
        expect(screen.queryByRole("button", { name: "بررسی دوباره" })).not.toBeInTheDocument();
        expect(api.camera).not.toHaveBeenCalled();
        expect(api.gps).not.toHaveBeenCalled();
    });
    it("explains blocked camera permission, then clears it on a real recheck after permission improves", async () => {
        let permission = "denied";
        const api = device(() => permission);
        render(<DeviceReadiness service={createBrowserCapabilityService()}/>);
        await screen.findByText(/دسترسی دوربین مسدود است/);
        expect(screen.getByRole("button", { name: "همه چیز آماده است" })).toBeDisabled();
        permission = "granted";
        await userEvent.click(screen.getByRole("button", { name: "بررسی دوباره" }));
        await waitFor(() => expect(screen.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled());
        expect(screen.queryByRole("button", { name: "بررسی دوباره" })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "همه چیز آماده است" }));
        expect(push).toHaveBeenCalledWith("/consent");
        expect(api.camera).not.toHaveBeenCalled();
    });
    it("recovers an unsupported recorder only after actual recording support improves",async()=>{
        device(()=>"prompt");vi.stubGlobal("MediaRecorder",undefined);render(<DeviceReadiness service={createBrowserCapabilityService()}/>);
        await screen.findByText(/ضبط مستقیم ویدیو در این مرورگر پشتیبانی نمی‌شود/);expect(screen.getByRole("button",{name:"همه چیز آماده است"})).toBeDisabled();
        vi.stubGlobal("MediaRecorder",{isTypeSupported:()=>true});await userEvent.click(screen.getByRole("button",{name:"بررسی دوباره"}));await waitFor(()=>expect(screen.getByRole("button",{name:"همه چیز آماده است"})).toBeEnabled());
    });
    it.each(["camera","video"] as const)("never counts an unknown %s check as ready",async id=>{
        const results=await createMockCapabilityService({[id]:"unknown"}).check(new AbortController().signal);expect(canContinueReadiness(results)).toBe(false);
    });
    it("explains and blocks known insufficient storage instead of silently permitting capture",async()=>{
        device(()=>"prompt");vi.stubGlobal("navigator",{...navigator,storage:{estimate:async()=>({quota:50*1024*1024,usage:0})}});render(<DeviceReadiness service={createBrowserCapabilityService()}/>);
        await screen.findByText(/کمتر از ۱۰۰ مگابایت/);expect(screen.getByRole("button",{name:"همه چیز آماده است"})).toBeDisabled();
    });
    it("does not confuse a storage estimate failure with known insufficient capacity", async () => {
        device(() => "prompt");
        vi.stubGlobal("navigator", { ...navigator, storage: { estimate: async () => { throw Error("temporary"); } } });
        const result = await createBrowserCapabilityService().check(new AbortController().signal);
        expect(result.find(r => r.id === "storage")?.status).toBe("unknown");
        expect(canContinueReadiness(result)).toBe(true);
    });
});
