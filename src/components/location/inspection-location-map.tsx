"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { IconButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { toPersianDigits } from "@/lib/utils/persian";
import { developmentLocationAdapter, LocationServiceError, type InspectionLocationAdapter, type MapOffset } from "@/lib/map/location-adapter";
import type { InspectionLocation } from "@/types/domain";

const failureText = { denied: "دسترسی به موقعیت داده نشده است", unavailable: "موقعیت در دسترس نیست", unsupported: "موقعیت در این دستگاه پشتیبانی نمی‌شود" } as const;
export function InspectionLocationMap({ location, onChange, adapter = developmentLocationAdapter }: {
  location: InspectionLocation; onChange: (location: InspectionLocation) => void; adapter?: InspectionLocationAdapter;
}) {
  const [offset, setOffset] = useState<MapOffset>(() => adapter.coordinatesOffset(adapter.initialLocation, location));
  const drag = useRef<{ pointerId: number; x: number; y: number; offset: MapOffset } | null>(null);
  const locate = useMutation({ mutationFn: () => adapter.locate(), onSuccess: (fix) => {
    setOffset({ x: 0, y: 0 });
    onChange({ ...location, ...fix });
  } });
  const move = (next: MapOffset) => {
    const bounded = { x: Math.max(-140, Math.min(140, next.x)), y: Math.max(-140, Math.min(140, next.y)) };
    setOffset(bounded);
    onChange({ ...location, ...adapter.offsetCoordinates(locate.data ?? adapter.initialLocation, bounded) });
  };
  const error = locate.isError ? failureText[locate.error instanceof LocationServiceError ? locate.error.code : "unavailable"] : null;
  const radius = Math.min(90, Math.max(20, location.accuracyMeters / adapter.metersPerPixel));
  return <section className="inspection-location-map" aria-label="انتخاب موقعیت بازدید روی نقشه">
    <div className="map-pan-surface" role="group" tabIndex={0} aria-label="جابجایی نقشه" aria-describedby="map-keyboard-help"
      onKeyDown={(event) => {
        const delta = { ArrowLeft: { x: 20, y: 0 }, ArrowRight: { x: -20, y: 0 }, ArrowUp: { x: 0, y: 20 }, ArrowDown: { x: 0, y: -20 } }[event.key];
        if (delta) { event.preventDefault(); move({ x: offset.x + delta.x, y: offset.y + delta.y }); }
      }}
      onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, offset }; }}
      onPointerMove={(event) => { const start = drag.current; if (start?.pointerId === event.pointerId) move({ x: start.offset.x + event.clientX - start.x, y: start.offset.y + event.clientY - start.y }); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      <div className="development-map-scene" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} aria-hidden="true">
        <Image src={adapter.artwork} alt="" width={800} height={800} unoptimized preload draggable={false} />
        <span className="map-street map-street-highway">بزرگراه کردستان</span><span className="map-street map-street-main">خیابان سهروردی شمالی</span>
        <span className="map-street map-street-side">خیابان خرمشهر</span><span className="map-park">پارک ساعی</span>
      </div>
    </div>
    <p id="map-keyboard-help" className="sr-only">نقشه نمونه است. برای انتخاب نقطه، نقشه را بکشید یا از کلیدهای جهت استفاده کنید. نشانگر انتخاب ثابت می‌ماند.</p>
    {!error && <div className="gps-accuracy-circle" aria-hidden="true" style={{ width: radius * 2, height: radius * 2, marginLeft: offset.x, marginTop: offset.y }}><span /></div>}
    <div className="inspection-selection-pin" aria-label="نشانگر ثابت موقعیت انتخابی" role="img"><Image src="/icons/location/inspection-pin.svg" alt="" width={36} height={46} unoptimized /></div>
    <div className="map-accuracy-badge" role="status"><Icon name="locate" size={23} /><span>{locate.isPending ? "در حال یافتن موقعیت…" : error ?? `دقت موقعیت ± ${toPersianDigits(location.accuracyMeters)} متر`}</span></div>
    <IconButton className="map-locate-button" aria-label="بازگشت به موقعیت من" loading={locate.isPending} onClick={() => locate.mutate()}>{!locate.isPending && <Icon name="locate" size={27} />}</IconButton>
  </section>;
}
