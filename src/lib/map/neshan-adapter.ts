
import type { LocationMapConfiguration } from "@/config/site-settings.schema";
import { coordinatesSchema, samePoint, type LocationSelection } from "./location-selection";

type LatLng = { lat: number; lng: number };
type MapEvent = { latlng?: LatLng; layer?: RawLayer };
type Handler = (event: MapEvent) => void;
type RawLayer = {
  // Pinned Neshan Leaflet 1.0.8 uses the selected style as its base TileLayer URL;
  // its separate label TileLayer uses an empty URL.
  _url?: string;
  getContainer?(): HTMLElement;
  on(event: string, handler: Handler): RawLayer; off(event: string, handler: Handler): RawLayer;
  addTo(map: RawMap): RawLayer; remove(): void; setLatLng(point: [number, number]): RawLayer; setRadius(radius: number): RawLayer };
type RawMap = {
  on(event: string, handler: Handler): RawMap; off(event: string, handler: Handler): RawMap;
  getCenter(): LatLng; panTo(point: [number, number], options: { animate: boolean }): RawMap;
  flyTo(point: [number, number], zoom: number, options: { animate: boolean; duration: number }): RawMap;
  invalidateSize(options: { animate: boolean; pan: boolean }): RawMap;
  eachLayer(callback: (layer: RawLayer) => void): RawMap; remove(): void; stop(): RawMap;
};
export type NeshanLeaflet = {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => RawMap;
  circle(point: [number, number], options: Record<string, unknown>): RawLayer;
  circleMarker(point: [number, number], options: Record<string, unknown>): RawLayer;
};
export interface NeshanMap {
  showGps(point: LocationSelection): void;
  resize(): void;
  remove(): void;
}
export type MapCallbacks = { selected(point: LocationSelection): void; error(): void };
export type MapFactory = (container: HTMLElement, config: LocationMapConfiguration, point: LocationSelection | null, callbacks: MapCallbacks, signal: AbortSignal) => Promise<NeshanMap>;

/** Official package imported only inside a mounted browser map. No global window SDK. */
export const createNeshan: MapFactory = async (container, config, point, callbacks, signal) => {
  const { default: sdk } = await import("@neshan-maps-platform/leaflet");
  signal.throwIfAborted();
  return attachNeshan(sdk, container, config, point, callbacks);
};
/** Own adapter behavior is testable independently of Leaflet's rendering internals. */
export function attachNeshan(sdk: NeshanLeaflet, container: HTMLElement, config: LocationMapConfiguration, initial: LocationSelection | null, callbacks: MapCallbacks): NeshanMap {
  const center = initial ?? config.initialViewport;
  const raw = new sdk.Map(container, { key: config.webMapKey, maptype: config.mapType,
    center: [center.latitude, center.longitude], zoom: config.initialViewport.zoom,
    poi: false, traffic: false, zoomControl: true, attributionControl: true });
  let current = initial, manualMove = false, removed = false;
  let accuracy: RawLayer | undefined, position: RawLayer | undefined;
  const layers = new Set<RawLayer>();
  const error: Handler = () => { if (!removed) callbacks.error(); };
  const observeLayer = (layer: RawLayer) => {
    if (layer._url !== config.mapType || layers.has(layer)) return;
    // Empty label overlays legitimately return 204 even with POI/traffic disabled.
    // Only a missing base tile represents missing map imagery. Keep provider layers intact.
    layers.add(layer);
    layer.getContainer?.()?.setAttribute("data-neshan-layer", "base");
    layer.on("tileerror", error);
  };
  const layerAdded: Handler = event => { if (event.layer) observeLayer(event.layer); };
  raw.eachLayer(observeLayer); raw.on("layeradd", layerAdded);
  const select = (latlng: LatLng) => {
    const next = { latitude: latlng.lat, longitude: latlng.lng };
    if (!coordinatesSchema.safeParse(next).success || (current && samePoint(next, current))) return;
    current = { ...next, selectionSource: "manual", accuracyMeters: null }; callbacks.selected(current);
  };
  const drag: Handler = () => { manualMove = true; };
  const move: Handler = () => {
    if (!manualMove) return; manualMove = false; select(raw.getCenter());
  };
  const click: Handler = event => {
    if (!event.latlng) return; manualMove = false; select(event.latlng);
    raw.panTo([event.latlng.lat, event.latlng.lng], { animate: false });
  };
  const key = (event: KeyboardEvent) => { if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)) manualMove = true; };
  container.addEventListener("keydown", key);
  raw.on("dragstart", drag); raw.on("moveend", move); raw.on("click", click);
  function drawGps(fix: LocationSelection) {
    const coords: [number, number] = [fix.latitude, fix.longitude];
    position?.remove(); accuracy?.remove();
    position = sdk.circleMarker(coords, { radius: 5, color: "#FFFFFF", weight: 2, fillColor: "#2563EB", fillOpacity: 1, interactive: false }).addTo(raw);
    accuracy = fix.accuracyMeters === null ? undefined : sdk.circle(coords, { radius: fix.accuracyMeters, color: "#2563EB", weight: 1, fillColor: "#2563EB", fillOpacity: 0.12, interactive: false }).addTo(raw);
  }
  if (initial?.selectionSource === "gps") drawGps(initial);
  return {
    showGps(fix) {
      current = fix; manualMove = false; raw.stop(); drawGps(fix);
      raw.flyTo([fix.latitude, fix.longitude], 16, { animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches, duration: 0.5 });
    },
    resize() { if (!removed) raw.invalidateSize({ animate: false, pan: false }); },
    remove() {
      if (removed) return; removed = true;
      container.removeEventListener("keydown", key);
      raw.off("dragstart", drag); raw.off("moveend", move); raw.off("click", click); raw.off("layeradd", layerAdded);
      layers.forEach(layer => layer.off("tileerror", error)); raw.remove();
    },
  };
}
export interface DeviceLocationService { locate(signal: AbortSignal): Promise<LocationSelection> }
export const browserLocationService: DeviceLocationService = {
  locate: signal => new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    if (!navigator.geolocation) { reject(new Error("موقعیت‌یابی در این مرورگر پشتیبانی نمی‌شود؛ نقطه را دستی انتخاب کنید.")); return; }
    if (!window.isSecureContext) { reject(new Error("برای دریافت موقعیت، صفحه را با HTTPS یا localhost باز کنید.")); return; }
    const abort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    navigator.geolocation.getCurrentPosition(position => {
      signal.removeEventListener("abort", abort); if (signal.aborted) return;
      const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      if (!coordinatesSchema.safeParse(point).success) { reject(new Error("مختصات دریافت‌شده معتبر نیست؛ نقطه را دستی انتخاب کنید.")); return; }
      const accuracy = position.coords.accuracy;
      resolve({ ...point, selectionSource: "gps", accuracyMeters: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null });
    }, failure => {
      signal.removeEventListener("abort", abort); if (signal.aborted) return;
      reject(new Error(({ 1: "اجازه دسترسی به موقعیت داده نشد؛ نقطه را روی نقشه انتخاب کنید.", 2: "موقعیت دستگاه در دسترس نیست؛ دوباره تلاش کنید یا نقطه را دستی انتخاب کنید.", 3: "زمان دریافت موقعیت تمام شد؛ دوباره تلاش کنید یا نقطه را دستی انتخاب کنید." })[failure.code] ?? "دریافت موقعیت ممکن نشد؛ نقطه را دستی انتخاب کنید."));
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }),
};
