import { BrandingImage, type BrandingAssetRole } from "@/config/branding-assets";
import "./customer-hero.css";

/** Presentation only: shared containment, page-specific viewport budgets, existing tenant resolver. */
export function CustomerHeroArtwork({ role, className = "", imageClassName = "" }: { role: BrandingAssetRole; className?: string; imageClassName?: string }) {
  return <div className={"customer-hero-artwork " + className} data-customer-hero={role}>
    <BrandingImage role={role} className={imageClassName} alt={role === "otp" ? "تلفن همراه و نشان تأیید امن" : "خودروی سدان سفید در استودیوی روشن"} fill sizes="(max-width:480px) 100vw, 480px" preload />
  </div>;
}
