import { Icon } from "@/components/ui/icon";

export function TrustFooter() {
  return <footer className="entry-trust-footer">
    <div className="trust-divider" aria-hidden="true"><span /><i><Icon name="shield" size={18} /></i><span /></div>
    <p>اطلاعات شما مطابق با استانداردهای امنیتی، محرمانه باقی می‌ماند.</p>
    <details id="support" className="entry-support">
      <summary><Icon name="support" size={20} />پشتیبانی شرکت بیمه<Icon name="chevronForward" size={14} /></summary>
      <p>برای دریافت راهنمایی، با نمایندگی شرکت بیمه صادرکننده کد معرفی خود تماس بگیرید.</p>
    </details>
  </footer>;
}
