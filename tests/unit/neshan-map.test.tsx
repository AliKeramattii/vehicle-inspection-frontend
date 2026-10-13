
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InspectionLocationMap } from "@/components/location/inspection-location-map";
import { LocationForm } from "@/features/location/location-form";
import { LocationController } from "@/features/location/location-controller";
import { defaultLocationMap, locationMapSchema, siteSettingsSchema } from "@/config/site-settings.schema";
import { defaultSiteSettings } from "@/config/site-settings.defaults";
import { attachNeshan, browserLocationService, type NeshanLeaflet } from "@/lib/map/neshan-adapter";
import { coordinatesSchema, selectionSchema, type LocationSelection } from "@/lib/map/location-selection";
import { firstPartyReverseGeocoder, mockReverseGeocoder, unavailableReverseGeocoder } from "@/lib/map/reverse-geocoder";

const manual = (latitude = 35.7): LocationSelection => ({ latitude, longitude: 51.4, selectionSource: "manual", accuracyMeters: null });
const gps: LocationSelection = { ...manual(), selectionSource: "gps", accuracyMeters: 8 };
const address = "تهران، خیابان نمونه، محل بازدید";
const fields = { buildingNumber: "42", unitFloor: "", parkingDescription: "" };
const saved = { ...gps, formattedAddress: address, ...fields, recordedAt: "2026-10-13T08:00:00.000Z" };
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("explicit selection and race-safe address", () => {
  it("does not select/confirm the initial neutral viewport or an address alone", () => {
    const controller = new LocationController(null, unavailableReverseGeocoder);
    expect(controller.getSnapshot().point).toBeNull(); controller.editAddress(address);
    expect(controller.canConfirm).toBe(false); expect(() => controller.confirmed(fields)).toThrow();
  });
  it.each([{ latitude: NaN, longitude: 51 }, { latitude: 91, longitude: 51 }, { latitude: 35, longitude: -181 }, { latitude: Infinity, longitude: 51 }])("rejects invalid coordinates %j", value => {
    expect(coordinatesSchema.safeParse(value).success).toBe(false);
  });
  it("blocks overly long addresses before producing a confirmation payload", () => {
    const c = new LocationController(saved, unavailableReverseGeocoder);
    c.editAddress("a".repeat(301)); expect(c.canConfirm).toBe(false);
    expect(() => c.confirmed(fields)).toThrow(); c.dispose();
  });
  it("accepts valid zero/signed coordinates but forbids manual GPS precision", () => {
    expect(coordinatesSchema.safeParse({ latitude: 0, longitude: -50.2 }).success).toBe(true);
    expect(selectionSchema.safeParse({ ...manual(), accuracyMeters: 8 }).success).toBe(false);
  });
  it("GPS retains source/accuracy; repeated same-point selection preserves edited address without another lookup", async () => {
    vi.useFakeTimers(); const geocoder = { address: vi.fn().mockResolvedValue({ formattedAddress: address, source: "api" }) };
    const c = new LocationController(null, geocoder); c.select(gps); await vi.advanceTimersByTimeAsync(400);
    c.editAddress("آدرس ویرایش‌شده"); c.select({ ...gps, accuracyMeters: 6 });
    await vi.advanceTimersByTimeAsync(400); expect(geocoder.address).toHaveBeenCalledTimes(1);
    expect(c.getSnapshot()).toMatchObject({ point: { selectionSource: "gps", accuracyMeters: 6 }, address: "آدرس ویرایش‌شده" });
    c.dispose();
  });
  it("manual point change clears precision and makes the previous address stale until edited/reconfirmed", async () => {
    vi.useFakeTimers(); const c = new LocationController(saved, unavailableReverseGeocoder);
    c.select(manual(35.8)); expect(c.canConfirm).toBe(false);
    expect(c.getSnapshot()).toMatchObject({ address, addressCurrent: false, point: { selectionSource: "manual", accuracyMeters: null } });
    c.useAddressForPoint(); expect(c.canConfirm).toBe(true);
    await vi.advanceTimersByTimeAsync(400); expect(c.canConfirm).toBe(true); c.dispose();
  });
  it("populates a suggested address after debounce and caches repeated points", async () => {
    vi.useFakeTimers(); const lookup = vi.fn().mockResolvedValue({ formattedAddress: address, source: "api" });
    const c = new LocationController(null, { address: lookup });
    c.select(manual()); await vi.advanceTimersByTimeAsync(399); expect(lookup).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); expect(c.canConfirm).toBe(true);
    c.select(manual(35.8)); await vi.advanceTimersByTimeAsync(400);
    c.select(manual()); await vi.advanceTimersByTimeAsync(400); expect(lookup).toHaveBeenCalledTimes(2); c.dispose();
  });
  it("ignores late old responses even when the transport does not honor abort", async () => {
    vi.useFakeTimers(); let a!: (value: { formattedAddress: string; source: "api" }) => void;
    const lookup = vi.fn().mockImplementationOnce(() => new Promise(resolve => { a = resolve; })).mockResolvedValueOnce({ formattedAddress: "آدرس نقطه جدید", source: "api" });
    const c = new LocationController(null, { address: lookup });
    c.select(manual()); await vi.advanceTimersByTimeAsync(400); c.select(manual(35.8)); await vi.advanceTimersByTimeAsync(400);
    a({ formattedAddress: "آدرس قدیمی", source: "api" }); await Promise.resolve(); expect(c.getSnapshot().address).toBe("آدرس نقطه جدید"); c.dispose();
  });
  it("never overwrites an active or completed manual edit with a late response", async () => {
    vi.useFakeTimers(); let finish!: (value: { formattedAddress: string; source: "api" }) => void;
    const c = new LocationController(null, { address: () => new Promise(resolve => { finish = resolve; }) });
    c.select(manual()); await vi.advanceTimersByTimeAsync(400); c.focusAddress(true); c.editAddress("آدرس کاربر");
    finish({ formattedAddress: address, source: "api" }); await Promise.resolve();
    expect(c.getSnapshot()).toMatchObject({ address: "آدرس کاربر", addressCurrent: true, suggestion: address }); c.dispose();
  });
  it("failure preserves point and permits manual address; confirmation stamps actual time", async () => {
    vi.useFakeTimers(); const c = new LocationController(null, unavailableReverseGeocoder); c.select(manual());
    await vi.advanceTimersByTimeAsync(400); expect(c.getSnapshot().addressStatus).toBe("failed");
    c.editAddress("  " + address + "  "); const payload = c.confirmed(fields, () => "2026-10-13T12:34:56.000Z");
    expect(payload).toEqual({ ...manual(), ...fields, formattedAddress: address, recordedAt: "2026-10-13T12:34:56.000Z" }); c.dispose();
  });
  it("unconfirmed editing never mutates the saved object and disposal cancels timers/requests", async () => {
    vi.useFakeTimers(); const lookup = vi.fn().mockResolvedValue({ formattedAddress: address, source: "api" });
    const initial = structuredClone(saved), c = new LocationController(initial, { address: lookup });
    c.select(manual(35.8)); c.dispose(); await vi.advanceTimersByTimeAsync(1000);
    expect(lookup).not.toHaveBeenCalled(); expect(initial).toEqual(saved);
  });
});

