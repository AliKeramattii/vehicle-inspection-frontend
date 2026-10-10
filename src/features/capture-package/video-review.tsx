"use client";
import { useState } from "react";
import Link from "next/link";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { useBlobUrl } from "@/features/photography/photo-image";
import type { LocalVideo360 } from "./capture-package-model";
import { videoTimer } from "./video-capture";
export function VideoReview({ inspectionId, video, onConfirm, onRetake, pending, error, navigation }: { inspectionId: string; video?: LocalVideo360; onConfirm: () => void; onRetake: () => void; pending?: boolean; error?: string; navigation?: { backHref: string; backLabel: string; recordHref: string } }) {
  const evidence = video?.draft ?? video?.accepted, url = useBlobUrl(evidence?.blob);
  const [failed, setFailed] = useState(false), [ratio, setRatio] = useState(4 / 3);
  return <div className="photo-route photo-review video-review"><div className="photo-scroll photography-content">
    <Link className="photo-back" href={navigation?.backHref ?? inspectionRoutes.photographyReview(inspectionId)}>{navigation?.backLabel ?? "بازگشت به بررسی بازدید"}</Link>
    <div className="photography-title"><h2>بررسی ویدیو</h2><span>ویدیوی ۳۶۰ درجه</span></div>
    {video?.reviewerReason && <InlineAlert tone="warning">نیاز به ضبط مجدد: {video.reviewerReason}</InlineAlert>}
    {evidence ? <><video className="walkaround-review" src={url} controls playsInline preload="metadata" style={{ aspectRatio: ratio }} aria-label="ویدیوی ثبت‌شده دور خودرو" onLoadedMetadata={(event) => { const { videoWidth, videoHeight } = event.currentTarget; if (videoWidth && videoHeight) setRatio(videoWidth / videoHeight); }} onError={() => setFailed(true)} />
      {failed && <InlineAlert tone="warning">پخش ویدیو ممکن نشد. ویدیوی ذخیره‌شده محفوظ است؛ دوباره ضبط کنید یا فایل دیگری انتخاب کنید.</InlineAlert>}
      <dl className="video-metadata"><div><dt>مدت ویدیو</dt><dd dir="ltr">{videoTimer(evidence.durationSeconds)}</dd></div><div><dt>وضعیت</dt><dd>{video?.draft ? "در انتظار تأیید" : video?.state === "retakeRequired" ? "نیاز به ضبط مجدد" : "ذخیره‌شده روی دستگاه"}</dd></div></dl>
      {video?.accepted && video.draft && <p className="photo-local-note">ویدیوی قبلی تا تأیید این جایگزین محفوظ است.</p>}
      <p className="photo-review-note">ویدیو را پخش کنید و مطمئن شوید یک دور پیوسته از خودرو ثبت شده است. ارسال هنوز انجام نشده است.</p></> : <div className="photo-empty"><p>هنوز ویدیویی ثبت نشده است.</p><Link className="photography-primary" href={navigation?.recordHref ?? inspectionRoutes.video(inspectionId, "record")}>شروع ضبط</Link></div>}
    {error && <InlineAlert tone="destructive" className="photo-error">{error}</InlineAlert>}
  </div>{evidence && <BottomStickyCTA className="photography-actions photo-review-actions">{video?.draft ? <PrimaryButton onClick={onConfirm} loading={pending}>تأیید و ذخیره</PrimaryButton> : <Link className="photography-primary" href={navigation?.backHref ?? inspectionRoutes.photographyReview(inspectionId)}>{navigation?.backLabel ?? "بازگشت به بررسی بازدید"}</Link>}<SecondaryButton onClick={onRetake} disabled={pending}>ضبط مجدد</SecondaryButton></BottomStickyCTA>}</div>;
}
