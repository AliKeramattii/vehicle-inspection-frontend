"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pause, Play, Square, Camera, SwitchCamera, CircleHelp, X } from "lucide-react";
import { WalkaroundGuidance } from "./walkaround-guidance";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { NativeDialog } from "@/components/ui/native-dialog";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import type { RecordedVideo, VideoRecorderService } from "@/lib/media/video-recorder";
import { useVideoRecording } from "./use-video-recording";
import { defaultRecordingTargetSeconds, recordingProgress } from "./recording-guides";
import "./recorder-v2.css";
export function videoTimer(seconds: number) { return fa(`${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`); }
export function VideoCapture({ inspectionId, onRecorded, service, reason, backHref, backLabel, targetDurationSeconds = defaultRecordingTargetSeconds }: { inspectionId: string; onRecorded: (video: RecordedVideo, signal: AbortSignal) => Promise<void>; service?: VideoRecorderService; reason?: string; backHref?: string; backLabel?: string; targetDurationSeconds?: number }) {
  const recording = useVideoRecording(onRecorded, service), router = useRouter();
  const { preview, state, elapsed, error, canRetrySave, retrySave, stop, start, activate, canPause, canSwitch, switchCamera, pauseResume } = recording;
  const [guide, setGuide] = useState(false), [leaving, setLeaving] = useState(false);
  const active = state === "recording", paused = state === "paused", inProgress = active || paused, busy = state === "opening" || state === "saving";
  const progress = recordingProgress(elapsed, targetDurationSeconds);
  const href = backHref ?? inspectionRoutes.photographyReview(inspectionId);
  const status = active ? progress >= 100 ? "زمان پیشنهادی کامل شد؛ می‌توانید ادامه دهید" : "در حال ضبط ویدیو" : paused ? "ضبط موقتاً متوقف است" : state === "armed" ? "دوربین آماده ضبط است" : state === "saving" ? "در حال ذخیره روی دستگاه…" : state === "opening" ? "در حال باز کردن دوربین…" : error ? "ضبط انجام نشد" : "آماده ضبط ویدیو";
  return <div className="photo-route camera-screen video-capture video-capture-v2" data-recording-state={state}>
    <header className="recorder-header">
      <Link aria-label={backLabel ?? "بازگشت به بررسی بازدید"} href={href} onClick={event => { if (inProgress || busy) { event.preventDefault(); setLeaving(true); } }}><X size={24}/></Link>
      <div><small>بازدید خودرو</small><h2>ویدیوی ۳۶۰ درجه</h2></div>
      <button type="button" aria-label="راهنمای ضبط ویدیو" onClick={() => setGuide(true)}><CircleHelp size={23}/></button>
    </header>
    <div className="photo-scroll recorder-content">
      <div className="recorder-intro"><p>ثبت تصویر بدنه خودرو</p><h3>یک دور کامل اطراف خودرو حرکت کنید</h3><span>خودرو را در کادر نگه دارید؛ چرخاندن گوشی درجا کافی نیست.</span></div>
      <section className="recorder-stage" aria-label="پیش‌نمایش زنده و راهنمای قاب‌بندی">
        <div className="recorder-stage-toolbar"><span className="recorder-state-chip" data-active={active}>{active && <span aria-hidden="true"/>}{active ? "در حال ضبط" : paused ? "مکث" : state === "armed" ? "دوربین روشن" : "پیش‌نمایش دوربین"}</span>
          {state === "armed" && canSwitch && <button type="button" aria-label="تعویض دوربین" onClick={() => void switchCamera()}><SwitchCamera size={22}/></button>}
        </div>
        <div className="recorder-live">
          <video ref={preview} playsInline autoPlay muted aria-label="تصویر زنده ضبط ویدیو" />
          {["ready","error"].includes(state) && <div className="recorder-camera-placeholder"><Camera size={30}/><p>{error ? "دوربین در دسترس نیست" : "دوربین پس از انتخاب شما فعال می‌شود"}</p></div>}
          <div className="recorder-corners" aria-hidden="true"/>
        </div>
      </section>
      <section className="recorder-time-row">
        <div className="recorder-status"><h3 role="status" aria-live="polite">{status}</h3><p>پیشرفت زمانی ضبط</p><small>تأیید پوشش کامل خودرو انجام نشده است.</small></div>
        <div className="recorder-time-ring" data-error={Boolean(error)}>
          <svg viewBox="0 0 100 100" role="progressbar" aria-label="پیشرفت زمان پیشنهادی ضبط" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><circle cx="50" cy="50" r="44" className="recorder-ring-track"/><circle cx="50" cy="50" r="44" className="recorder-ring-value" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress}/></svg>
          <div><output aria-label="مدت ضبط" aria-live="off" dir="ltr">{videoTimer(elapsed)}</output><small>{fa(Math.floor(progress))}٪ زمان پیشنهادی</small></div>
        </div>
      </section>
      {error && <InlineAlert tone="warning" role="alert">{error}</InlineAlert>}
      {reason && <InlineAlert tone="warning">نیاز به ضبط مجدد: {reason}</InlineAlert>}
      <div className="recorder-tips"><h3>نکات تصویربرداری</h3><p>حرکت آهسته، نور کافی و فاصله ثابت با خودرو</p><span>راهنمای حرکت را پیش از شروع ببینید؛ راهنما روی ویدیوی شما قرار نمی‌گیرد.</span></div>
    </div>
    <div className="recorder-actions">
      {canRetrySave ? <PrimaryButton onClick={() => void retrySave()}>تلاش دوباره برای ذخیره</PrimaryButton> : inProgress ? <>
        <PrimaryButton className="recorder-stop" onClick={() => void stop()}><Square size={20}/>پایان ضبط</PrimaryButton>
        {canPause && <SecondaryButton onClick={() => void pauseResume()}>{paused ? <Play size={20}/> : <Pause size={20}/>} {paused ? "ادامه ضبط" : "مکث ضبط"}</SecondaryButton>}
      </> : <PrimaryButton loading={busy} onClick={() => void (state === "armed" ? start() : activate())}>{state === "armed" ? <><span className="recorder-dot"/>شروع ضبط</> : error ? "تلاش مجدد برای فعال‌سازی دوربین" : <><Camera size={21}/>فعال کردن دوربین</>}</PrimaryButton>}
    </div>
    {guide && <WalkaroundGuidance onDismiss={() => setGuide(false)}/>}
    {leaving && <NativeDialog title="خروج از ضبط ویدیو؟" onDismiss={() => setLeaving(false)}><p>ضبط فعلی ذخیره نشده است. ویدیوی قبلی محفوظ می‌ماند.</p><div className="recorder-exit-actions"><SecondaryButton onClick={() => setLeaving(false)}>ادامه ضبط</SecondaryButton><PrimaryButton onClick={() => { recording.discard(); router.push(href); }}>خروج و کنار گذاشتن ضبط</PrimaryButton></div></NativeDialog>}
  </div>;
}
