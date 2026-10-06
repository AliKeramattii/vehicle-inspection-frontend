import { toPersianDigits as fa } from "@/lib/utils/persian";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { photographyProgress, photographyVisualState } from "./photography-model";
import { Icon } from "@/components/ui/icon";
import type { CSSProperties } from "react";

export function PhotographyProgress({ template, records }: { template: PhotographyTemplate; records: readonly LocalPhoto[] }) {
  const { completed, total, percentage } = photographyProgress(template, records);
  const text = `${fa(completed)} از ${fa(total)} تصویر تکمیل شده`;
  const required = template.sections.flatMap((section) => section.photoRequirements).filter((photo) => photo.required);
  return <section className="photography-progress" role="progressbar" aria-label={text} aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}>
    <div className="photography-progress-ring" aria-hidden="true" style={{ "--photography-progress": `${percentage}%` } as CSSProperties}><div><strong>{fa(completed)}</strong><small>از {fa(total)} تصویر</small></div></div>
    <div className="photography-progress-detail"><div className="photography-progress-segments" aria-hidden="true">{required.map((photo) => <span key={photo.id} data-state={photographyVisualState(photo, records)} />)}</div>
      <p><Icon name="storageReady" size={18} /><span>{fa(completed)} تصویر ذخیره‌شده روی دستگاه</span></p><small>عکس بعدی را روی خودرو انتخاب کنید</small>
    </div>
  </section>;
}
