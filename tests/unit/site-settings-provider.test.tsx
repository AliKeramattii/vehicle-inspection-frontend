import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { SiteSettingsProvider, useRuntimeSite } from "@/config/site-settings.provider";
import { loadBootstrap, loadSettings } from "@/config/site-settings.loader";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
import type { SiteBootstrap } from "@/config/site-settings.schema";
vi.mock("next/navigation", () => ({usePathname: () => "/"}));
vi.mock("@/features/admin/assets/use-branding-asset", () => ({useBrandingAsset: () => ({url: null})}));
vi.mock("@/config/site-settings.loader", () => ({loadBootstrap: vi.fn(), loadSettings: vi.fn()}));
const clients: QueryClient[] = [];
const bootstrap = (settingsSource: "mock" | "api"): SiteBootstrap => ({schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource});
function Probe() { const site = useRuntimeSite(); return <output data-testid="runtime">{site.bootstrap.settingsSource + ":" + Boolean(site.settings.application.locationMap?.webMapKey)}</output>; }
function mount() { const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}}}); clients.push(client); render(<QueryClientProvider client={client}><SiteSettingsProvider><Probe/></SiteSettingsProvider></QueryClientProvider>); }
afterEach(() => {cleanup(); clients.splice(0).forEach(client => client.clear()); focusManager.setFocused(undefined); vi.unstubAllEnvs(); vi.resetAllMocks();});
describe("active runtime bootstrap and settings cache", () => {
  it("recovers an already-open development page from mock to live API without reusing the mock settings query", async () => {
    vi.stubEnv("NODE_ENV", "development"); focusManager.setFocused(true);
    let source: "mock" | "api" = "mock";
    vi.mocked(loadBootstrap).mockImplementation(async () => bootstrap(source));
    vi.mocked(loadSettings).mockImplementation(async boot => {const settings = defaultSiteSettings("demo"); if (boot.settingsSource === "api") settings.application.locationMap!.webMapKey = "web.provider-fixture"; return settings;});
    mount(); await waitFor(() => expect(screen.getByTestId("runtime")).toHaveTextContent("mock:false"));
    act(() => {focusManager.setFocused(false);}); source = "api";
    await act(async () => {focusManager.setFocused(true);});
    await waitFor(() => expect(screen.getByTestId("runtime")).toHaveTextContent("api:true"));
    expect(vi.mocked(loadSettings).mock.calls.some(([boot]) => boot.settingsSource === "api")).toBe(true);
  });
  it("does not add bootstrap focus polling in production", async () => {
    vi.stubEnv("NODE_ENV", "production"); focusManager.setFocused(true);
    vi.mocked(loadBootstrap).mockResolvedValue(bootstrap("api"));
    vi.mocked(loadSettings).mockResolvedValue(defaultSiteSettings("demo"));
    mount(); await waitFor(() => expect(screen.getByTestId("runtime")).toHaveTextContent("api:false"));
    act(() => {focusManager.setFocused(false);}); await act(async () => {focusManager.setFocused(true);});
    expect(loadBootstrap).toHaveBeenCalledTimes(1);
  });
});
