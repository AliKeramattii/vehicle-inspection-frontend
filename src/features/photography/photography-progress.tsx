import { toPersianDigits as fa } from "@/lib/utils/persian";
import type { PhotographyTemplate } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { photographyProgress } from "./photography-model";

export function PhotographyProgress({ template, records }: { template: PhotographyTemplate; records: readonly LocalPhoto[] }) {
  const { completed, total, percentage } = photographyProgress(template, records);
  const text = `${fa(completed)} از ${fa(total)} تصویر تکمیل شده`;
  return <section className="photography-progress" aria-label="پیشرفت عکاسی"><div><strong>{text}</strong><span>ذخیره روی دستگاه</span></div>
    <div role="progressbar" aria-label={text} aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}><span style={{ width: `${percentage}%` }} /></div>
  </section>;
}
