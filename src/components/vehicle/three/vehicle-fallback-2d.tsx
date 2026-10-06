import { useEffect, useId, useRef, useState } from "react";
import { InspectionPin } from "./inspection-pin";
import { shotState } from "@/lib/vehicle/inspection-state";
import { resolveSemanticNodes } from "@/lib/vehicle/semantic-nodes";
import { projectFallbackAnchor, viewConfig } from "@/lib/vehicle/viewer-config";
import type { VehicleSceneProps } from "./viewer-types";
import { layoutInspectionPins } from "@/lib/vehicle/pin-layout";

export function VehicleFallback2D({ bodyColor, view, slots, selectedCode, highlightNodes, onSelect }: VehicleSceneProps) {
  const id = useId().replace(/:/g, "");
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 280 });
  useEffect(() => {
    if (!container.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const top = view === "top", end = view === "front" || view === "rear";
  const right = view === "right" || view === "front-right" || view === "rear-right";
  const anchors = slots.flatMap((slot) => { const node = resolveSemanticNodes(slot.highlightNodes)[0]; if (!node) return []; const [x, y] = projectFallbackAnchor(node, view); return [{ code: slot.code, x: x / 100 * size.width, y: y / 100 * size.height }]; });
  const pins = layoutInspectionPins(anchors, size.width, size.height, selectedCode);
  return <div ref={container} className="vehicle-fallback-2d" data-view={view} role="group" aria-label={`نمای دوبعدی خودرو، ${viewConfig[view].label}`}>
    <svg className="fallback-car-art" viewBox="0 0 400 280" role="img" aria-label={`طرح خودرو از ${viewConfig[view].label}`}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".4" stopColor={bodyColor} /><stop offset="1" stopColor="#c1cad4" /></linearGradient></defs>
      <ellipse cx="200" cy={top ? 226 : 223} rx={top ? 90 : 160} ry="14" fill="#798da3" opacity=".12" />
      {top ? <g transform="translate(100 26)"><path d="M53 0h94l40 35v143l-40 36H53l-40-36V35Z" fill={`url(#${id})`} stroke="#768492" strokeWidth="2" />
        <path d="M48 55 65 37h71l16 18v109l-16 19H65l-17-19Z" fill="#34414e" /><path d="M64 84h72v67H64Z" fill="#202f3d" />
        <path d="M20 38h19M161 38h19M19 178h22M159 178h22" stroke="#f6faff" strokeWidth="7" /><path d="M46 53v111m108-111v111" stroke="#c2cbd4" strokeWidth="4" />
      </g> : end ? <g><path d="M85 189v-54l22-63q5-14 20-16h146q15 2 20 16l22 63v54Z" fill={`url(#${id})`} stroke="#788693" strokeWidth="2" />
        <path d="M123 74h154l17 52H106Z" fill="#2f3c49" /><path d="M110 149h39m102 0h39" stroke={view === "rear" ? "#c73740" : "#f1f8ff"} strokeWidth="10" />
        <rect x="142" y="164" width="116" height="30" rx="8" fill="#24313c" /><rect x="173" y="175" width="54" height="13" rx="2" fill="#f8fafc" />
        <rect x="85" y="190" width="31" height="32" rx="8" fill="#26313b" /><rect x="284" y="190" width="31" height="32" rx="8" fill="#26313b" />
      </g> : <g transform={right ? "translate(400 0) scale(-1 1)" : undefined}><path d="M28 201v-55q0-14 16-21l49-13 48-63h115l48 63 45 11q23 5 23 30v48Z" fill={`url(#${id})`} stroke="#748392" strokeWidth="2" />
        <path d="m108 107 37-46h105l36 46Z" fill="#2e3a47" /><path d="M183 61v47m55-47v47" stroke="#b4bfc9" strokeWidth="5" />
        <path d="M136 118v65m96-65v65m-102-58h16m-114 23h33" fill="none" stroke="#8393a2" strokeWidth="2" />
        <path d="M35 197h331" stroke="#364657" strokeWidth="6" /><path d="M36 145h24" stroke="#f5faff" strokeWidth="8" /><path d="M345 145h18" stroke="#c93841" strokeWidth="8" />
        {[93, 300].map((x) => <g key={x}><circle cx={x} cy="198" r="32" fill="#28313a" /><circle cx={x} cy="198" r="22" fill="#b6c0ca" /><circle cx={x} cy="198" r="9" fill="#667789" /></g>)}
      </g>}
      {highlightNodes.map((node) => { const [x, y] = projectFallbackAnchor(node, view); return <ellipse key={node} cx={x * 4} cy={y * 2.8} rx="26" ry="20" fill="#2563eb" fillOpacity=".18" stroke="#2563eb" strokeOpacity=".35" />; })}
    </svg>
    {/* Supplied orthographic drawing provides an honest overview inset, with independent DOM pins. */}
    <div className="fallback-overview" aria-hidden="true"><svg viewBox="0 0 400 215"><image href="/vehicle/fallback/vehicle-orthographic-fallback.svg" width="400" height="420" /></svg></div>
    {slots.map((slot, index) => { const point = pins.find((pin) => pin.code === slot.code); if (!point) return null;
      return <div key={slot.code} className="fallback-pin-anchor" style={{ left: `${point.x / size.width * 100}%`, top: `${point.y / size.height * 100}%` }}><InspectionPin code={slot.code} title={slot.title} index={index + 1}
        state={shotState(slot, selectedCode)} selected={slot.code === selectedCode} onSelect={() => onSelect(slot.code)} /></div>;
    })}
    <div className="fallback-standing" data-side={view} aria-hidden="true"><i /><i /></div>
  </div>;
}
