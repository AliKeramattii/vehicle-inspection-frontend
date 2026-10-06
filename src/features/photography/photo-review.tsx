"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { NativeDialog } from "@/components/ui/native-dialog";
import { Icon } from "@/components/ui/icon";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotoRequirement, InspectionSection } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { PhotoImage } from "./photo-image";

export function PhotoReview({ photo, section, record, inspectionId, onConfirm, onRetake, pending, error }: {
  photo: PhotoRequirement; section: InspectionSection; record?: LocalPhoto; inspectionId: string;
  onConfirm: () => void; onRetake: () => void; pending?: boolean; error?: string;
}) {
  const [expanded, setExpanded] = useState<"sample" | "user">();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const blob = record?.draft?.blob ?? record?.blob, draft = Boolean(record?.draft);
  const dismiss = () => { setExpanded(undefined); requestAnimationFrame(() => trigger.current?.focus()); };
  return <div className="photo-route photo-review"><div className="photo-scroll photography-content photo-review-content"><Link className="photo-back" href={inspectionRoutes.section(inspectionId, section.id)}>بازگشت به {section.title}</Link>
    <div className="photography-title"><h2>بررسی عکس</h2><span>{photo.title}</span></div>
    {!blob ? <div className="photo-empty" role="status"><p>هنوز عکسی برای این نما ثبت نشده است.</p><Link className="photography-primary" href={inspectionRoutes.photo(inspectionId, photo.id, "guide")}>شروع عکاسی</Link></div> : <>
      <figure className="photo-review-capture"><figcaption>عکس شما <span>برای بزرگ‌نمایی، روی تصویر بزنید</span></figcaption>
        <button aria-label="بزرگ‌نمایی عکس شما" onClick={(event) => { trigger.current = event.currentTarget; setExpanded("user"); }}><PhotoImage blob={blob} alt={`عکس شما: ${photo.title}`} eager /></button>
      </figure>
      <button className="photo-review-reference" aria-label="بزرگ‌نمایی نمونه" onClick={(event) => { trigger.current = event.currentTarget; setExpanded("sample"); }}><PhotoImage src={photo.sampleImage} alt={`نمونه صحیح: ${photo.title}`} eager /><span><strong>نمونه</strong><small>قاب‌بندی عکس را با نمونه مقایسه کنید.</small></span><Icon name="viewFront" size={20} /></button>
      <p className="photo-review-note">{draft ? "برای نگه‌داشتن این عکس، تأیید و ادامه را بزنید." : "عکس ثبت‌شده روی این دستگاه ذخیره شده است."}</p>
      {error && <p className="photo-error" role="alert">{error}</p>}
    </>}
  </div>{blob && <BottomStickyCTA className="photography-actions photo-review-actions">{draft ? <PrimaryButton onClick={onConfirm} loading={pending}><Icon name="check" size={21} />تأیید و ادامه</PrimaryButton> : <Link className="photography-primary" href={inspectionRoutes.section(inspectionId, section.id)}>بازگشت به بخش</Link>}<SecondaryButton onClick={onRetake} disabled={pending}>عکاسی مجدد</SecondaryButton></BottomStickyCTA>}
    {expanded && blob && createPortal(<NativeDialog title={expanded === "sample" ? "نمونه عکاسی" : "عکس شما"} onDismiss={dismiss}><PhotoImage src={photo.sampleImage} blob={expanded === "user" ? blob : undefined} alt={photo.title} eager className="photo-expanded-image" /><SecondaryButton onClick={dismiss}>بستن تصویر</SecondaryButton></NativeDialog>, document.body)}
  </div>;
}
