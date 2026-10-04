import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { JourneyStepper, type JourneyStage } from "./journey-stepper";

export function InspectionJourneyHeader({ current, backHref }: { current: "location" | "vehicle"; backHref: string }) {
  const stages: JourneyStage[] = [
    { id: "location", label: "موقعیت", state: current === "location" ? "current" : "completed" },
    { id: "vehicle", label: "خودرو", state: current === "vehicle" ? "current" : "upcoming" },
    { id: "photos", label: "عکاسی", state: "upcoming" },
    { id: "submit", label: "ارسال", state: "upcoming" },
  ];
  return <div className="inspection-journey-header">
    <header><div><Icon name="platformCar" size={28} /><h1>بازدید خودرو</h1></div>
      <Link href={backHref} aria-label="بازگشت"><Icon name="chevronForward" size={25} /></Link>
    </header>
    <JourneyStepper stages={stages} completedIcon="readinessTick" />
  </div>;
}
