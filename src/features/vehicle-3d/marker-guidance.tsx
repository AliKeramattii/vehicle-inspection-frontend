"use client";
import { useEffect, useRef } from "react";
import { PrimaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PhotoImage } from "@/features/photography/photo-image";
import { photoRequirementEntry } from "@/features/photography/photography-model";
import type { PhotoRequirement } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import type { markerEvidence } from "./marker-state";
export function MarkerGuidance({ photo, records, evidence, onActivate, onDismiss }: { photo: PhotoRequirement; records: readonly LocalPhoto[]; evidence: ReturnType<typeof markerEvidence>; onActivate: () => void; onDismiss: () => void }) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => { panel.current?.scrollIntoView({ block: "nearest", behavior: "instant" }); }, [photo.id]);
  const review = photoRequirementEntry(photo, records).view === "review";
  return <section ref={panel} className="marker-guidance" aria-label={"راهنمای " + photo.title}>
    <header><h3>{photo.title}</h3><button type="button" onClick={onDismiss} aria-label="بستن راهنمای نمای انتخاب‌شده"><Icon name="close" size={20}/></button></header>
    <PhotoImage src={photo.sampleImage} alt={"نمونه عکاسی: " + photo.title} frame="exterior-guide" />
    <p>{photo.description}</p><ul>{photo.instructions.slice(0, 3).map(text => <li key={text}>{text}</li>)}</ul>
    <p className="marker-upload-status">ثبت عکس: {evidence.captureComplete ? "تکمیل شده" : "تکمیل نشده"} • ارسال: {evidence.upload}</p>
    {evidence.reason && <p className="marker-attention">نیاز به بررسی: {evidence.reason}</p>}
    <PrimaryButton onClick={onActivate}><Icon name={review ? "viewFront" : "camera"} size={20}/>{review ? "مشاهده عکس ثبت‌شده" : "گرفتن عکس"}</PrimaryButton>
    {review && <p className="marker-guidance-note">برای جایگزینی، ابتدا عکس فعلی را بررسی کنید؛ نسخه پذیرفته‌شده محفوظ می‌ماند.</p>}
  </section>;
}
