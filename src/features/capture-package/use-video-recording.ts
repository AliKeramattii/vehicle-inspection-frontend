"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { browserVideoRecorder, readVideoDuration, videoRecordingError, type VideoRecorderService, type VideoRecordingSession, type RecordedVideo } from "@/lib/media/video-recorder";

export type RecordingState = "ready" | "opening" | "recording" | "saving" | "error";
export function useVideoRecording(onRecorded: (video: RecordedVideo, signal: AbortSignal) => Promise<void>, service: VideoRecorderService = browserVideoRecorder) {
  const preview = useRef<HTMLVideoElement>(null), session = useRef<VideoRecordingSession | undefined>(undefined);
  const [state, setState] = useState<RecordingState>("ready"), [error, setError] = useState<string>(), [elapsed, setElapsed] = useState(0);
  const [canRetrySave, setCanRetrySave] = useState(false);
  const generation = useRef(0), mounted = useRef(false), timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const opening = useRef(false);
  const retryVideo = useRef<RecordedVideo | undefined>(undefined);
  const operation = useRef<AbortController | undefined>(undefined);
  const clearTimer = useCallback(() => { clearInterval(timer.current); timer.current = undefined; }, []);
  const release = useCallback(() => { generation.current++; opening.current = false; clearTimer(); operation.current?.abort(); operation.current = undefined; session.current?.dispose(); session.current = undefined; if (preview.current) preview.current.srcObject = null; }, [clearTimer]);
  useEffect(() => {
    mounted.current = true;
    const hidden = () => { if (document.visibilityState === "hidden" && session.current) { release(); setState("error"); setError("ضبط متوقف شد. برای ثبت یک ویدیوی پیوسته دوباره شروع کنید."); } };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", release);
    return () => { mounted.current = false; release(); retryVideo.current = undefined; document.removeEventListener("visibilitychange", hidden); window.removeEventListener("pagehide", release); };
  }, [release]);
  const report = (cause: unknown) => { clearTimer(); if (mounted.current) { setState("error"); setError(videoRecordingError(cause)); } };
  async function save(video: RecordedVideo) {
    release(); retryVideo.current = video; setState("saving"); setError(undefined);
    const controller = new AbortController(); operation.current = controller;
    try { await onRecorded(video, controller.signal); retryVideo.current = undefined; }
    catch (cause) { if (mounted.current) { setCanRetrySave(true); report(cause); } }
  }
  async function start() {
    if (session.current || opening.current) return;
    opening.current = true;
    retryVideo.current = undefined; setCanRetrySave(false); setError(undefined); setElapsed(0); setState("opening"); const token = ++generation.current;
    try {
      const opened = await service.open((error) => { if (generation.current === token && mounted.current) { release(); report(error); } });
      if (!mounted.current || generation.current !== token) { opened.dispose(); return; }
      session.current = opened;
      if (preview.current) { preview.current.srcObject = opened.stream; await preview.current.play(); }
      await opened.start();
      if (!mounted.current || generation.current !== token) { opened.dispose(); return; }
      const started = performance.now(); setState("recording");
      timer.current = setInterval(() => setElapsed(Math.floor((performance.now() - started) / 1000)), 250);
    } catch (cause) { if (mounted.current && generation.current === token) { release(); report(cause); } }
  }
  async function stop() {
    const current = session.current; if (!current) return;
    const token = generation.current; clearTimer(); setState("saving");
    try { const video = await current.stop(); if (mounted.current && token === generation.current) await save(video); }
    catch (cause) { if (mounted.current && token === generation.current) { release(); report(cause); } }
  }
  async function native(file: File) {
    release(); setCanRetrySave(false); setState("saving"); setError(undefined); const token = generation.current;
    try {
      if (!file.type.startsWith("video/") || !file.size || file.size > 250 * 1024 * 1024) throw new Error("یک ویدیوی معتبر با حجم کمتر از ۲۵۰ مگابایت انتخاب کنید.");
      const controller = new AbortController(); operation.current = controller;
      const durationSeconds = await readVideoDuration(file, controller.signal);
      if (mounted.current && token === generation.current) await save({ blob: file, durationSeconds });
    } catch (cause) { if (mounted.current && token === generation.current) report(cause); }
  }
  return { preview, state, error, elapsed, start, stop, native, canRetrySave, retrySave: () => { if (retryVideo.current) return save(retryVideo.current); } };
}
