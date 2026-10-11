import { BrandingImage } from "@/config/branding-assets";

export function PrivacyArtwork() {
  return <div className="consent-hero">
    <BrandingImage role="consent" alt="خودرو و نشان امنیت اطلاعات بازدید" width={1774} height={887} sizes="(max-width: 480px) 100vw, 480px" preload />
  </div>;
}
