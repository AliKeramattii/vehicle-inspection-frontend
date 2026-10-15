"use client";

import Image from "next/image";
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
  const hasProblems = customerResults.some(({ status }) => ["unavailable", "unsupported", "unknown"].includes(status));
  const explanations = { camera: "اجازه دوربین هنگام عکاسی", location: "انتخاب روی نقشه؛ GPS اختیاری", storage: "نگهداری مدارک روی دستگاه", video: "پشتیبانی ضبط ویدیوی پیوسته" };
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
            {definition.id === "location" ? <Image src="/icons/readiness/inspection-pin.svg" width={23} height={29} alt="" unoptimized /> : <Icon name={definition.icon} size={23} />}<div className="capability-copy"><h3>{definition.label}</h3><p>{definition.id !== "webgl" ? explanations[definition.id] : ""}</p>
              {["unavailable", "unsupported", "unknown"].includes(result.status) && <p className="capability-feedback" data-status={result.status}>{result.message ?? capabilityStatusLabels[result.status]}</p>}
            </div>
          </li>;
        })}
      </ul>
      {customerResults.some(({ status }) => status === "checking") && <p className="capability-checking" role="status">در حال بررسی امکانات دستگاه…</p>}
      {hasProblems && <div className="capability-help"><p>دوربین، ضبط ویدیو و فضای ذخیره‌سازی بررسی می‌شوند. موقعیت مکانی را در مرحله بعد روی نقشه انتخاب کنید؛ ندادن اجازه GPS مانع انتخاب دستی نیست.</p><SecondaryButton onClick={retry}>بررسی دوباره</SecondaryButton></div>}
      <p className="readiness-location-note">موقعیت خودرو را در مرحله بعد مشخص می‌کنید؛ دسترسی GPS فقط با اقدام شما درخواست می‌شود.</p>
    </section>
    <BottomStickyCTA className="preparation-actions"><PrimaryButton className="customer-primary-action" disabled={!canContinue} onClick={() => router.push("/consent")}>
      همه چیز آماده است<span className="preparation-cta-arrow"><Icon name="chevronForward" size={22} /></span>
    </PrimaryButton></BottomStickyCTA>
  </>;
}
