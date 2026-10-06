import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { InspectionSection } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { sectionProgress } from "./photography-model";

export function SectionRow({ section, records, inspectionId }: { section: InspectionSection; records: readonly LocalPhoto[]; inspectionId: string }) {
  const { completed, total, retake } = sectionProgress(section, records);
  const state = retake ? "attention" : completed === total ? "complete" : completed ? "attention" : "pending";
  return <Link href={inspectionRoutes.section(inspectionId, section.id)} className="photography-section-row" data-state={state} aria-label={`${section.title}، ${fa(completed)} از ${fa(total)}${retake ? "، نیاز به عکاسی مجدد" : ""}`}>
    <span className="section-state" aria-hidden="true">{state === "complete" ? "✓" : state === "attention" ? "↻" : fa(section.order)}</span>
    <strong>{section.title}</strong><span className="section-count">{fa(completed)} از {fa(total)}</span><Icon name="chevronBack" size={18} />
  </Link>;
}
