import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotoRequirement } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { photoSatisfied, photoStatusLabels, requirementStatus } from "./photography-model";
import { PhotoImage } from "./photo-image";

export function PhotoRequirementCard({ photo, index, records, inspectionId }: { photo: PhotoRequirement; index: number; records: readonly LocalPhoto[]; inspectionId: string }) {
  const record = records.find((item) => item.requirementId === photo.id), status = requirementStatus(photo, records), complete = photoSatisfied(status), retake = status === "retake-requested";
  return <article className="photo-requirement-card" data-state={retake ? "retake" : complete ? "complete" : "pending"}>
    <header><span aria-hidden="true">{complete ? "✓" : fa(index + 1)}</span><h3>{photo.title}</h3><small>{record?.draft ? "در انتظار تأیید" : photoStatusLabels[status]}</small></header>
    <PhotoImage src={photo.sampleImage} blob={record?.draft?.blob ?? (complete ? record?.blob : undefined)} alt={record?.draft ? `عکس در انتظار تأیید: ${photo.title}` : complete ? `عکس ثبت‌شده: ${photo.title}` : `نمونه صحیح: ${photo.title}`} eager />
    <div className="photo-card-copy"><p>{photo.description}</p>{retake && <p className="photo-retake-reason"><Icon name="warning" size={18} />{record?.reviewerReason ?? photo.reviewerReason ?? "این تصویر نیاز به عکاسی مجدد دارد."}</p>}
      <div className="photo-card-actions">{record?.draft ? <><Link className="photography-primary" href={inspectionRoutes.photo(inspectionId, photo.id, "review")}>ادامه بررسی عکس</Link><Link href={inspectionRoutes.photo(inspectionId, photo.id, "guide")}>عکاسی مجدد</Link></> : complete ? <><Link href={inspectionRoutes.photo(inspectionId, photo.id, "review")}>مشاهده</Link><Link href={inspectionRoutes.photo(inspectionId, photo.id, "guide")}>تعویض عکس</Link></> : <Link className="photography-primary" href={inspectionRoutes.photo(inspectionId, photo.id, "guide")}><Icon name="camera" size={20} />{retake ? "عکاسی مجدد" : "شروع عکاسی"}</Link>}</div>
    </div>
  </article>;
}
