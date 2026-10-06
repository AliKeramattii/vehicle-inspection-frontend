import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

// Supplied currentColor SVGs; physical direction assets are never mirrored.
const icons = {
  car: "/icons/vehicle/car.svg", back: "/icons/navigation/arrow-right-rtl.svg",
  forward: "/icons/navigation/arrow-left-rtl.svg", info: "/icons/navigation/info.svg",
  help: "/icons/navigation/help-circle.svg", check: "/icons/status/check-circle.svg",
  warning: "/icons/status/warning.svg", error: "/icons/status/error.svg",
  clock: "/icons/navigation/clock.svg", shield: "/icons/security/shield-check.svg",
  close: "/icons/navigation/close.svg",
  lock: "/icons/security/lock.svg", cloud: "/icons/upload/upload-cloud.svg",
  noVisit: "/icons/location/gps-off.svg", edit: "/icons/navigation/edit.svg",
  referral: "/icons/auth/referral-ticket.svg", carFront: "/icons/vehicle/car-front.svg",
  platformCar: "/icons/auth/platform-car.svg", support: "/icons/auth/support-headset.svg",
  chevronBack: "/icons/auth/chevron-back.svg", chevronForward: "/icons/auth/chevron-forward.svg",
  cameraReady: "/icons/readiness/camera-ready.svg", gpsReady: "/icons/readiness/gps-ready.svg",
  webglReady: "/icons/readiness/webgl-ready.svg", storageReady: "/icons/readiness/storage.svg",
  deviceReady: "/icons/readiness/device-ready.svg", camera: "/icons/camera/camera.svg",
  readinessTick: "/icons/readiness/tick.svg",
  location: "/icons/location/map-pin.svg", document: "/icons/admin/policies.svg",
  terms: "/icons/admin/policies.svg", down: "/icons/navigation/chevron-down.svg",
  locate: "/icons/location/current-location.svg", accuracy: "/icons/location/location-accuracy.svg",
  mapPin: "/icons/location/map-pin-selected.svg", building: "/icons/location/building.svg",
  parking: "/icons/location/parking.svg", plate: "/icons/vehicle/license-plate.svg",
  keyboard: "/icons/reviewer/manual-plate.svg", copy: "/icons/navigation/copy.svg",
  discrepancy: "/icons/status/warning.svg",
  cabin: "/icons/vehicle/car-interior.svg", engine: "/icons/vehicle/engine.svg",
  viewFront: "/icons/viewer-3d/view-front.svg", viewRight: "/icons/viewer-3d/view-right.svg",
  viewRear: "/icons/viewer-3d/view-rear.svg", viewLeft: "/icons/viewer-3d/view-left.svg", viewTop: "/icons/viewer-3d/view-top.svg",
  resetCamera: "/icons/viewer-3d/reset-camera.svg", toggle2d: "/icons/viewer-3d/toggle-2d.svg", toggle3d: "/icons/viewer-3d/toggle-3d.svg",
  photoFrame: "/icons/camera/alignment.svg", photoFocus: "/icons/camera/focus.svg",
  photoGlare: "/icons/camera/glare-warning.svg", photoAngle: "/icons/retake-reasons/wrong-angle.svg",
  ignition: "/icons/readiness/engine-on.svg", hood: "/icons/vehicle/hood-open.svg", vin: "/icons/vehicle/vin.svg",
  distance: "/icons/photography/distance.svg", stability: "/icons/camera/stability.svg",
} as const;
export type IconName = keyof typeof icons;

export function Icon({ name, size = 24, label, className }: {
  name: IconName; size?: number; label?: string; className?: string;
}) {
  const style: CSSProperties = { width: size, height: size, maskImage: `url("${icons[name]}")`,
    maskRepeat: "no-repeat", maskPosition: "center", maskSize: "contain" };
  return <span role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    className={cn("inline-block shrink-0 bg-current", className)} style={style} />;
}
