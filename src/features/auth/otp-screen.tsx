import Link from "next/link";
import Image from "next/image";
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
    <div className="otp-art"><Image src="/images/auth/otp-phone-shield.png" alt="تلفن همراه و نشان تأیید امن" width={1536} height={1024} sizes="(max-width: 480px) 100vw, 480px" preload /></div>
    <OtpVerificationCard />
  </main>;
}
