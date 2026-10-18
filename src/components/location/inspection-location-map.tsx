
"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SecondaryButton } from "@/components/ui/button";
import { defaultLocationMap, type LocationMapConfiguration } from "@/config/site-settings.schema";
import { browserLocationService, createNeshan, type MapFactory, type NeshanMap, type DeviceLocationService } from "@/lib/map/neshan-adapter";
import { selectionSchema, type LocationSelection } from "@/lib/map/location-selection";
import "@neshan-maps-platform/leaflet/dist/leaflet.css";

export function InspectionLocationMap({ point, onSelect, config = defaultLocationMap(), service = browserLocationService, factory = createNeshan, disabled = false }: {
  point: LocationSelection | null; onSelect: (point: LocationSelection) => void;
  config?: LocationMapConfiguration; service?: DeviceLocationService; factory?: MapFactory; disabled?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null), map = useRef<NeshanMap | undefined>(undefined);
  const latest = useRef({ point, onSelect, disabled });
  useEffect(() => { latest.current = { point, onSelect, disabled }; }, [point, onSelect, disabled]);
  const activeGps = useRef<AbortController | undefined>(undefined);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [locating, setLocating] = useState(false), [error, setError] = useState<string>();
  const [generation, setGeneration] = useState(0);
  const [tileError, setTileError] = useState(false);
  const retryMap = () => { setTileError(false); setError(undefined); setStatus("loading"); setGeneration(value => value + 1); };
  const configured = Boolean(config.enabled && config.webMapKey);
  useEffect(() => {
    if (!configured || !host.current) return;
    let active = true, owned: NeshanMap | undefined;
    const initialization = new AbortController();
    const callbacks = {
      selected(next: LocationSelection) { if (active && !latest.current.disabled) latest.current.onSelect(next); },
      // A missing/empty tile is recoverable; do not hide the fixed pin or cover an initialized map.
      error() { if (active) setTileError(true); },
    };
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => owned?.resize());
    observer?.observe(host.current);
    void factory(host.current, config, latest.current.point, callbacks, initialization.signal).then(instance => {
      owned = instance;
      if (!active) { instance.remove(); return; }
      map.current = instance; instance.resize(); setStatus("ready");
      const selected = latest.current.point; if (selected?.selectionSource === "gps") instance.showGps(selected);
    }).catch(() => { if (active) { setStatus("error"); setError("نقشه در دسترس نیست؛ تنظیمات و اتصال اینترنت را بررسی کنید."); } });
    return () => { active = false; initialization.abort(); observer?.disconnect(); owned?.remove(); map.current = undefined; };
  }, [configured, config, factory, generation]);
  useEffect(() => () => activeGps.current?.abort(), []);
  async function locate() {
    if (locating || disabled) return;
    const request = new AbortController(); activeGps.current = request; setLocating(true); setError(undefined);
    try {
      const fix = selectionSchema.parse(await service.locate(request.signal));
      if (request.signal.aborted) return;
      latest.current.onSelect(fix); map.current?.showGps(fix);
    } catch (cause) {
      if (!request.signal.aborted) setError(cause instanceof Error ? cause.message : "دریافت موقعیت ممکن نشد.");
    } finally { if (!request.signal.aborted) setLocating(false); }
  }
  return <section className="neshan-location-map" data-map-state={configured ? status : "unconfigured"} aria-label="انتخاب موقعیت بازدید">
    <div ref={host} className="neshan-map-canvas" tabIndex={configured && !disabled ? 0 : -1} data-disabled={disabled} aria-disabled={disabled} aria-label="نقشه تعاملی نشان" />
    {configured && status !== "error" && <span className="neshan-center-pin" aria-hidden="true"><Icon name="mapPin" size={42} /></span>}
    {(!configured || status !== "ready") && <div className="neshan-map-message" role="status">
      <Icon name="mapPin" size={32} />
      <strong>{!configured ? "نقشه هنوز پیکربندی نشده است" : status === "loading" ? "در حال بارگذاری نقشه…" : "نقشه در دسترس نیست"}</strong>
      <p>{!configured ? "کلید عمومی وب نقشه نشان را در تنظیمات این کارگزاری ثبت کنید. موقعیت ذخیره‌شده تغییر نکرده است." : error}</p>
      {status === "error" && <SecondaryButton onClick={retryMap}>تلاش دوباره</SecondaryButton>}
    </div>}
    <button type="button" className="neshan-locate" aria-label="بازگشت به موقعیت من" disabled={locating || disabled} onClick={() => void locate()}><Icon name="locate" size={21} /><span>{locating ? "در حال یافتن موقعیت…" : "موقعیت من"}</span></button>
    {tileError && status === "ready" && !error && <div className="neshan-location-error neshan-tile-warning" role="status"><span>بارگذاری نقشه کامل نشد.</span><button type="button" onClick={retryMap} aria-label="تلاش دوباره برای بارگذاری نقشه">تلاش دوباره</button></div>}
    {error && status !== "error" && <p className="neshan-location-error" role="alert">{error}</p>}
  </section>;
}
