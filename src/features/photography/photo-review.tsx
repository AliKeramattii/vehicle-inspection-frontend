"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [checks, setChecks] = useState<string[]>([]), [expanded, setExpanded] = useState<"sample" | "user">();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const blob = record?.draft?.blob ?? record?.blob, draft = Boolean(record?.draft), accepted = checks.length === photo.checks.length;
  const dismiss = () => { setExpanded(undefined); requestAnimationFrame(() => trigger.current?.focus()); };
  return <div className="photo-route photo-review"><div className="photography-content"><Link className="photo-back" href={inspectionRoutes.section(inspectionId, section.id)}>بازگشت به {section.title}</Link>
    <div className="photography-title"><h2>بررسی عکس</h2><span>{photo.title}</span></div>
    {!blob ? <div className="photo-empty" role="status"><p>هنوز عکسی برای این نما ثبت نشده است.</p><Link className="photography-primary" href={inspectionRoutes.photo(inspectionId, photo.id, "guide")}>شروع عکاسی</Link></div> : <>
      <div className="photo-review-verdict" data-ready={accepted || !draft}><Icon name={accepted || !draft ? "check" : "info"} size={23} /><div><h3>{accepted ? "کیفیت عکس مناسب است" : draft ? "کیفیت عکس را بررسی کنید" : "عکس ثبت‌شده"}</h3><p>{draft ? "عکس خود را با نمونه مقایسه و موارد زیر را تأیید کنید." : "این تصویر روی دستگاه شما ذخیره شده است."}</p></div></div>
      <div className="photo-comparison"><figure><figcaption>نمونه</figcaption><button aria-label="بزرگ‌نمایی نمونه" onClick={(event) => { trigger.current = event.currentTarget; setExpanded("sample"); }}><PhotoImage src={photo.sampleImage} alt={`نمونه صحیح: ${photo.title}`} eager /></button></figure>
        <figure><figcaption>عکس شما</figcaption><button aria-label="بزرگ‌نمایی عکس شما" onClick={(event) => { trigger.current = event.currentTarget; setExpanded("user"); }}><PhotoImage blob={blob} alt={`عکس شما: ${photo.title}`} eager /></button></figure></div>
      <p className="photo-zoom-hint">برای دیدن جزئیات، روی هر تصویر بزنید.</p>
      {draft && <fieldset className="photo-review-checks"><legend>این موارد را خودتان تأیید کنید</legend>{photo.checks.map((check) => <Checkbox key={check} label={check} checked={checks.includes(check)} onChange={(event) => setChecks((previous) => event.target.checked ? [...previous, check] : previous.filter((value) => value !== check))} />)}</fieldset>}
      {error && <p className="photo-error" role="alert">{error}</p>}
    </>}
  </div>{blob && <BottomStickyCTA className="photography-actions photo-review-actions">{draft ? <PrimaryButton onClick={onConfirm} loading={pending} disabled={!accepted}><Icon name="check" size={21} />تأیید و ذخیره</PrimaryButton> : <Link className="photography-primary" href={inspectionRoutes.section(inspectionId, section.id)}>بازگشت به بخش</Link>}<SecondaryButton onClick={onRetake} disabled={pending}>{draft ? "عکاسی مجدد" : "تعویض عکس"}</SecondaryButton></BottomStickyCTA>}
    {expanded && blob && createPortal(<NativeDialog title={expanded === "sample" ? "نمونه عکاسی" : "عکس شما"} onDismiss={dismiss}><PhotoImage src={photo.sampleImage} blob={expanded === "user" ? blob : undefined} alt={photo.title} eager className="photo-expanded-image" /><SecondaryButton onClick={dismiss}>بستن تصویر</SecondaryButton></NativeDialog>, document.body)}
  </div>;
}
