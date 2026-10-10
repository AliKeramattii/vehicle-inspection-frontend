import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { IranianPlate } from "@/components/vehicle/iranian-plate";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { formatOdometer } from "@/features/capture-package/capture-package-model";
import { toPersianDigits } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { developmentLocationAdapter } from "@/lib/map/location-adapter";
import { UploadPreview } from "@/features/upload/upload-preview";
import type { InspectionSummary } from "./submission-model";

function Heading({ title, href, action = "ویرایش", icon }: { title: string; href: string; action?: string; icon: IconName }) {
  return <div className="summary-section-heading"><h3><Icon name={icon} size={20} />{title}</h3><Link href={href} aria-label={`${action} ${title}`}>{action}<Icon name="edit" size={16} /></Link></div>;
}
export function SummarySections({ summary }: { summary: InspectionSummary }) {
  const id = summary.inspection.id, location = summary.inspection.location, vehicle = summary.inspection.vehicle;
  const photos = summary.jobs.filter((job) => job.evidenceKind === "photo"), duration = summary.videoDurationSeconds;
  return <>
    <section className="summary-section summary-photos">
      <Heading title="تصاویر بازدید" icon="camera" href={inspectionRoutes.capture(id)} action="مشاهده" />
      <p className="summary-count">{toPersianDigits(summary.capture.images.completed)} از {toPersianDigits(summary.capture.images.total)} تصویر تکمیل شده</p>
      <div className="summary-thumbnails" aria-label="پیش‌نمایش تصاویر ثبت‌شده">{photos.map((job) => <Link key={job.id} href={inspectionRoutes.photo(id, job.requirementId!, "review")} aria-label={`مشاهده عکس ${job.title}`}><UploadPreview job={job} /><span>{job.title}</span><Icon name="evidenceCheck" size={15} /></Link>)}</div>
    </section>
    <section className="summary-section">
      <Heading title="موقعیت ثبت‌شده" icon="location" href={inspectionRoutes.location(id)} />
      {location ? <div className="summary-location"><div className="summary-map" role="img" aria-label="پیش‌نمایش موقعیت تأییدشده روی نقشه نمونه"><Image src={developmentLocationAdapter.artwork} alt="" width={800} height={800} unoptimized /><Image src="/icons/location/inspection-pin.svg" alt="" width={26} height={34} unoptimized /></div><div><p>{location.formattedAddress}</p><small>{[location.unitFloor, location.parkingDescription].filter(Boolean).join(" • ")}</small></div></div> : <p>موقعیت هنوز تأیید نشده است.</p>}
    </section>
    <section className="summary-section summary-vehicle">
      <Heading title="مشخصات خودرو" icon="car" href={inspectionRoutes.vehicle(id)} />
      {vehicle ? <><VehicleCard vehicle={vehicle} /><IranianPlate plate={vehicle.plate} /></> : <p>مشخصات خودرو هنوز تأیید نشده است.</p>}
    </section>
    <section className="summary-section summary-odometer">
      <Heading title="کیلومتر فعلی" icon="ignition" href={summary.odometerRequirementId ? inspectionRoutes.photo(id, summary.odometerRequirementId, "review") : inspectionRoutes.photographyReview(id)} />
      <p>{summary.odometer ? `${formatOdometer(summary.odometer.kilometers)} کیلومتر` : "ثبت نشده"}</p>
    </section>
    <section className="summary-section summary-video">
      <Heading title="ویدیوی ۳۶۰ درجه" icon="video" href={inspectionRoutes.video(id, summary.capture.video ? "review" : "record")} action={summary.capture.video ? "مشاهده" : "ثبت"} />
      <p><Icon name={summary.capture.video ? "check" : "info"} size={20} />{summary.capture.video ? "ثبت شده" : "ثبت نشده"}{duration !== undefined && <small>مدت زمان: {toPersianDigits(Math.floor(duration / 60)).padStart(2, "۰")}:{toPersianDigits(Math.floor(duration % 60)).padStart(2, "۰")}</small>}</p>
    </section>
    <section className="summary-section summary-upload">
      <Heading title="آمادگی ارسال" icon="cloud" href={inspectionRoutes.upload(id)} action="مرکز ارسال" />
      <p>{toPersianDigits(summary.upload.uploaded)} از {toPersianDigits(summary.upload.total)} فایل ارسال شده</p>
      {summary.processingCount > 0 && <small>{toPersianDigits(summary.processingCount)} فایل در حال پردازش است؛ پردازش به معنی تأیید نیست.</small>}
      <ul className="summary-checks">{[
        { label: "تصاویر تکمیل شده", ready: summary.capture.images.complete },
        { label: "کیلومتر ثبت شده", ready: summary.capture.odometer },
        { label: "ویدیوی ۳۶۰ درجه ثبت شده", ready: summary.capture.video },
        { label: "فایل‌ها ارسال شده", ready: summary.upload.complete },
      ].map((item) => <li key={item.label} data-ready={item.ready}><Icon name={item.ready ? "check" : "info"} size={18} /><span>{item.label}</span><span className="sr-only">{item.ready ? "تکمیل" : "تکمیل نشده"}</span></li>)}</ul>
    </section>
  </>;
}
