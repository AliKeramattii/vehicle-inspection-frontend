"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { canContinueReadiness, customerCapabilityDefinitions, capabilityStatusLabels, type CapabilityService } from "./capabilities";
import { useCapabilities } from "./use-capabilities";

export function DeviceReadiness({ service }: { service?: CapabilityService }) {
  const { results, retry } = useCapabilities(service);
  const customerResults = results.filter(({ id }) => id !== "webgl");
  const router = useRouter();
  const canContinue = canContinueReadiness(results);
  const hasProblems = customerResults.some(({ status }) => status !== "ready" && status !== "checking");
  return <>
    <section className="device-readiness" aria-labelledby="device-readiness-title">
      <div className="device-readiness-heading"><span><Icon name="deviceReady" size={25} /></span><div>
        <h2 id="device-readiness-title">آمادگی دستگاه</h2>
        <p>بررسی امکانات مورد نیاز برای بازدید.</p>
      </div></div>
      <ul className="device-diagnostics" aria-live="polite" aria-busy={customerResults.some(({ status }) => status === "checking")}>
        {customerCapabilityDefinitions.map((definition) => {
          const result = results.find(({ id }) => id === definition.id)!;
          return <li key={definition.id} data-status={result.status}>
            <Icon name={definition.icon} size={23} /><span>{definition.label}</span>
            <span className="capability-status" title={result.message ?? capabilityStatusLabels[result.status]}>
              <Icon name={result.status === "ready" ? "readinessTick" : result.status === "checking" ? "clock" : "warning"} size={22} />
              <span className={result.status === "ready" || result.status === "checking" ? "sr-only" : "capability-status-label"}>{capabilityStatusLabels[result.status]}</span>
            </span>
          </li>;
        })}
      </ul>
      {hasProblems && <div className="capability-help"><p>برای ادامه، دوربین، موقعیت مکانی و فضای ذخیره‌سازی باید در دسترس باشند. اجازه دسترسی در مرحله مربوط درخواست می‌شود.</p><SecondaryButton onClick={retry}>بررسی دوباره</SecondaryButton></div>}
    </section>
    <BottomStickyCTA className="preparation-actions"><PrimaryButton className="customer-primary-action" disabled={!canContinue} onClick={() => router.push("/consent")}>
      همه چیز آماده است<span className="preparation-cta-arrow"><Icon name="chevronForward" size={22} /></span>
    </PrimaryButton></BottomStickyCTA>
  </>;
}
