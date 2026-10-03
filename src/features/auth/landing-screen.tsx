import Image from "next/image";
import { EntryBranding } from "@/components/layout/entry-branding";
import { ReferralForm } from "./referral-form";
import { LandingBenefits } from "./landing-benefits";
import { TrustFooter } from "./trust-footer";

export function LandingScreen() {
  return <main id="main-content" tabIndex={-1} className="entry-screen landing-screen">
    <EntryBranding />
    <div className="landing-intro">
      <h1>بازدید آنلاین خودرو<br /><span>در کمتر از ۱۵ دقیقه</span></h1>
      <p>با چند مرحله ساده، از هر کجا خودروی خود را<br />به صورت آنلاین و راهنمایی‌شده بازدید کنید.</p>
    </div>
    <div className="landing-art"><Image src="/images/auth/landing-suv.png" alt="خودروی سفید در استودیوی روشن" width={1536} height={1024} sizes="(max-width: 480px) 100vw, 480px" preload /></div>
    <ReferralForm />
    <LandingBenefits />
    <TrustFooter />
  </main>;
}
