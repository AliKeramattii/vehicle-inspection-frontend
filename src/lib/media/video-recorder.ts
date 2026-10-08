import { browserCameraService, type CameraService } from "./camera-service";

export const videoMimeCandidates = ["video/webm;codecs=vp8", "video/mp4", "video/webm", "video/webm;codecs=vp9"] as const;
export function selectVideoMime(recorder: Pick<typeof MediaRecorder, "isTypeSupported"> | undefined): string | undefined {
  return recorder && typeof recorder.isTypeSupported === "function" ? videoMimeCandidates.find((mime) => recorder.isTypeSupported(mime)) : undefined;
}
export type RecordedVideo = { blob: Blob; durationSeconds: number };
export interface VideoRecordingSession {
  stream: MediaStream; mimeType: string;
  start(): Promise<void>; stop(): Promise<RecordedVideo>; dispose(): void;
}
export interface VideoRecorderService { open(onFailure: (error: Error) => void): Promise<VideoRecordingSession> }
export function videoRecordingError(cause: unknown): string {
  const name = typeof cause === "object" && cause !== null && "name" in cause ? cause.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "دسترسی دوربین داده نشد. دسترسی مرورگر را بررسی کنید یا از دوربین دستگاه برای ضبط ویدیو استفاده کنید.";
  if (name === "NotFoundError" || name === "NotReadableError") return "دوربین در دسترس نیست یا در برنامه دیگری استفاده می‌شود. از انتخاب/ضبط با دوربین دستگاه استفاده کنید.";
  return cause instanceof Error ? cause.message : "ضبط ویدیو ممکن نشد. دوباره تلاش کنید یا از دوربین دستگاه استفاده کنید.";
}
/** Event-driven lifecycle: final dataavailable precedes stop; no React component owns a recorder. */
export function createVideoRecorderService(camera: CameraService = browserCameraService, now: () => number = () => performance.now()): VideoRecorderService {
  return { async open(onFailure) {
    const mimeType = selectVideoMime(typeof MediaRecorder === "undefined" ? undefined : MediaRecorder);
    if (!mimeType) throw new Error("ضبط مستقیم ویدیو در این مرورگر پشتیبانی نمی‌شود. از دوربین دستگاه استفاده کنید.");
    if (camera === browserCameraService && !navigator.mediaDevices?.getUserMedia) throw new Error("ضبط مستقیم ویدیو به اتصال امن نیاز دارد. از انتخاب/ضبط با دوربین دستگاه استفاده کنید.");
    const stream = await camera.open(); let recorder: MediaRecorder;
    try { recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 }); }
    catch (error) { camera.stop(stream); throw error; }
    let released = false, started = 0, bytes = 0, disposed = false;
    let resolveStart: (() => void) | undefined, rejectStart: ((error: Error) => void) | undefined;
    let resolveResult!: (video: RecordedVideo) => void, rejectResult!: (error: Error) => void;
    const chunks: Blob[] = [];
    const result = new Promise<RecordedVideo>((resolve, reject) => { resolveResult = resolve; rejectResult = reject; });
    // Record-time failure may precede a stop caller; it must not create an unhandled rejection.
    void result.catch(() => {});
    const release = () => { if (!released) { released = true; camera.stop(stream); } };
    const cancelRecorder = () => { try { if (recorder.state !== "inactive") recorder.stop(); } catch { /* Track release still runs if the browser has already stopped recording. */ } };
    const detach = () => { recorder.onstart = null; recorder.ondataavailable = null; recorder.onstop = null; recorder.onerror = null; };
    const fail = (error: Error) => {
      if (disposed) return;
      disposed = true; detach();
      cancelRecorder();
      release(); chunks.length = 0; rejectStart?.(error); rejectResult(error); onFailure(error);
    };
    recorder.onstart = () => { started = now(); resolveStart?.(); };
    recorder.ondataavailable = (event) => { if (!disposed && event.data.size) { bytes += event.data.size; if (bytes > 250 * 1024 * 1024) fail(new Error("حجم ویدیو بیش از ۲۵۰ مگابایت شد؛ یک ویدیوی کوتاه‌تر ضبط کنید.")); else chunks.push(event.data); } };
    recorder.onerror = () => fail(new Error("ضبط ویدیو متوقف شد. دوباره تلاش کنید یا از دوربین دستگاه استفاده کنید."));
    recorder.onstop = () => {
      if (disposed) return;
      const durationSeconds = Math.max(0, (now() - started) / 1000);
      const actualType = chunks[0]?.type || recorder.mimeType || mimeType;
      const blob = new Blob(chunks, { type: actualType }); chunks.length = 0; detach(); release();
      if (!blob.size || !durationSeconds) { rejectResult(new Error("ویدیو ثبت نشد؛ ضبط را دوباره شروع کنید.")); return; }
      resolveResult({ blob, durationSeconds });
    };
    return { stream, mimeType,
      start() { return new Promise<void>((resolve, reject) => { resolveStart = resolve; rejectStart = reject; try { recorder.start(1000); } catch { fail(new Error("شروع ضبط ممکن نشد. از دوربین دستگاه استفاده کنید.")); } }); },
      stop() { if (recorder.state !== "inactive") recorder.stop(); return result; },
      dispose() { if (disposed) return; disposed = true; detach(); cancelRecorder(); release(); chunks.length = 0; const error = new Error("ضبط لغو شد."); rejectStart?.(error); rejectResult(error); },
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
