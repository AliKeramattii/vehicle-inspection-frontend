import Link from "next/link";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { Icon } from "@/components/ui/icon";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { PhotographyProgress } from "./photography-progress";
import { SectionRow } from "./section-row";
import { photographyProgress } from "./photography-model";

export function PhotographyCompletion({ template, records, inspectionId }: { template: PhotographyTemplate; records: readonly LocalPhoto[]; inspectionId: string }) {
  const { complete } = photographyProgress(template, records);
  return <div className="photo-route"><div className="photography-content"><Link className="photo-back" href={inspectionRoutes.capture(inspectionId)}>بازگشت به عکاسی</Link><h2 className="photo-completion-title">بررسی و ارسال</h2></div><PhotographyProgress template={template} records={records} />
    <div className="photography-content"><div className="photo-completion-state"><Icon name={complete ? "check" : "info"} size={38} /><h3>{complete ? "عکاسی خودرو تکمیل شد" : "عکاسی هنوز تکمیل نشده است"}</h3><p>پیش از ارسال، می‌توانید عکس‌های هر بخش را بررسی یا تعویض کنید.</p></div>
      {template.sections.map((section) => <SectionRow key={section.id} section={section} records={records} inspectionId={inspectionId} />)}
      <p className="photo-local-note" role="status">عکس‌ها روی این دستگاه ذخیره شده‌اند. ارسال به کارشناس پس از اتصال سرویس ارسال فعال می‌شود.</p>
    </div><BottomStickyCTA className="photography-actions"><Link className="photography-primary" href={inspectionRoutes.capture(inspectionId)}>بازگشت به بازدید</Link></BottomStickyCTA>
  </div>;
}
