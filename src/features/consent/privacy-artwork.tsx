import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/icon";

const privacyMarkers: { label: string; icon: IconName; position: string }[] = [
  { label: "موقعیت مکانی", icon: "location", position: "location" },
  { label: "عکس و ویدیو", icon: "camera", position: "media" },
  { label: "اطلاعات فنی", icon: "document", position: "metadata" },
  { label: "زمان ثبت", icon: "clock", position: "time" },
];

// Illustration layers only: no viewer, permission requests, or inspection data.
// Shield/check paths follow the supplied privacy-consent SVG, with studio fills.
export function PrivacyArtwork() {
  return <div className="consent-hero" role="img" aria-label="خودرو و نشان امنیت اطلاعات بازدید">
    <div className="privacy-scene" aria-hidden="true">
      <svg className="privacy-shield" viewBox="0 0 88 110" fill="none">
        <defs><linearGradient id="privacy-shield-fill" x1="9" y1="10" x2="76" y2="105" gradientUnits="userSpaceOnUse"><stop stopColor="#4596ff" /><stop offset="1" stopColor="#2563eb" /></linearGradient></defs>
        <path d="M44 6 78 20v25c0 32-17 53-34 63C27 98 10 77 10 45V20L44 6Z" fill="url(#privacy-shield-fill)" stroke="#a8d0ff" strokeWidth="5" />
        <path d="M44 15 69 25v20c0 24-12 41-25 50C31 86 19 69 19 45V25L44 15Z" stroke="#71b4ff" strokeWidth="1.5" />
        <path d="m29 50 12 12 23-26" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Image className="privacy-car" src="/images/auth/landing-suv.png" alt="" width={1536} height={1024} sizes="260px" preload />
      {privacyMarkers.map(({ label, icon, position }) => <div className={`privacy-marker privacy-marker-${position}`} key={position}><Icon name={icon} size={27} /><span>{label}</span></div>)}
    </div>
  </div>;
}
