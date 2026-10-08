"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { Icon } from "@/components/ui/icon";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { PhotographyProgress } from "./photography-progress";
import { SectionRow } from "./section-row";
import { photographyProgress } from "./photography-model";
import { capturePackageProgress, nextCaptureTask, type CapturePackageData } from "@/features/capture-package/capture-package-model";
import { CapturePackageSummary } from "@/features/capture-package/capture-package-summary";
import { PrimaryButton } from "@/components/ui/button";

export function PhotographyCompletion({ template, records, inspectionId, data }: { template: PhotographyTemplate; records: readonly LocalPhoto[]; inspectionId: string; data?: CapturePackageData }) {
  const { complete } = photographyProgress(template, records);
  const packageProgress = capturePackageProgress(template, records, data), task = nextCaptureTask(inspectionId, template, records, data);
  const router = useRouter();
  return <div className="photo-route"><div className="photography-content"><Link className="photo-back" href={inspectionRoutes.capture(inspectionId)}>بازگشت به عکاسی</Link><h2 className="photo-completion-title">بررسی و ارسال</h2></div><PhotographyProgress template={template} records={records} />
    <div className="photo-scroll photography-content"><div className="photo-completion-state"><Icon name={complete ? "check" : "info"} size={38} /><h3>{complete ? "عکاسی خودرو تکمیل شد" : "عکاسی هنوز تکمیل نشده است"}</h3><p>پیش از ارسال، می‌توانید عکس‌های هر بخش را بررسی یا تعویض کنید.</p></div>
      <CapturePackageSummary inspectionId={inspectionId} template={template} records={records} data={data} />
      {template.sections.map((section) => <SectionRow key={section.id} section={section} records={records} inspectionId={inspectionId} />)}
      <p className="photo-local-note" role="status">فایل‌ها روی این دستگاه محفوظ هستند. وضعیت ارسال را در مرکز ارسال فایل‌ها دنبال کنید.</p>
    </div><BottomStickyCTA className="photography-actions"><div className="capture-package-actions">{!packageProgress.complete && <Link className="photography-primary" href={task.href}>{task.label}</Link>}<PrimaryButton disabled={!packageProgress.complete} onClick={() => router.push(inspectionRoutes.upload(inspectionId))}>ادامه به ارسال</PrimaryButton></div></BottomStickyCTA>
  </div>;
}