describe("public configuration and first-party address boundary", () => {
  it("legacy settings remain valid; private keys/overrides in map configuration are rejected", () => {
    const old = defaultSiteSettings("demo"); delete old.application.locationMap;
    expect(siteSettingsSchema.safeParse(old).success).toBe(true);
    expect(locationMapSchema.safeParse({ ...defaultLocationMap(), serviceKey: "forbidden" }).success).toBe(false);
    expect(locationMapSchema.safeParse({ ...defaultLocationMap(), reverseEndpoint: "https://third-party.invalid" }).success).toBe(false);
  });
  it("mock addresses are explicitly distinguished", async () => {
    expect(await mockReverseGeocoder.address(manual(), new AbortController().signal)).toMatchObject({ source: "mock", formattedAddress: expect.stringContaining("آدرس آزمایشی") });
  });
  it("only calls the validated first-party endpoint, with cancellation and no provider credential", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ formatted_address: address })));
    const geocoder = firstPartyReverseGeocoder({ schemaVersion: 1, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "mock" }, "https://inspection.example", fetcher);
    expect(await geocoder.address(manual(), new AbortController().signal)).toEqual({ formattedAddress: address, source: "api" });
    expect(fetcher.mock.calls[0][0]).toBe("https://inspection.example/api/maps/reverse?lat=35.7&lng=51.4");
    expect(fetcher.mock.calls[0][1].headers).toEqual({ Accept: "application/json" });
    expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
  it("rejects missing/invalid address and HTTP failure without exposing raw details", async () => {
    const boot = { schemaVersion: 1 as const, tenantId: "demo", apiBaseUrl: "/api", siteSettingsEndpoint: "/api/public/site-settings", settingsSource: "mock" as const };
    for (const response of [new Response("{}", { status: 200 }), new Response("private diagnostic", { status: 429 })])
      await expect(firstPartyReverseGeocoder(boot, "https://inspection.example", vi.fn().mockResolvedValue(response)).address(manual(), new AbortController().signal)).rejects.toThrow();
  });
});

