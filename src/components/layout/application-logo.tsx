import Image from "next/image";
import type { CSSProperties } from "react";
/** The approved SVG is unchanged. Crop only its transparent viewBox margins. */
export function ApplicationLogo({ width = 40, className = "", decorative = false }: { width?: number; className?: string; decorative?: boolean }) {
  return <span className={"application-logo " + className} role={decorative ? undefined : "img"} aria-hidden={decorative || undefined} aria-label={decorative ? undefined : "سامانه بازدید خودرو"} style={{ width, aspectRatio: "602 / 379" } as CSSProperties}>
    <Image src="/brand/application-logo.svg" width={750} height={520} alt="" aria-hidden="true" loading="eager" unoptimized />
  </span>;
}
