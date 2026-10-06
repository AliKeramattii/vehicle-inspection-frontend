"use client";

import Link from "next/link";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cameraError, type CameraService } from "@/lib/media/camera-service";
import { validatePhotoBlob } from "@/lib/media/photo-store";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import type { PhotoRequirement } from "@/schemas/photography";
import { useCamera } from "./use-camera";

export function PhotoCamera({ photo, inspectionId, onCapture, service }: { photo: PhotoRequirement; inspectionId: string; onCapture: (blob: Blob) => Promise<void>; service?: CameraService }) {
  const { video, state, retry, take } = useCamera(service);
  const [busy, setBusy] = useState(false), [error, setError] = useState<string>();
  async function save(getBlob: () => Promise<Blob>) {
    setBusy(true); setError(undefined);
    try { const blob = await getBlob(); validatePhotoBlob(blob); await onCapture(blob); }
    catch (cause) { setError(cameraError(cause)); }
    finally { setBusy(false); }
  }
  return <div className="photo-route camera-screen"><header className="camera-header"><Link aria-label="بازگشت به راهنمای عکاسی" href={inspectionRoutes.photo(inspectionId, photo.id, "guide")}><Icon name="close" size={22} /></Link><h2>{photo.title}</h2></header>
    <div className="camera-preview"><video ref={video} playsInline autoPlay muted aria-label="تصویر زنده دوربین" />
      {state.status !== "ready" && <div className="camera-message" role={state.status === "error" ? "alert" : "status"}><Icon name="camera" size={36} /><p>{state.error ?? "در حال باز کردن دوربین…"}</p>{state.status === "error" && <SecondaryButton onClick={retry}>تلاش دوباره</SecondaryButton>}</div>}
      {state.status === "ready" && <div className="camera-frame" aria-hidden="true" />}
    </div>
    <p className="camera-framing-tip">{photo.checks[2]}؛ گوشی را ثابت نگه دارید.</p>
    {error && <p role="alert" className="camera-save-error">{error}</p>}
    <div className="camera-actions"><label className="camera-file">انتخاب عکس<input aria-label="انتخاب عکس از گوشی" type="file" accept="image/*" capture="environment" disabled={busy} onChange={(event) => {
      const file = event.target.files?.[0]; event.target.value = "";
      if (file) void save(async () => { validatePhotoBlob(file); try { const bitmap = await createImageBitmap(file); bitmap.close(); } catch { throw new Error("این فایل تصویر قابل نمایش نیست؛ عکس دیگری انتخاب کنید."); } return file; });
    }} /></label><PrimaryButton className="camera-shutter" aria-label="ثبت عکس" disabled={state.status !== "ready" || busy} loading={busy} onClick={() => void save(take)}><span /></PrimaryButton><Link href={inspectionRoutes.photo(inspectionId, photo.id, "guide")}>راهنما</Link></div>
  </div>;
}
