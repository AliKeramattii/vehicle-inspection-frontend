import {defaultVideoProfile,videoCaptureConstraints,type VideoRecordingProfile,type VideoCaptureMetadata} from "./video-profiles";
import { browserCameraService, type CameraService } from "./camera-service";
export const videoMimeCandidates = ["video/webm;codecs=vp8", "video/mp4", "video/webm", "video/webm;codecs=vp9"] as const;
export function selectVideoMime(recorder: Pick<typeof MediaRecorder, "isTypeSupported"> | undefined): string | undefined {
  return recorder && typeof recorder.isTypeSupported === "function" ? videoMimeCandidates.find(mime => recorder.isTypeSupported(mime)) : undefined;
}
export type RecordedVideo = { blob: Blob; durationSeconds: number; capture?: VideoCaptureMetadata };
export type CameraFacing = "user" | "environment";
export interface VideoRecordingSession {
  stream: MediaStream; mimeType: string;
  start(): Promise<void>; stop(): Promise<RecordedVideo>; dispose(): void;
  pause?(): Promise<void>; resume?(): Promise<void>; elapsedSeconds?(): number;
}
export interface VideoRecorderService { open(onFailure: (error: Error) => void, facing?: CameraFacing): Promise<VideoRecordingSession> }
export function videoRecordingError(cause: unknown): string {
  const name = typeof cause === "object" && cause !== null && "name" in cause ? cause.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "دسترسی دوربین برای ضبط ویدیو داده نشد. مجوز مرورگر را بررسی کنید و دوباره تلاش کنید.";
  if (name === "NotFoundError" || name === "NotReadableError") return "دوربین در دسترس نیست یا در برنامه دیگری استفاده می‌شود. با HTTPS و مرورگر پشتیبانی‌شده دوباره تلاش کنید.";
  return cause instanceof Error ? cause.message : "ضبط ویدیو ممکن نشد. دوباره تلاش کنید یا مرورگر پشتیبانی‌شده را بررسی کنید.";
}
/** Owns one stream and recorder; duration counts recording events only, never paused time. */
export function createVideoRecorderService(camera: CameraService = browserCameraService, now: () => number = () => performance.now(), profile: VideoRecordingProfile = defaultVideoProfile): VideoRecorderService {
  return { async open(onFailure, facing = "environment") {
    let mimeType = selectVideoMime(typeof MediaRecorder === "undefined" ? undefined : MediaRecorder);
    if (!mimeType) throw new Error("ضبط مستقیم ویدیو در این مرورگر پشتیبانی نمی‌شود. مرورگر پشتیبانی‌شده را بررسی کنید.");
    const supported=navigator.mediaDevices?.getSupportedConstraints?.() ?? {width:true,height:true};
    const stream = await camera.open(facing,videoCaptureConstraints(profile,supported)); let recorder!: MediaRecorder;
    try {
      // A positive capability hint is not a guarantee the constructor will accept that codec.
      for(const candidate of videoMimeCandidates.filter(value=>MediaRecorder.isTypeSupported(value))){
        try{recorder=new MediaRecorder(stream,{mimeType:candidate,videoBitsPerSecond:profile.videoBitsPerSecond});mimeType=recorder.mimeType||candidate;break;}
        catch(error){if(!(error instanceof DOMException)||error.name!=="NotSupportedError")throw error;}
      }
      if(!recorder)throw new Error("این مرورگر قالب ضبط قابل استفاده‌ای ندارد؛ با مرورگر پشتیبانی‌شده دوباره تلاش کنید.");
    } catch (error) { camera.stop(stream); throw error; }
    let released = false, disposed = false, activeStart: number | undefined, activeMs = 0, bytes = 0, stopping = false;
    let resolveStart: (() => void) | undefined, rejectStart: ((error: Error) => void) | undefined;
    let resolveTransition: (() => void) | undefined, rejectTransition: ((error: Error) => void) | undefined;
    let resolveResult!: (video: RecordedVideo) => void, rejectResult!: (error: Error) => void;
    const chunks: Blob[] = [], result = new Promise<RecordedVideo>((resolve, reject) => { resolveResult = resolve; rejectResult = reject; });
    void result.catch(() => {});
    const elapsedSeconds = () => Math.max(0, (activeMs + (activeStart === undefined ? 0 : now() - activeStart)) / 1000);
    const freeze = () => { if (activeStart !== undefined) { activeMs += now() - activeStart; activeStart = undefined; } };
    const tracks = stream.getVideoTracks?.() ?? [];
    const release = () => { if (!released) { released = true; tracks.forEach(track => track.removeEventListener?.("ended", ended)); camera.stop(stream); } };
    const cancelRecorder = () => { try { if (recorder.state !== "inactive") recorder.stop(); } catch { /* Track release still runs. */ } };
    const detach = () => { recorder.onstart = null; recorder.ondataavailable = null; recorder.onstop = null; recorder.onerror = null; recorder.onpause = null; recorder.onresume = null; };
    const fail = (error: Error) => {
      if (disposed) return; disposed = true; freeze(); detach(); cancelRecorder(); release(); chunks.length = 0;
      rejectStart?.(error); rejectTransition?.(error); rejectResult(error); onFailure(error);
    };
    const ended = () => fail(new Error("اتصال دوربین قطع شد؛ ویدیوی ناقص کنار گذاشته شد. دوباره ضبط کنید."));
    tracks.forEach(track => track.addEventListener?.("ended", ended));
    recorder.onstart = () => { activeStart = now(); resolveStart?.(); };
    recorder.onpause = () => { freeze(); resolveTransition?.(); resolveTransition = undefined; rejectTransition = undefined; };
    recorder.onresume = () => { activeStart = now(); resolveTransition?.(); resolveTransition = undefined; rejectTransition = undefined; };
    recorder.ondataavailable = event => {
      if (!disposed && event.data.size) { bytes += event.data.size; if (bytes > 250 * 1024 * 1024) fail(new Error("حجم ویدیو بیش از ۲۵۰ مگابایت شد؛ یک ویدیوی کوتاه‌تر ضبط کنید.")); else chunks.push(event.data); }
    };
    recorder.onerror = () => fail(new Error("ضبط ویدیو متوقف شد. دوباره تلاش کنید یا مرورگر پشتیبانی‌شده را بررسی کنید."));
    recorder.onstop = () => {
      if (disposed) return; freeze();
      const durationSeconds = elapsedSeconds(), actualType = chunks[0]?.type || recorder.mimeType || mimeType;
      const blob = new Blob(chunks, { type: actualType }), settings=tracks[0]?.getSettings?.(); chunks.length = 0; detach(); release(); disposed = true;
      if (!blob.size || !durationSeconds) { rejectResult(new Error("ویدیو ثبت نشد؛ ضبط را دوباره شروع کنید.")); return; }
      const actual:VideoCaptureMetadata["actual"]={mimeType:actualType};
      if(settings?.width)actual.width=settings.width;if(settings?.height)actual.height=settings.height;if(settings?.frameRate)actual.frameRate=settings.frameRate;
      if(Number.isFinite(recorder.videoBitsPerSecond)&&recorder.videoBitsPerSecond>0)actual.videoBitsPerSecond=recorder.videoBitsPerSecond;
      const {id:profileId,...requested}=profile;
      resolveResult({ blob, durationSeconds, capture:{profileId,requested,actual} });
    };
    const transition = (kind: "pause" | "resume") => new Promise<void>((resolve, reject) => {
      if (disposed || stopping || resolveTransition) { reject(new Error("وضعیت ضبط تغییر کرده است.")); return; }
      resolveTransition = resolve; rejectTransition = reject;
      try { recorder[kind](); } catch { fail(new Error("تغییر وضعیت ضبط ممکن نشد. دوباره ضبط کنید.")); }
    });
    return { stream, mimeType, elapsedSeconds,
      start() { return new Promise<void>((resolve, reject) => { resolveStart = resolve; rejectStart = reject; try { recorder.start(1000); } catch { fail(new Error("شروع ضبط ممکن نشد. مرورگر پشتیبانی‌شده را بررسی کنید.")); } }); },
      ...(typeof recorder.pause === "function" && typeof recorder.resume === "function" ? { pause: () => transition("pause"), resume: () => transition("resume") } : {}),
      stop() { if (!stopping && !disposed) { stopping = true; freeze(); try { if (recorder.state !== "inactive") recorder.stop(); } catch { fail(new Error("پایان ضبط ممکن نشد. دوباره ضبط کنید.")); } } return result; },
      dispose() { if (disposed) return; disposed = true; freeze(); detach(); cancelRecorder(); release(); chunks.length = 0; const error = new Error("ضبط لغو شد."); rejectStart?.(error); rejectTransition?.(error); rejectResult(error); },
    };
  } };
}
export const browserVideoRecorder = createVideoRecorderService();
export function readVideoDuration(blob: Blob, signal?: AbortSignal): Promise<number> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
    const video = document.createElement("video"), url = URL.createObjectURL(blob);
    const aborted = () => { cleanup(); reject(new DOMException("Cancelled", "AbortError")); };
    const cleanup = () => { clearTimeout(timeout); signal?.removeEventListener("abort", aborted); video.onloadedmetadata = null; video.onerror = null; video.removeAttribute("src"); video.load(); URL.revokeObjectURL(url); };
    const timeout = setTimeout(() => { cleanup(); reject(new Error("خواندن مدت ویدیو ممکن نشد؛ فایل دیگری انتخاب کنید.")); }, 8000);
    video.preload = "metadata";
    signal?.addEventListener("abort", aborted, { once: true });
    video.onloadedmetadata = () => { const duration = video.duration; cleanup(); if (Number.isFinite(duration) && duration > 0) resolve(duration); else reject(new Error("مدت ویدیو معتبر نیست. با دوربین دستگاه دوباره ضبط کنید.")); };
    video.onerror = () => { cleanup(); reject(new Error("این فایل ویدیو قابل پخش نیست؛ فایل دیگری انتخاب کنید.")); };
    video.src = url;
  });
}
