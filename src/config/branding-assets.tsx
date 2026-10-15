"use client";
import { vehicleHeroAssets } from "./vehicle-assets";
import Image, { getImageProps, type ImageProps } from "next/image";
import { useState, useEffect, type ReactNode } from "react";
import { useOptionalRuntimeSite } from "./site-settings.provider";
import { useBrandingAsset } from "@/features/admin/assets/use-branding-asset";
export const brandingAssets = {
  landing: { src: vehicleHeroAssets.landing, fit: "cover" },
  referral: { src: vehicleHeroAssets.introduction, fit: "cover" },
  otp: { src: "/images/auth/otp-phone-shield.png", fit: "cover" },
  readiness: { src: vehicleHeroAssets.readiness, fit: "cover" },
  consent: { src: vehicleHeroAssets.consent, fit: "contain" },
  submission: { src: vehicleHeroAssets.receipt, fit: "contain" },
} as const;
export type BrandingAssetRole = keyof typeof brandingAssets;
function useOverride(role: BrandingAssetRole) {
  const site = useOptionalRuntimeSite();
  const reference = role === "landing" ? site?.settings.images.landing ?? site?.settings.images.referral : site?.settings.images[role];
  return useBrandingAsset(reference, { contextKey: site?.contextKey ?? "", tenantId: site?.bootstrap.tenantId ?? "" }).url;
}
export function BrandingImage({ role, alt, ...props }: { role: BrandingAssetRole } & Omit<ImageProps, "src">) {
  const override = useOverride(role), [failed, setFailed] = useState<string>();
  const src = override && failed !== override ? override : brandingAssets[role].src;
  return <Image {...props} alt={alt} src={src} unoptimized={Boolean(override && src === override) || props.unoptimized}
    onError={() => { if (override) setFailed(override); }} />;
}
function useBrandingBackgroundState(role: BrandingAssetRole) {
  const candidate = useOverride(role), [failed, setFailed] = useState<string>();
  useEffect(() => {
    if (!candidate) return;
    const probe = new window.Image(); probe.onerror = () => setFailed(candidate); probe.src = candidate;
    return () => { probe.onerror = null; probe.removeAttribute("src"); };
  }, [candidate]);
  if (candidate && candidate !== failed) return { backgroundImage: "url(" + JSON.stringify(candidate) + ")", isDefault: false };
  const { props: { srcSet = "" } } = getImageProps({ src: brandingAssets[role].src, alt: "", width: 480, height: 237 });
  return { backgroundImage: "image-set(" + srcSet.split(", ").map(source => { const [url, density] = source.split(" "); return 'url("' + url + '") ' + density; }).join(", ") + ")", isDefault: true };
}
export function useBrandingBackground(role: BrandingAssetRole) { return useBrandingBackgroundState(role).backgroundImage; }
export function RuntimeBrokerName({ fallback }: { fallback: ReactNode }) {
  const site = useOptionalRuntimeSite(); return <>{site ? site.settings.identity.brokerageName : fallback}</>;
}
export function RuntimeLogo({ fallback, width = 31, height = 35 }: { fallback: ReactNode; width?: number; height?: number }) {
  const site = useOptionalRuntimeSite(), asset = useBrandingAsset(site?.settings.identity.logo, { contextKey: site?.contextKey ?? "", tenantId: site?.bootstrap.tenantId ?? "" });
  const [failed, setFailed] = useState<string>(), src = asset.url;
  return src && src !== failed ? <Image src={src} alt="" className="runtime-logo" width={width} height={height} unoptimized onError={() => setFailed(src)} /> : fallback;
}
export function BrandingBackground({ role, className, label, children }: { role: BrandingAssetRole; className: string; label: string; children: ReactNode }) {
  const { backgroundImage, isDefault } = useBrandingBackgroundState(role); return <section className={className} data-default-asset={isDefault} aria-label={label} style={{ backgroundImage }}>{children}</section>;
}
