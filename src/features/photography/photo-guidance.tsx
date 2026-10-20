"use client";
import Link from "next/link";
import { useRef } from "react";
import { useIdentificationGuide } from "./use-identification-guide";
import { IdentificationGuideChoice } from "./identification-guide-choice";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { Icon } from "@/components/ui/icon";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { InspectionSection, PhotoRequirement } from "@/schemas/photography";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { PhotoImage, type PhotoFrame } from "./photo-image";
import { GuidanceIcon } from "./guidance-icon";
import { requirementRetakeReason } from "./photography-model";


export function guidanceFrame(photo: PhotoRequirement): PhotoFrame {
  return photo.guidanceTopics?.includes("text") ? "technical-closeup" : photo.guidanceTopics?.some((topic) => topic === "interior" || topic === "ignition") ? "interior-guide" : "exterior-guide";
}

export function PhotoGuidance({ photo: originalPhoto, section, records, inspectionId, navigation, guideScope }: { photo: PhotoRequirement; section: InspectionSection; records: readonly LocalPhoto[]; inspectionId: string; guideScope?: string; navigation?: { backHref: string; backLabel: string; cameraHref: string } }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const selection = useIdentificationGuide(originalPhoto, inspectionId, guideScope);
  const photo = selection.photo;
  const reason = requirementRetakeReason(photo, records);
  return <div className="photo-route photography-guide"><div className="photo-scroll photography-content photo-guide-content"><Link className="photo-back" href={navigation?.backHref ?? inspectionRoutes.section(inspectionId, section.id)}>{navigation?.backLabel ?? `بازگشت به ${section.title}`}</Link>
    <div className="photography-title"><h2 ref={heading} tabIndex={-1}>{photo.title}</h2><span>{fa(section.photoRequirements.findIndex(item => item.id === photo.id) + 1)} از {fa(section.photoRequirements.length)}</span></div>
    {reason && <p className="photo-retake-reason" role="status">نیاز به عکاسی مجدد: {reason}</p>}
    {selection.required && !selection.choice ? <IdentificationGuideChoice onSelect={id => { selection.select(id); requestAnimationFrame(() => heading.current?.focus()); }} /> : <>
    {selection.choice && <div className="identification-selected"><span>{selection.choice.shortTitle}</span><button type="button" onClick={() => selection.select(null)}>تغییر محل کد</button></div>}
    <PhotoImage src={photo.sampleImage} alt={`نمونه صحیح: ${photo.title}`} eager className="photo-guide-image" frame={guidanceFrame(photo)} />
    <section className="photo-guidance-panel"><h3 className="photo-guide-heading">راهنمای عکاسی</h3><ol className="photo-instructions">{photo.instructions.map((instruction, index) => {
      const topic = photo.guidanceTopics?.[index] ?? "frame";
      return <li key={instruction} data-topic={topic}><span aria-hidden="true"><GuidanceIcon topic={topic}/></span>{instruction}</li>;
    })}</ol>
    <dl className="photo-guide-metadata">{photo.distance && <div><dt>فاصله</dt><dd>{photo.distance}</dd></div>}{photo.height && <div><dt>ارتفاع</dt><dd>{photo.height}</dd></div>}</dl></section>
    </>}
  </div>{(!selection.required || selection.choice) && <BottomStickyCTA className="photography-actions"><Link className="photography-primary" href={navigation?.cameraHref ?? inspectionRoutes.photo(inspectionId, photo.id, "camera")}><Icon name="camera" size={23} />باز کردن دوربین</Link></BottomStickyCTA>}</div>;
}
