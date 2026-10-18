import { Icon } from "@/components/ui/icon";
import { toPersianDigits } from "@/lib/utils/persian";
import { uploadProgress, type UploadJob } from "./upload-model";

export function UploadProgress({ jobs, expected }: { jobs: readonly UploadJob[]; expected: number }) {
  const current = jobs.filter((job) => job.current && job.required);
  const progress = uploadProgress(jobs, expected), photos = current.filter((job) => job.evidenceKind === "photo").length, videos = current.filter((job) => job.evidenceKind === "video-360").length;
  return <section className="upload-overall" aria-label="پیشرفت ارسال فایل‌ها"><div className="upload-ring" role="progressbar" aria-label="فایل‌های ارسال شده" aria-valuemin={0} aria-valuemax={expected} aria-valuenow={progress.uploaded}>
    <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="33" />{progress.percentage > 0 && <circle cx="40" cy="40" r="33" pathLength="100" strokeDasharray={`${progress.percentage} 100`} />}</svg><b>{toPersianDigits(Math.round(progress.percentage))}٪</b>
  </div><div className="upload-overall-copy"><h3><strong>{toPersianDigits(progress.uploaded)}</strong> از {toPersianDigits(expected)} فایل ارسال شده</h3><div className="upload-segments" aria-hidden="true">{Array.from({ length: expected }, (_, index) => <span key={index} data-upload={current[index]?.upload ?? "local"} />)}</div><p>{toPersianDigits(photos)} تصویر • {toPersianDigits(videos)} ویدیوی ۳۶۰ درجه</p><span><Icon name="cloud" size={17} />{toPersianDigits(progress.queued)} در صف • {toPersianDigits(progress.uploading)} در حال ارسال</span></div><dl className="upload-stage-summary" aria-label="وضعیت فایل‌ها">{[{label:"در صف",value:progress.queued},{label:"در حال ارسال",value:progress.uploading},{label:"در حال پردازش",value:progress.processing},{label:"تأیید شد",value:progress.verified},{label:"ناموفق",value:progress.failed},{label:"تلاش مجدد زمان‌بندی شده",value:progress.retryScheduled}].filter(item=>item.value>0).map(item=><div key={item.label}><dt>{item.label}</dt><dd>{toPersianDigits(item.value)}</dd></div>)}</dl><p className="upload-threshold-note">ارسال فایل با تأیید کارشناس متفاوت است.</p></section>;
}
