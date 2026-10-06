import Link from "next/link";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { Icon } from "@/components/ui/icon";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { InspectionSection, PhotoRequirement } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { PhotoImage } from "./photo-image";

export function PhotoGuidance({ photo, section, records, inspectionId }: { photo: PhotoRequirement; section: InspectionSection; records: readonly LocalPhoto[]; inspectionId: string }) {
  const record = records.find((item) => item.requirementId === photo.id);
  const reason = record?.status === "retake-requested" ? record.reviewerReason : photo.status === "retake-requested" ? photo.reviewerReason : undefined;
  return <div className="photo-route photography-guide"><div className="photography-content"><Link className="photo-back" href={inspectionRoutes.section(inspectionId, section.id)}>بازگشت به {section.title}</Link>
    <div className="photography-title"><h2>{photo.title}</h2><span>{fa(section.photoRequirements.indexOf(photo) + 1)} از {fa(section.photoRequirements.length)}</span></div>
    {reason && <p className="photo-retake-reason" role="status">نیاز به عکاسی مجدد: {reason}</p>}
    <PhotoImage src={photo.sampleImage} alt={`نمونه صحیح: ${photo.title}`} eager className="photo-guide-image" />
    <h3 className="photo-guide-heading">راهنمای عکاسی</h3><ol className="photo-instructions">{photo.instructions.map((instruction, index) => <li key={instruction}><span aria-hidden="true">{fa(index + 1)}</span>{instruction}</li>)}</ol>
    <dl className="photo-guide-metadata">{photo.distance && <div><dt>فاصله</dt><dd>{photo.distance}</dd></div>}{photo.height && <div><dt>ارتفاع</dt><dd>{photo.height}</dd></div>}</dl>
  </div><BottomStickyCTA className="photography-actions"><Link className="photography-primary" href={inspectionRoutes.photo(inspectionId, photo.id, "camera")}><Icon name="camera" size={23} />باز کردن دوربین</Link></BottomStickyCTA></div>;
}
