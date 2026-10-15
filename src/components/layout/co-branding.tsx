import { RuntimeBrokerName, RuntimeLogo } from "@/config/branding-assets";
import { ApplicationLogo } from "./application-logo";
import { Icon } from "@/components/ui/icon";
export function CoBranding({compact=false}:{compact?:boolean}) {
  return <div className="co-branding" data-compact={compact} aria-label="سامانه بازدید و شرکت بیمه">
    <ApplicationLogo width={compact ? 36 : 46} />
    <span className="co-branding-divider" aria-hidden="true"/>
    <span className="brokerage-mark"><RuntimeLogo width={compact?28:36} height={compact?28:36} fallback={<Icon name="shield" size={compact?26:34}/>}/><span><RuntimeBrokerName fallback="شرکت بیمه"/></span></span>
  </div>;
}
