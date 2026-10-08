import Link from "next/link";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { toPersianDigits } from "@/lib/utils/persian";
import { capturePackageProgress, formatOdometer, type CapturePackageData } from "./capture-package-model";
export function CapturePackageSummary({ inspectionId, template, records, data }: { inspectionId: string; template: PhotographyTemplate; records: readonly LocalPhoto[]; data?: CapturePackageData }) {
  const progress = capturePackageProgress(template, records, data), odometerId = template.captureRequirements?.odometerRequirementId;
  return <dl className="capture-package-summary" aria-label="نیازمندی‌های بازدید">
    <div><dt>تصاویر</dt><dd>{toPersianDigits(progress.images.completed)} از {toPersianDigits(progress.images.total)}</dd></div>
    {odometerId && <div><dt>کیلومتر</dt><dd>{data?.odometer ? `${formatOdometer(data.odometer.kilometers)} کیلومتر` : "تکمیل نشده"}</dd><Link href={inspectionRoutes.photo(inspectionId, odometerId, "review")}>{data?.odometer ? "ویرایش کیلومتر" : "ثبت کیلومتر فعلی"}</Link></div>}
    {template.captureRequirements?.video360Required && <div><dt>ویدیوی ۳۶۰ درجه</dt><dd>{data?.video360?.state === "retakeRequired" ? "نیاز به ضبط مجدد" : data?.video360?.draft ? "در انتظار تأیید" : data?.video360?.accepted ? "ثبت شده" : progress.images.complete ? "ثبت نشده" : "پس از تکمیل تصاویر"}</dd><Link href={inspectionRoutes.video(inspectionId, data?.video360?.draft || data?.video360?.accepted ? "review" : "record")}>{data?.video360?.draft || data?.video360?.accepted ? "مشاهده ویدیو" : "ضبط ویدیو"}</Link></div>}
  </dl>;
}
