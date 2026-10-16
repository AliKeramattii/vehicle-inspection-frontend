import { CustomerHeroArtwork } from "@/components/layout/customer-hero-artwork";
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
    <CustomerHeroArtwork role="landing" className="landing-art" />
    <ReferralForm />
    <LandingBenefits />
    <TrustFooter />
  </main>;
}
