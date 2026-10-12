import { CoBranding } from "@/components/layout/co-branding";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { JourneyStepper, type JourneyStage } from "./journey-stepper";

export function InspectionJourneyHeader({ current, backHref, referenceCode }: { current: "location" | "vehicle" | "capture" | "upload"; backHref: string; referenceCode?: string; partnerName?: string }) {
  const stages: JourneyStage[] = [
    { id: "location", label: "موقعیت", state: current === "location" ? "current" : "completed" },
    { id: "vehicle", label: "خودرو", state: current === "vehicle" ? "current" : current === "capture" || current === "upload" ? "completed" : "upcoming" },
    { id: "photos", label: "عکاسی", state: current === "capture" ? "current" : current === "upload" ? "completed" : "upcoming" },
    { id: "submit", label: "ارسال", state: current === "upload" ? "current" : "upcoming" },
  ];
  return <div className="inspection-journey-header">
    <header><CoBranding compact/><h1 className="sr-only">بازدید خودرو</h1>
      <Link href={backHref} aria-label="بازگشت">{referenceCode && <span className="capture-reference"><small>کد بازدید</small><bdi dir="ltr">{referenceCode}</bdi></span>}<Icon name="chevronForward" size={25} /></Link>
    </header>
    <JourneyStepper stages={stages} completedIcon="readinessTick" />
  </div>;
}
