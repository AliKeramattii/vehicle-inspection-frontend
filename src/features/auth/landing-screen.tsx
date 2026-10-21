import { CustomerHeroArtwork } from "@/components/layout/customer-hero-artwork";
import { EntryBranding } from "@/components/layout/entry-branding";
import { CustomerEntryResolver } from "@/features/inspection-status/customer-entry";
import { ReferralForm } from "./referral-form";
import { LandingBenefits } from "./landing-benefits";
import { TrustFooter } from "./trust-footer";
import "./landing-redesign.css";

export function LandingScreen() {
  return <main id="main-content" tabIndex={-1} className="entry-screen landing-screen">
    <EntryBranding />
    <CustomerEntryResolver />
    <section className="landing-welcome" aria-labelledby="landing-title"><div className="landing-intro"><p className="landing-eyebrow">بازدید غیرحضوری بیمه</p>
      <h1 id="landing-title">بازدید آنلاین خودرو<br /><span>در کمتر از ۱۵ دقیقه</span></h1>
      <p>با چند مرحله ساده، از هر کجا خودروی خود را<br />به صورت آنلاین و راهنمایی‌شده بازدید کنید.</p>
    </div>
    <CustomerHeroArtwork role="landing" className="landing-art" /></section>
    <section className="landing-start" aria-label="شروع بازدید آنلاین">
    <ReferralForm />
    <LandingBenefits />
    <TrustFooter />
    </section>
  </main>;
}
