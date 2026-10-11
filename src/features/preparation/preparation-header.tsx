import Link from "next/link";
import { RuntimeBrokerName, RuntimeLogo } from "@/config/branding-assets";
import { Icon } from "@/components/ui/icon";

export function PreparationBack({ href }: { href: string }) {
  return <nav className="preparation-back" aria-label="بازگشت"><Link href={href}><Icon name="chevronBack" size={21} />بازگشت</Link></nav>;
}
export function ConsentBranding() {
  return <header className="consent-branding">
    <Link href="/readiness" aria-label="بازگشت به آمادگی" className="consent-back"><Icon name="chevronBack" size={21} /></Link>
    <div><Icon name="platformCar" size={29} /><span>بازدید خودرو</span></div>
    <span className="consent-brand-divider" aria-hidden="true" />
    <div><RuntimeLogo width={27} height={27} fallback={<Icon name="shield" size={27} />} /><span><RuntimeBrokerName fallback="شرکت بیمه" /></span></div>
  </header>;
}
