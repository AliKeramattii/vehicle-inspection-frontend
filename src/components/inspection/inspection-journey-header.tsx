import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { JourneyStepper, type JourneyStage } from "./journey-stepper";

export function InspectionJourneyHeader({ current, backHref, referenceCode, partnerName }: { current: "location" | "vehicle" | "capture"; backHref: string; referenceCode?: string; partnerName?: string }) {
  const stages: JourneyStage[] = [
    { id: "location", label: "موقعیت", state: current === "location" ? "current" : "completed" },
    { id: "vehicle", label: "خودرو", state: current === "vehicle" ? "current" : current === "capture" ? "completed" : "upcoming" },
    { id: "photos", label: "عکاسی", state: current === "capture" ? "current" : "upcoming" },
    { id: "submit", label: "ارسال", state: "upcoming" },
  ];
  return <div className="inspection-journey-header">
    <header><div><Icon name="platformCar" size={28} /><h1>بازدید خودرو</h1></div>
      {current === "capture" && <div className="capture-partner"><Icon name="shield" size={24} /><span>{partnerName}</span></div>}
      <Link href={backHref} aria-label="بازگشت">{referenceCode && <span className="capture-reference"><small>کد بازدید</small><bdi dir="ltr">{referenceCode}</bdi></span>}<Icon name="chevronForward" size={25} /></Link>
    </header>
    <JourneyStepper stages={stages} completedIcon="readinessTick" />
  </div>;
}
