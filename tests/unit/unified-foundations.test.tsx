import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { createBrowserCapabilityService } from "@/features/readiness/browser-capabilities";
import { canContinueReadiness } from "@/features/readiness/capabilities";
import { readableAdminAccent, readAdminTheme, setAdminTheme } from "@/features/admin/admin-theme";
import { actors } from "@/features/admin/model";
import { SiteSettingsRepository, MemorySettingsPersistence } from "@/config/site-settings.repository";
import { contrast } from "@/config/site-settings.schema";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
import { InspectionJourneyHeader } from "@/components/inspection/inspection-journey-header";
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); sessionStorage.clear(); });
const browser = (denied = false) => {
  const open = vi.fn(), locate = vi.fn();
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: open }, geolocation: { getCurrentPosition: locate },
    permissions: { query: ({ name }: { name: string }) => Promise.resolve({ state: name === "geolocation" && denied ? "denied" : "prompt" }) },
    storage: { estimate: () => Promise.resolve({ quota: 512 * 1024 * 1024, usage: 0 }) } });
  vi.stubGlobal("MediaRecorder", { isTypeSupported: () => true });
  return { open, locate };
};
describe("unified readiness and operations foundations", () => {
  it("checks four customer capabilities without opening camera/GPS or pretending prompt is granted", async () => {
    const api = browser(), result = await createBrowserCapabilityService().check(new AbortController().signal);
    expect(result.find(r => r.id === "camera")?.status).toBe("permission-required");
    expect(result.find(r => r.id === "location")?.status).toBe("permission-required");
    expect(result.find(r => r.id === "video")?.status).toBe("ready");
    expect(api.open).not.toHaveBeenCalled(); expect(api.locate).not.toHaveBeenCalled();
    expect(canContinueReadiness(result)).toBe(true);
  });
  it("denied GPS keeps manual map selection available", async () => {
    browser(true); const result = await createBrowserCapabilityService().check(new AbortController().signal);
    expect(result.find(r => r.id === "location")?.status).toBe("permission-denied");
    expect(canContinueReadiness(result)).toBe(true);
  });
  it("unsupported recorder is truthful and blocks required recording readiness", async () => {
    browser(); vi.stubGlobal("MediaRecorder", undefined);
    const result = await createBrowserCapabilityService().check(new AbortController().signal);
    expect(result.find(r => r.id === "video")?.status).toBe("unsupported");
    expect(canContinueReadiness(result)).toBe(false);
  });
  it("Site Settings draft reads require the Site Admin role", () => {
    const seed = defaultSiteSettings("demo"), bootstrap = { schemaVersion: 1 as const, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "mock" as const };
    const repository = new SiteSettingsRepository(new MemorySettingsPersistence(), "test", bootstrap, "https://example.test", seed);
    expect(() => repository.read(actors.reviewer)).toThrow();
    expect(() => repository.read(actors.viewer)).toThrow();
  });
  it("persists Admin preference and derives readable brand accents for both modes", () => {
    setAdminTheme("dark"); expect(readAdminTheme()).toBe("dark");
    for (const primary of ["#2563EB", "#047857", "#FFFFFF"]) for (const dark of [true, false]) for (const surface of dark ? ["#172234", "#202D42", "#203C66"] : ["#FFFFFF", "#F1F5F9", "#E8F0FF"]) expect(contrast(readableAdminAccent(primary, dark), surface)).toBeGreaterThanOrEqual(4.5);
    setAdminTheme("light"); expect(readAdminTheme()).toBe("light");
  });
  it("ordinary customer journey headers do not reveal the internal inspection reference", () => {
    render(<InspectionJourneyHeader current="capture" backHref="/" referenceCode="BDI-8F31K2" />);
    expect(screen.queryByText("BDI-8F31K2")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "بازگشت" })).toBeVisible();
  });
});
