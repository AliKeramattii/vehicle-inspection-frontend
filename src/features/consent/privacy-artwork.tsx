import { BrandingImage } from "@/config/branding-assets";

export function PrivacyArtwork() {
  return <div className="consent-hero">
    <BrandingImage role="consent" alt="خودروی سدان سفید در استودیوی روشن" width={1672} height={941} sizes="(max-width: 480px) 100vw, 480px" preload />
  </div>;
}
