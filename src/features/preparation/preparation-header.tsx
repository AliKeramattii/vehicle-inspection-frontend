import Link from "next/link";
import { CoBranding } from "@/components/layout/co-branding";
import { Icon } from "@/components/ui/icon";

export function PreparationBack({ href }: { href: string }) {
  return <nav className="preparation-back" aria-label="بازگشت"><Link href={href}><Icon name="chevronBack" size={21} />بازگشت</Link><CoBranding compact/></nav>;
}
export function ConsentBranding() {
  return <header className="consent-branding">
    <Link href="/readiness" aria-label="بازگشت به آمادگی" className="consent-back"><Icon name="chevronBack" size={21} /></Link>
    <CoBranding compact/>
  </header>;
}
