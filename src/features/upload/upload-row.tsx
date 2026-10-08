import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SecondaryButton } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { uploadLabel, type UploadJob } from "./upload-model";
import { UploadPreview } from "./upload-preview";

export function UploadRow({ job, retry }: { job: UploadJob; retry: () => void }) {
  const percentage = Math.floor(job.bytesUploaded / job.byteSize * 100), label = uploadLabel(job);
  const tone = job.verification === "retake-requested" ? "attention" : job.upload === "failed" ? "failed" : job.verification === "verified" || job.upload === "uploaded" && job.verification !== "processing" ? "success" : job.upload === "uploading" || job.verification === "processing" ? "active" : "queued";
  const icon = tone === "success" ? "check" : tone === "failed" ? "error" : tone === "attention" ? "warning" : tone === "queued" ? "clock" : "cloud";
  const reviewHref = job.requirementId ? inspectionRoutes.photo(job.inspectionId, job.requirementId, "review") : inspectionRoutes.video(job.inspectionId, "review");
  return <li className="upload-row" data-job={job.id} data-kind={job.evidenceKind} data-upload={job.upload} data-verification={job.verification}>
    <UploadPreview job={job} /><div className="upload-row-content"><Link className="upload-title" href={reviewHref}>{job.title}</Link><span className="upload-kind">{job.evidenceKind === "photo" ? "تصویر" : "ویدیو"}</span>
      {job.upload === "uploading" ? <div className="upload-transfer"><span>{label} <b>{toPersianDigits(percentage)}٪</b></span><div className="upload-track" role="progressbar" aria-label={`ارسال ${job.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><span style={{ width: `${percentage}%` }} /></div></div> : <span className="upload-status" data-tone={tone}><Icon name={icon} size={17} />{label}</span>}
      {job.lastError && <p className="upload-error">{job.lastError}</p>}{job.reviewerReason && <p className="upload-error">{job.reviewerReason}</p>}
    </div>{job.upload === "failed" && job.retryable ? <SecondaryButton className="upload-retry" aria-label={`تلاش مجدد برای ${job.title}`} onClick={retry}><Icon name="resetView" size={18} /></SecondaryButton> : <Link className="upload-detail" aria-label={`مشاهده ${job.title}`} href={reviewHref}><Icon name="chevronForward" size={18} /></Link>}
  </li>;
}
