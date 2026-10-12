import { RuntimeBrokerName, RuntimeLogo } from "@/config/branding-assets";
import { Icon } from "@/components/ui/icon";
export function CoBranding({compact=false}:{compact?:boolean}) {
  return <div className="co-branding" data-compact={compact} aria-label="سامانه بازدید و شرکت بیمه">
    <span className="application-mark" role="img" aria-label="بازدید خودرو"><Icon name="platformCar" size={compact?28:38}/></span>
    <span className="co-branding-divider" aria-hidden="true"/>
    <span className="brokerage-mark"><RuntimeLogo width={compact?28:36} height={compact?28:36} fallback={<Icon name="shield" size={compact?26:34}/>}/><span><RuntimeBrokerName fallback="شرکت بیمه"/></span></span>
  </div>;
}
