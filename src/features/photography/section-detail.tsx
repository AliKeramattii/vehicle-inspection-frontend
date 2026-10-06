import Link from "next/link";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { InspectionSection } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { sectionProgress } from "./photography-model";
import { PhotoRequirementCard } from "./photo-requirement-card";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { nextIncompleteRequirement, nextRequirement } from "./photography-model";
import type { PhotographyTemplate } from "@/schemas/photography";

export function SectionDetail({ section, template, records, inspectionId }: { section: InspectionSection; template: PhotographyTemplate; records: readonly LocalPhoto[]; inspectionId: string }) {
  const { completed, total, remaining } = sectionProgress(section, records);
  const nextPhoto = nextRequirement(section, records), next = nextIncompleteRequirement(template, records);
  const href = nextPhoto ? inspectionRoutes.photo(inspectionId, nextPhoto.id, "guide") : next ? inspectionRoutes.photo(inspectionId, next.photo.id, "guide") : inspectionRoutes.photographyReview(inspectionId);
  const label = nextPhoto ? `عکاسی نمای بعدی: ${nextPhoto.title}` : next ? `ادامه به ${next.section.title}` : "بررسی و ارسال";
  return <div className="photo-route photography-section"><div className="photography-content photo-section-header"><Link className="photo-back" href={inspectionRoutes.capture(inspectionId)}>بازگشت به نمای کلی</Link>
    <div className="photography-title"><h2>{section.title}</h2><span>{fa(completed)} از {fa(total)} تصویر</span></div>
    {!remaining && <div className="section-complete" role="status">✓ {section.title} تکمیل شد</div>}
    </div><div className="photo-scroll photography-content photo-requirement-list">{section.photoRequirements.map((photo, index) => <PhotoRequirementCard key={photo.id} photo={photo} index={index} records={records} inspectionId={inspectionId} />)}</div>
    <BottomStickyCTA className="photography-actions"><Link className="photography-primary" href={href}>{label}</Link></BottomStickyCTA>
  </div>;
}
