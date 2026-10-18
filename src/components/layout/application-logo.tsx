import Image from "next/image";
import type { CSSProperties } from "react";
/** Exact approved default identity; brokerage logos are resolved separately. */
export function ApplicationLogo({ width = 40, className = "", decorative = false }: { width?: number; className?: string; decorative?: boolean }) {
  return <span className={"application-logo " + className} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : "سامانه بازدید خودرو"} style={{ width, aspectRatio: "1 / 1" } as CSSProperties}>
    <Image src="/branding/logo.webp" width={1254} height={1254} alt="" aria-hidden="true" loading="eager" unoptimized />
  </span>;
}
