import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { JourneyStepper, type JourneyStage } from "./journey-stepper";

export function InspectionJourneyHeader({ current, backHref, referenceCode, partnerName }: { current: "location" | "vehicle" | "capture" | "upload"; backHref: string; referenceCode?: string; partnerName?: string }) {
  const stages: JourneyStage[] = [
    { id: "location", label: "موقعیت", state: current === "location" ? "current" : "completed" },
    { id: "vehicle", label: "خودرو", state: current === "vehicle" ? "current" : current === "capture" || current === "upload" ? "completed" : "upcoming" },
    { id: "photos", label: "عکاسی", state: current === "capture" ? "current" : current === "upload" ? "completed" : "upcoming" },
    { id: "submit", label: "ارسال", state: current === "upload" ? "current" : "upcoming" },
  ];
  return <div className="inspection-journey-header">
    <header><div><Icon name="platformCar" size={28} /><h1>بازدید خودرو</h1></div>
      {(current === "capture" || current === "upload") && <div className="capture-partner"><Icon name="shield" size={24} /><span>{partnerName}</span></div>}
      <Link href={backHref} aria-label="بازگشت">{referenceCode && <span className="capture-reference"><small>کد بازدید</small><bdi dir="ltr">{referenceCode}</bdi></span>}<Icon name="chevronForward" size={25} /></Link>
    </header>
    <JourneyStepper stages={stages} completedIcon="readinessTick" />
  </div>;
}
