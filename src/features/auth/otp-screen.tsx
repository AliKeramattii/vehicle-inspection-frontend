import "@/features/inspection-status/customer-status.css";
import Link from "next/link";
import { CustomerHeroArtwork } from "@/components/layout/customer-hero-artwork";
import { EntryBranding } from "@/components/layout/entry-branding";
import { Icon } from "@/components/ui/icon";
import { OtpVerificationCard } from "./otp-verification-card";

export function OtpScreen() {
  return <main id="main-content" tabIndex={-1} className="entry-screen otp-screen">
    <nav className="otp-back-nav" aria-label="بازگشت"><Link href="/"><Icon name="chevronBack" size={22} />بازگشت</Link></nav>
    <EntryBranding verification />
    <div className="otp-intro"><h1>تأیید شماره موبایل</h1>
      <p>کد پنج‌رقمی به شماره موبایل زیر ارسال شد.<br />لطفاً کد را وارد کنید تا فرآیند ادامه یابد.</p>
    </div>
    <CustomerHeroArtwork role="otp" className="otp-art" />
    <OtpVerificationCard />
  </main>;
}