describe("official Leaflet adapter and lifecycle", () => {
  function fixture() {
    const handlers = new Map<string, (event: { latlng?: { lat: number; lng: number } }) => void>();
    let center = { lat: 35.7, lng: 51.4 };
    const raw = { on: vi.fn((name, callback) => handlers.set(name, callback)), off: vi.fn((name) => handlers.delete(name)), getCenter: () => center,
      panTo: vi.fn(), flyTo: vi.fn(() => handlers.get("moveend")?.({})), stop: vi.fn(), invalidateSize: vi.fn(), eachLayer: vi.fn(), remove: vi.fn() };
    const layer = { addTo: vi.fn().mockReturnThis(), remove: vi.fn(), on: vi.fn(), off: vi.fn() };
    const sdk = { Map: vi.fn(function () { return raw; }), circle: vi.fn(() => layer), circleMarker: vi.fn(() => layer) } as unknown as NeshanLeaflet;
    return { handlers, raw, sdk, setCenter: (next: typeof center) => { center = next; } };
  }
  it("initialization/resize/zoom do not select; drag selects manual and cleanup unregisters listeners", () => {
    const f = fixture(), selected = vi.fn(), host = document.createElement("div");
    const map = attachNeshan(f.sdk, host, { ...defaultLocationMap(), webMapKey: "fixture" }, null, { selected, error: vi.fn() });
    f.handlers.get("moveend")?.({}); map.resize(); expect(selected).not.toHaveBeenCalled();
    f.handlers.get("dragstart")?.({}); f.setCenter({ lat: 35.8, lng: 51.4 }); f.handlers.get("moveend")?.({});
    expect(selected).toHaveBeenLastCalledWith(manual(35.8));
    f.handlers.get("moveend")?.({}); expect(selected).toHaveBeenCalledTimes(1);
    map.remove(); expect(f.raw.off).toHaveBeenCalledTimes(4); expect(f.raw.remove).toHaveBeenCalledTimes(1);
  });
  it("programmatic GPS animation is not reclassified as manual; zoom preserves source", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const f = fixture(), selected = vi.fn(); const map = attachNeshan(f.sdk, document.createElement("div"), defaultLocationMap(), null, { selected, error: vi.fn() });
    map.showGps(gps); f.handlers.get("moveend")?.({}); expect(selected).not.toHaveBeenCalled(); map.remove();
  });
  it("same-center drag preserves GPS accuracy, tap-to-center deliberately selects a different point", () => {
    const f = fixture(), selected = vi.fn(); const map = attachNeshan(f.sdk, document.createElement("div"), defaultLocationMap(), gps, { selected, error: vi.fn() });
    f.handlers.get("dragstart")?.({}); f.handlers.get("moveend")?.({}); expect(selected).not.toHaveBeenCalled();
    f.handlers.get("click")?.({ latlng: { lat: 35.8, lng: 51.4 } }); expect(selected).toHaveBeenCalledWith(manual(35.8)); map.remove();
  });
  it("component initializes once, disposes late instances, and requests GPS only on click", async () => {
    const selected = vi.fn(), instance = { showGps: vi.fn(), remove: vi.fn(), resize: vi.fn() }, locate = vi.fn().mockResolvedValue(gps);
    const factory = vi.fn().mockResolvedValue(instance), config = { ...defaultLocationMap(), webMapKey: "fixture" };
    const mounted = render(<InspectionLocationMap config={config} point={null} onSelect={selected} service={{ locate }} factory={factory} />);
    await waitFor(() => expect(factory).toHaveBeenCalledTimes(1)); expect(locate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به موقعیت من" }));
    await waitFor(() => expect(selected).toHaveBeenCalledWith(gps)); expect(instance.showGps).toHaveBeenCalledWith(gps);
    mounted.unmount(); expect(instance.remove).toHaveBeenCalledTimes(1);
    render(<InspectionLocationMap config={config} point={gps} onSelect={selected} factory={factory} />);
    await waitFor(() => expect(factory).toHaveBeenCalledTimes(2));
  });
  it("recoverable tile failure retains the map, fixed pin and retry ownership", async () => {
    const instance = { showGps: vi.fn(), remove: vi.fn(), resize: vi.fn() };
    const factory = vi.fn<import("@/lib/map/neshan-adapter").MapFactory>().mockResolvedValue(instance);
    const mounted = render(<InspectionLocationMap config={{...defaultLocationMap(),webMapKey:"web.unit-fixture"}} point={null} onSelect={vi.fn()} factory={factory}/>);
    await waitFor(() => expect(factory).toHaveBeenCalledTimes(1));
    await act(async () => factory.mock.calls[0][3].error());
    expect(screen.getByRole("status")).toHaveTextContent("بارگذاری نقشه کامل نشد.");
    expect(mounted.container.querySelector(".neshan-center-pin")).toBeVisible();
    expect(mounted.container.querySelector(".neshan-map-message")).toBeNull();
    fireEvent.click(screen.getByRole("button",{name:"تلاش دوباره برای بارگذاری نقشه"}));
    await waitFor(() => expect(factory).toHaveBeenCalledTimes(2));
    expect(instance.remove).toHaveBeenCalledTimes(1);
  });
  it("late GPS completion after unmount cannot select; denied GPS remains recoverable", async () => {
    let finish!: (value: LocationSelection) => void;
    const selected = vi.fn(), service = { locate: vi.fn(() => new Promise<LocationSelection>(resolve => { finish = resolve; })) };
    const mounted = render(<InspectionLocationMap point={null} onSelect={selected} service={service} />);
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به موقعیت من" })); mounted.unmount();
    await act(async () => finish(gps)); expect(selected).not.toHaveBeenCalled();
    render(<InspectionLocationMap point={null} onSelect={selected} service={{ locate: vi.fn().mockRejectedValue(new Error("اجازه دسترسی داده نشد")) }} />);
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به موقعیت من" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("اجازه دسترسی داده نشد");
    expect(screen.getByRole("button", { name: "بازگشت به موقعیت من" })).toBeEnabled();
  });
  it("does not allow GPS or manual point activation before consent/access is established", () => {
    render(<LocationForm onConfirm={vi.fn()} canConfirm={false} />);
    expect(screen.getByRole("button", { name: "بازگشت به موقعیت من" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "انتخاب این مختصات" })).toBeDisabled();
  });
  it("form gates confirmation on explicit point and current address", async () => {
    const confirm = vi.fn(); render(<LocationForm onConfirm={confirm} service={{ locate: vi.fn().mockResolvedValue(gps) }} />);
    const cta = screen.getByRole("button", { name: "تأیید این موقعیت" }); expect(cta).toBeDisabled();
    fireEvent.change(screen.getByLabelText("آدرس موقعیت خودرو"), { target: { value: address } }); expect(cta).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به موقعیت من" }));
    await waitFor(() => expect(screen.getByText("این آدرس برای نقطه جدید درست است")).toBeVisible()); expect(cta).toBeDisabled();
    fireEvent.click(screen.getByText("این آدرس برای نقطه جدید درست است")); expect(cta).toBeEnabled(); fireEvent.click(cta);
    await waitFor(() => expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ ...gps, formattedAddress: address, recordedAt: expect.any(String) })));
  });
});

describe("explicit browser GPS", () => {
  it("does not start geolocation for an already canceled request", async () => {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
    const request = new AbortController(); request.abort();
    await expect(browserLocationService.locate(request.signal)).rejects.toThrow("Aborted");
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });
  it.each([1, 2, 3])("provides useful failure for GPS code %s", async code => {
    vi.stubGlobal("isSecureContext", true);
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: (_success: unknown, failure: (value: { code: number }) => void) => failure({ code }) } });
    await expect(browserLocationService.locate(new AbortController().signal)).rejects.toThrow(/نقطه/);
  });
  it("requires secure context and validates the genuine GPS fix", async () => {
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition: vi.fn(success => success({ coords: { latitude: 35.7, longitude: 51.4, accuracy: 8 } })) } });
    vi.stubGlobal("isSecureContext", false); await expect(browserLocationService.locate(new AbortController().signal)).rejects.toThrow("HTTPS");
    vi.stubGlobal("isSecureContext", true); expect(await browserLocationService.locate(new AbortController().signal)).toEqual(gps);
  });
});
