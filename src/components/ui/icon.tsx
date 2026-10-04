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
