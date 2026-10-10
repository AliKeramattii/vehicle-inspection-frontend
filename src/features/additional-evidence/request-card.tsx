import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SecondaryButton } from "@/components/ui/button";
import { PhotoImage } from "@/features/photography/photo-image";
import { guidanceFrame } from "@/features/photography/photo-guidance";
import { uploadLabel, type UploadJob } from "@/features/upload/upload-model";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { type EvidenceRequest, type EvidenceRequestItem, requestTitle, itemHref } from "./request-model";

export function RequestCard({ request, item, captured, draft, job, retry }: { request: EvidenceRequest; item: EvidenceRequestItem; captured: boolean; draft: boolean; job?: UploadJob; retry: () => void }) {
  const photo = item.kind === "photo" ? request.template.sections.flatMap((section) => section.photoRequirements).find((photo) => photo.id === item.requirementId) : undefined;
  const label = draft ? item.kind === "photo" ? "در انتظار تأیید عکس جدید" : "در انتظار تأیید ویدیوی جدید" : job ? uploadLabel(job) : captured ? "ذخیره‌شده روی دستگاه" : item.kind === "photo" ? "نیاز به عکاسی مجدد" : "نیاز به ضبط مجدد";
  const attention = draft || !captured || job?.upload === "failed" || job?.verification === "retake-requested";
  return <li className="additional-card" data-item={item.id} data-captured={captured}>
    <div className="additional-card-content"><h3>{requestTitle(request, item)}</h3><p className="additional-item-status" data-tone={attention ? "attention" : "complete"}><Icon name={attention ? "warning" : "check"} size={17} />{label}</p>
      <div className="additional-reason"><span>کارشناس:</span><p>{item.reviewerReason}</p></div>
      {job?.upload === "uploading" && <div className="additional-transfer" role="progressbar" aria-label={`ارسال ${requestTitle(request, item)}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(job.bytesUploaded / job.byteSize * 100)}><span style={{ width: `${job.bytesUploaded / job.byteSize * 100}%` }} /><b>{fa(Math.floor(job.bytesUploaded / job.byteSize * 100))}٪</b></div>}
      {job?.lastError && <p className="additional-upload-error">{job.lastError}</p>}
      {job?.upload === "failed" && job.retryable ? <SecondaryButton aria-label={`تلاش مجدد برای ${requestTitle(request, item)}`} onClick={retry}>تلاش مجدد</SecondaryButton> : <Link className="photography-primary" href={itemHref(request, item, captured || draft ? "review" : "capture")}><Icon name={item.kind === "photo" ? "camera" : "video"} size={20} />{captured || draft ? "بررسی مدرک جدید" : item.kind === "photo" ? "عکاسی مجدد" : "ضبط مجدد"}</Link>}
    </div><figure className="additional-card-sample">{photo ? <PhotoImage src={photo.sampleImage} alt={`نمونه صحیح: ${photo.title}`} frame={guidanceFrame(photo)} sizes="140px" eager /> : <div className="additional-video-art"><Icon name="video" size={42} /><span>یک دور پیوسته دور خودرو</span></div>}<figcaption>{photo ? "نمونه عکاسی" : "ویدیوی ۳۶۰ درجه"}</figcaption></figure>
  </li>;
}
