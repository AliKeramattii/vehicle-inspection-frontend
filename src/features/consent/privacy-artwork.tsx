import Image from "next/image";

export function PrivacyArtwork() {
  return <div className="consent-hero">
    <Image src="/images/preparation/consent-hero.webp" alt="خودرو و نشان امنیت اطلاعات بازدید" width={1774} height={887} sizes="(max-width: 480px) 100vw, 480px" preload />
  </div>;
}
