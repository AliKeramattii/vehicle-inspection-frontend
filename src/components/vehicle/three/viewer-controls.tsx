import { Icon, type IconName } from "@/components/ui/icon";
import { viewerDirections, viewConfig, type VehicleView } from "@/lib/vehicle/viewer-config";
const directionIcon: Record<typeof viewerDirections[number], IconName> = { front: "viewFront", right: "viewRight", rear: "viewRear", left: "viewLeft", top: "viewTop" };
export function ViewerControls({ view, mode, canUse3d, onView, onMode, onReset }: { view: VehicleView; mode: "3d" | "2d"; canUse3d: boolean;
  onView: (view: VehicleView) => void; onMode: (mode: "3d" | "2d") => void; onReset: () => void;
}) {
  return <div className="vehicle-viewer-controls" role="group" aria-label="کنترل نمای خودرو">
    <button type="button" className="viewer-mode" aria-label={mode === "3d" ? "فعال‌سازی نمای دوبعدی" : "فعال‌سازی نمای سه‌بعدی"} aria-pressed={mode === "2d"}
      disabled={mode === "2d" && !canUse3d} onClick={() => onMode(mode === "3d" ? "2d" : "3d")}><Icon name={mode === "3d" ? "toggle3d" : "toggle2d"} size={23} /><bdi dir="ltr">{mode === "3d" ? "2D" : "3D"}</bdi></button>
    <button type="button" aria-label="بازنشانی نمای خودرو" onClick={onReset}><Icon name="resetCamera" size={23} /><span>بازنشانی</span></button>
    <div className="viewer-directions">{viewerDirections.map((direction) => <button key={direction} type="button" aria-label={`نمای ${viewConfig[direction].label}`} aria-pressed={view === direction || direction === "front" && view === "front-left"}
      onClick={() => onView(direction)}><Icon name={directionIcon[direction]} size={23} /><span>{viewConfig[direction].label}</span></button>)}</div>
  </div>;
}
