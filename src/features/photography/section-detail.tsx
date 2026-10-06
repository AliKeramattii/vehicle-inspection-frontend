import Link from "next/link";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { InspectionSection } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { sectionProgress } from "./photography-model";
import { PhotoRequirementCard } from "./photo-requirement-card";

export function SectionDetail({ section, records, inspectionId }: { section: InspectionSection; records: readonly LocalPhoto[]; inspectionId: string }) {
  const { completed, total, remaining } = sectionProgress(section, records);
  return <div className="photo-route photography-content"><Link className="photo-back" href={inspectionRoutes.capture(inspectionId)}>بازگشت به بخش‌های عکاسی</Link>
    <div className="photography-title"><h2>{section.title}</h2><span>{fa(completed)} از {fa(total)} تصویر</span></div>
    {!remaining && <div className="section-complete" role="status">✓ {section.title} تکمیل شد</div>}
    <div className="photo-requirement-list">{section.photoRequirements.map((photo, index) => <PhotoRequirementCard key={photo.id} photo={photo} index={index} records={records} inspectionId={inspectionId} />)}</div>
    <Link className="photo-back" href={inspectionRoutes.capture(inspectionId)}>بازگشت به نمای کلی</Link>
  </div>;
}
