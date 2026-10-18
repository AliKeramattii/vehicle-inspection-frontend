"use client";

import Link from "next/link";
import { useIdentificationGuide } from "./use-identification-guide";
import { IdentificationGuideChoice } from "./identification-guide-choice";
import { PhotoAlignmentGuide, photoAlignmentView } from "./photo-alignment-guide";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { InlineAlert } from "@/components/ui/status";
import { cameraError, type CameraService } from "@/lib/media/camera-service";
import { validatePhotoBlob } from "@/lib/media/photo-store";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotoRequirement } from "@/schemas/photography";
import { useCamera } from "./use-camera";

type PhotoCameraProps = { photo: PhotoRequirement; inspectionId: string; onCapture: (blob: Blob) => Promise<void>; service?: CameraService; guideHref?: string; reviewerReason?: string; guideScope?: string };
export function PhotoCamera(props: PhotoCameraProps) {
  const selection = useIdentificationGuide(props.photo, props.inspectionId, props.guideScope);
  if (selection.required && !selection.choice) return <div className="photo-route"><div className="photo-scroll photography-content"><Link className="photo-back" href={props.guideHref ?? inspectionRoutes.photo(props.inspectionId, props.photo.id, "guide")}>بازگشت به راهنمای عکاسی</Link><h2>{props.photo.title}</h2><IdentificationGuideChoice onSelect={selection.select} /></div></div>;
  return <LivePhotoCamera {...props} photo={selection.photo} />;
}
function LivePhotoCamera({ photo, inspectionId, onCapture, service, guideHref, reviewerReason }: PhotoCameraProps) {
  const { video, state, retry, take } = useCamera(service);
  const [showAlignment, setShowAlignment] = useState(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string>();
  async function save(getBlob: () => Promise<Blob>) {
    setBusy(true); setError(undefined);
    try { const blob = await getBlob(); validatePhotoBlob(blob); await onCapture(blob); }
    catch (cause) { setError(cameraError(cause)); }
    finally { setBusy(false); }
  }
  const guide = guideHref ?? inspectionRoutes.photo(inspectionId, photo.id, "guide");
  return <div className="photo-route camera-screen"><header className="camera-header"><Link aria-label="بازگشت به راهنمای عکاسی" href={guide}><Icon name="close" size={22} /></Link><h2>{photo.title}</h2></header>
    {reviewerReason && <p className="additional-camera-reason" role="status">کارشناس: {reviewerReason}</p>}
    <div className="camera-preview"><video ref={video} playsInline autoPlay muted aria-label="تصویر زنده دوربین" />
      {state.status !== "ready" && <div className="camera-message" role={state.status === "error" ? "alert" : "status"}><Icon name="camera" size={36} />{state.status === "error" ? <InlineAlert tone="warning" role="presentation" className="camera-alert">{state.error}</InlineAlert> : <p>در حال باز کردن دوربین…</p>}{state.status === "error" && <SecondaryButton onClick={retry}>تلاش دوباره</SecondaryButton>}</div>}
      {state.status === "ready" && <>{showAlignment && <PhotoAlignmentGuide photo={photo} />}<div className="camera-frame" aria-hidden="true" /></>}
    </div>
    {photoAlignmentView(photo) && <button className="photo-alignment-toggle" type="button" aria-pressed={showAlignment} onClick={() => setShowAlignment(value => !value)}>راهنمای قاب‌بندی {showAlignment ? "روشن" : "خاموش"}</button>}
    <p className="camera-framing-tip">{photo.checks[2]}؛ گوشی را ثابت نگه دارید.</p>
    {error && <InlineAlert tone="destructive" className="camera-save-error">{error}</InlineAlert>}
    <div className="camera-actions"><SecondaryButton className="camera-retry" disabled={busy} onClick={retry}>دوربین</SecondaryButton><PrimaryButton className="camera-shutter" aria-label="ثبت عکس" disabled={state.status !== "ready" || busy} loading={busy} onClick={() => void save(take)}><span /></PrimaryButton><Link href={guide}>راهنما</Link></div>
  </div>;
}
