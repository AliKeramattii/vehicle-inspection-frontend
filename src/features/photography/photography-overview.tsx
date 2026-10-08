"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { Icon } from "@/components/ui/icon";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotographyTemplate, InspectionSectionId } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { findRequirement, nextIncompleteRequirement, nextRequirement, photoRequirementEntry, photographyProgress, photoSatisfied, requirementStatus, requirementProgress } from "./photography-model";
import { PhotographyProgress } from "./photography-progress";
import { categoryRequirements, photographyCategories, sectionCategory, type PhotographyCategory } from "./vehicle-photo-config";
import { VehiclePhotoNavigator } from "./vehicle-photo-navigator";
import { PhotographyShotCarousel } from "./photography-shot-carousel";
import { nextCaptureTask, type CapturePackageData } from "@/features/capture-package/capture-package-model";

export function PhotographyOverview({ template, records, inspectionId, data }: { template: PhotographyTemplate; records: readonly LocalPhoto[]; inspectionId: string; data?: CapturePackageData }) {
  const router = useRouter();
  const next = nextIncompleteRequirement(template, records), progress = photographyProgress(template, records);
  const [selectedId, select] = useState(next?.photo.id ?? template.sections[0].photoRequirements[0].id);
  const selected = findRequirement(template, selectedId) ?? next ?? { section: template.sections[0], photo: template.sections[0].photoRequirements[0] };
  const { photo, section } = selected, category = sectionCategory(section.id);
  const record = records.find((record) => record.requirementId === photo.id), complete = photoSatisfied(requirementStatus(photo, records));
  const chooseSection = (id: InspectionSectionId) => {
    const target = template.sections.find((section) => section.id === id);
    if (target) select((nextRequirement(target, records) ?? target.photoRequirements[0]).id);
  };
  const chooseCategory = (category: PhotographyCategory) => {
    const photos = categoryRequirements(template, category);
    const target = photos.find((photo) => !photoSatisfied(requirementStatus(photo, records))) ?? photos[0];
    if (target) select(target.id);
  };
  const activateMarker = (id: string) => {
    const target = findRequirement(template, id)?.photo;
    if (!target) return;
    select(target.id);
    router.push(inspectionRoutes.photo(inspectionId, target.id, photoRequirementEntry(target, records).view), { scroll: false });
  };
  const entry = photoRequirementEntry(photo, records), review = entry.view === "review";
  const task = nextCaptureTask(inspectionId, template, records, data);
  const href = progress.complete ? task.href : inspectionRoutes.photo(inspectionId, photo.id, entry.view);
  const label = progress.complete ? task.label : record?.draft ? `ادامه بررسی: ${photo.title}` : complete ? `مشاهده عکس: ${photo.title}` : `عکاسی نمای بعدی: ${photo.title}`;
  return <div className="photo-route photography-overview">
    <div className="photo-scroll photography-overview-content">
    <div className="photography-studio"><PhotographyProgress template={template} records={records} />
      <VehiclePhotoNavigator template={template} photo={photo} sectionId={section.id} records={records} onActivate={activateMarker} onSection={chooseSection} onReset={() => select(next?.photo.id ?? template.sections[0].photoRequirements[0].id)} />
    </div>
    <section className="photography-shot-panel" aria-label="بخش‌ها و عکس‌های بازدید">
      <nav className="photography-categories" aria-label="دسته‌های عکاسی">{photographyCategories.map((item) => {
        const photos = categoryRequirements(template, item.id).filter((photo) => photo.required);
        const { completed, state, attention } = requirementProgress(photos, records);
        return <button key={item.id} type="button" data-state={state} aria-pressed={category === item.id} onClick={() => chooseCategory(item.id)}><Icon name={item.icon} size={23} /><span><strong>{item.title}</strong><small>{fa(completed)} از {fa(photos.length)} تصویر{attention && <span className="category-attention"><Icon name="retake" size={12} /><span className="sr-only">نیاز به بررسی / عکاسی مجدد</span></span>}</small></span></button>;
      })}</nav>
      <div className="photography-selected-heading"><h2>{section.title}</h2><Link href={inspectionRoutes.section(inspectionId, section.id)}>مشاهده بخش<Icon name="chevronBack" size={15} /></Link></div>
      <PhotographyShotCarousel photos={categoryRequirements(template, category)} records={records} selectedId={photo.id} onSelect={select} />
      <Link className="capture-requirements-link" href={inspectionRoutes.photographyReview(inspectionId)}>بررسی نیازمندی‌های بازدید</Link>
    </section>
    </div>
    <BottomStickyCTA className="photography-actions"><Link className="photography-primary" href={href}><Icon name={progress.complete ? "check" : review ? "viewFront" : "camera"} size={23} />{label}</Link></BottomStickyCTA>
  </div>;
}
