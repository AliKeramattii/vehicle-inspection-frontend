import Link from "next/link";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { Icon } from "@/components/ui/icon";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { nextSection, photographyProgress } from "./photography-model";
import { PhotoImage } from "./photo-image";
import { PhotographyProgress } from "./photography-progress";
import { SectionRow } from "./section-row";

export function PhotographyOverview({ template, records, inspectionId }: { template: PhotographyTemplate; records: readonly LocalPhoto[]; inspectionId: string }) {
  const next = nextSection(template, records), progress = photographyProgress(template, records);
  const vehiclePhoto = template.sections.find((section) => section.id === "right")?.photoRequirements[0] ?? template.sections[0]?.photoRequirements[0];
  return <div className="photo-route photography-overview"><PhotographyProgress template={template} records={records} />
    <section className="photography-vehicle" aria-label="انتخاب بخش خودرو"><PhotoImage src={vehiclePhoto?.sampleImage} alt="نمای سه‌ربع خودرو برای انتخاب بخش عکاسی" eager />
      <nav aria-label="نماهای خودرو">{template.sections.filter((section) => ["right", "left", "front", "rear", "roof"].includes(section.id)).map((section) => <Link key={section.id} href={inspectionRoutes.section(inspectionId, section.id)}>{section.title}</Link>)}</nav>
    </section>
    <section className="photography-sections"><div className="photography-heading"><h2>بخش‌های عکاسی</h2><span>نمونه هر عکس را ببینید</span></div>
      {template.sections.map((section) => <SectionRow key={section.id} section={section} records={records} inspectionId={inspectionId} current={section.id === next?.id} />)}
    </section>
    <BottomStickyCTA className="photography-actions">{progress.complete ? <Link className="photography-primary" href={inspectionRoutes.photographyReview(inspectionId)}><Icon name="check" size={22} />بررسی و ارسال</Link> : next && <Link className="photography-primary" href={inspectionRoutes.section(inspectionId, next.id)}><Icon name="camera" size={22} />{progress.completed ? "ادامه عکاسی" : "شروع عکاسی"}: {next.title}</Link>}</BottomStickyCTA>
  </div>;
}
