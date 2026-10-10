"use client";
import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { InlineAlert } from "@/components/ui/status";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { toPersianDigits } from "@/lib/utils/persian";
import type { RecordedVideo, VideoRecorderService } from "@/lib/media/video-recorder";
import { useVideoRecording } from "./use-video-recording";
import { VideoOrbit } from "./video-orbit";
export function videoTimer(seconds: number) { return toPersianDigits(`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`); }
export function VideoCapture({ inspectionId, onRecorded, service, reason, backHref, backLabel }: { inspectionId: string; onRecorded: (video: RecordedVideo, signal: AbortSignal) => Promise<void>; service?: VideoRecorderService; reason?: string; backHref?: string; backLabel?: string }) {
  const { preview, state, elapsed, error, canRetrySave, retrySave, stop, start, native } = useVideoRecording(onRecorded, service);
  const recording = state === "recording", busy = state === "opening" || state === "saving";
  return <div className="photo-route camera-screen video-capture" data-recording-state={state}>
    <header className="camera-header"><Link aria-label={backLabel ?? "بازگشت به بررسی بازدید"} href={backHref ?? inspectionRoutes.photographyReview(inspectionId)}><Icon name="close" size={22} /></Link><h2>ویدیوی ۳۶۰ درجه</h2></header>
    <div className="photo-scroll video-capture-content">
      <video ref={preview} className="walkaround-preview" playsInline autoPlay muted aria-label="تصویر زنده ضبط ویدیو" />
      <div className="walkaround-instructions"><h3>آرام دور خودرو حرکت کنید</h3><p>خودرو را در کادر نگه دارید</p>{reason && <p className="video-retake-reason">نیاز به ضبط مجدد: {reason}</p>}</div>
      {error && <InlineAlert className="video-capture-error" tone="warning" role="alert">{error}</InlineAlert>}
      <VideoOrbit progress={recording ? Math.min(100, elapsed / 43 * 100) : 0} />
      <output className="video-timer" aria-label="مدت ضبط" dir="ltr"><span data-active={recording} aria-hidden="true" />{videoTimer(elapsed)}</output>
      <p className="recording-announcement" role="status" aria-live="polite">{recording ? "در حال ضبط" : busy ? state === "saving" ? "در حال ذخیره روی دستگاه…" : "در حال باز کردن دوربین…" : "یک دور کامل و پیوسته دور خودرو ضبط کنید."}</p>
      <ul className="video-instructions"><li><Icon name="stability" size={22} />آرام حرکت کنید</li><li><Icon name="photoFrame" size={22} />دوربین را تراز نگه دارید</li><li><Icon name="photoGlare" size={22} />نور محیط مناسب باشد</li></ul>
      <p className="orbit-explanation">این نمودار فقط راهنمای حرکت است؛ موقعیت یا کیفیت ویدیو اندازه‌گیری نمی‌شود.</p>
    </div>
    <div className="video-capture-actions">
      {canRetrySave ? <SecondaryButton onClick={() => void retrySave()}>تلاش دوباره برای ذخیره</SecondaryButton> : <PrimaryButton className="video-record-button" loading={busy} onClick={() => void (recording ? stop() : start())}><span className={recording ? "record-stop" : "record-dot"} aria-hidden="true" />{recording ? "پایان ضبط" : "شروع ضبط"}</PrimaryButton>}
      {!recording && <label className="video-native">انتخاب/ضبط با دوربین دستگاه<input type="file" accept="video/*" capture="environment" aria-label="انتخاب یا ضبط ویدیو با دوربین دستگاه" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void native(file); }} /></label>}
    </div>
  </div>;
}
