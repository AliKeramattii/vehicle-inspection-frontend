"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { browserVideoRecorder, videoRecordingError, type CameraFacing, type VideoRecorderService, type VideoRecordingSession, type RecordedVideo } from "@/lib/media/video-recorder";
export type RecordingState = "ready" | "opening" | "armed" | "recording" | "paused" | "saving" | "error";
export function useVideoRecording(onRecorded: (video: RecordedVideo, signal: AbortSignal) => Promise<void>, service: VideoRecorderService = browserVideoRecorder) {
  const preview = useRef<HTMLVideoElement>(null), session = useRef<VideoRecordingSession | undefined>(undefined);
  const [state, setState] = useState<RecordingState>("ready"), [error, setError] = useState<string>(), [elapsed, setElapsed] = useState(0);
  const [canRetrySave, setCanRetrySave] = useState(false), [canPause, setCanPause] = useState(false), [canSwitch, setCanSwitch] = useState(false);
  const generation = useRef(0), mounted = useRef(false), timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const opening = useRef(false), stopping = useRef(false), transitioning = useRef(false), facing = useRef<CameraFacing>("environment");
  const clock = useRef({ active: false, started: 0, accumulated: 0 });
  const retryVideo = useRef<RecordedVideo | undefined>(undefined), operation = useRef<AbortController | undefined>(undefined);
  const clearTimer = useCallback(() => { clearInterval(timer.current); timer.current = undefined; }, []);
  const release = useCallback(() => {
    generation.current++; opening.current = false; stopping.current = false; transitioning.current = false; clearTimer();
    operation.current?.abort(); operation.current = undefined; session.current?.dispose(); session.current = undefined;
    clock.current.active = false; if (preview.current) preview.current.srcObject = null;
  }, [clearTimer]);
  useEffect(() => {
    mounted.current = true;
    const hidden = () => { if (document.visibilityState === "hidden" && session.current) { release(); setState("error"); setError("ضبط متوقف شد. برای ثبت ویدیو دوباره شروع کنید."); } };
    const beforeUnload = (event: BeforeUnloadEvent) => { if (clock.current.active || session.current && session.current.elapsedSeconds?.()) { event.preventDefault(); event.returnValue = ""; } };
    document.addEventListener("visibilitychange", hidden); window.addEventListener("pagehide", release); window.addEventListener("beforeunload", beforeUnload);
    return () => { mounted.current = false; release(); retryVideo.current = undefined; document.removeEventListener("visibilitychange", hidden); window.removeEventListener("pagehide", release); window.removeEventListener("beforeunload", beforeUnload); };
  }, [release]);
  const report = (cause: unknown) => { clearTimer(); if (mounted.current) { setState("error"); setError(videoRecordingError(cause)); } };
  const readElapsed = () => session.current?.elapsedSeconds?.() ?? (clock.current.accumulated + (clock.current.active ? performance.now() - clock.current.started : 0)) / 1000;
  const beginTimer = () => { clearTimer(); timer.current = setInterval(() => { if (mounted.current) setElapsed(Math.floor(readElapsed())); }, 250); };
  async function save(video: RecordedVideo) {
    release(); retryVideo.current = video; setState("saving"); setError(undefined);
    const controller = new AbortController(); operation.current = controller;
    try { await onRecorded(video, controller.signal); retryVideo.current = undefined; }
    catch (cause) { if (mounted.current && !controller.signal.aborted) { setCanRetrySave(true); report(cause); } }
  }
  async function activate() {
    if (session.current || opening.current) return session.current;
    opening.current = true; retryVideo.current = undefined; setCanRetrySave(false); setError(undefined); setElapsed(0); setCanPause(false); setCanSwitch(false);
    clock.current = { active: false, started: 0, accumulated: 0 }; setState("opening"); const token = ++generation.current;
    try {
      const opened = await service.open(error => { if (generation.current === token && mounted.current) { release(); report(error); } }, facing.current);
      if (!mounted.current || generation.current !== token) { opened.dispose(); return; }
      session.current = opened;
      if (preview.current) { preview.current.srcObject = opened.stream; await preview.current.play(); }
      if (!mounted.current || generation.current !== token) { opened.dispose(); return; }
      opening.current = false; setCanPause(Boolean(opened.pause && opened.resume)); setState("armed");
      void navigator.mediaDevices?.enumerateDevices?.().then(devices => { if (mounted.current && generation.current === token) setCanSwitch(devices.filter(device => device.kind === "videoinput").length > 1); }).catch(() => {});
      return opened;
    } catch (cause) { if (mounted.current && generation.current === token) { release(); report(cause); } }
  }
  async function start() {
    if (opening.current || clock.current.active || stopping.current) return;
    const current = session.current ?? await activate(); if (!current || !mounted.current || transitioning.current) return;
    const token = generation.current; transitioning.current = true; setState("opening");
    try {
      await current.start(); if (!mounted.current || generation.current !== token) return;
      clock.current = { active: true, started: performance.now(), accumulated: 0 }; setState("recording"); setCanSwitch(false); beginTimer();
    } catch (cause) { if (mounted.current && generation.current === token) { release(); report(cause); } }
    finally { if (generation.current === token) transitioning.current = false; }
  }
  async function pauseResume() {
    const current = session.current; if (!current?.pause || !current.resume || transitioning.current || stopping.current) return;
    const active = clock.current.active, token = generation.current; transitioning.current = true;
    try {
      await (active ? current.pause() : current.resume()); if (!mounted.current || generation.current !== token) return;
      if (active) { clock.current.accumulated += performance.now() - clock.current.started; clock.current.active = false; clearTimer(); setElapsed(Math.floor(readElapsed())); setState("paused"); }
      else { clock.current.started = performance.now(); clock.current.active = true; beginTimer(); setState("recording"); }
    } catch (cause) { if (mounted.current && generation.current === token) { release(); report(cause); } }
    finally { if (generation.current === token) transitioning.current = false; }
  }
  async function stop() {
    const current = session.current; if (!current || stopping.current || transitioning.current) return;
    stopping.current = true; const token = generation.current; clearTimer(); setState("saving");
    try { const video = await current.stop(); if (mounted.current && token === generation.current) await save(video); }
    catch (cause) { if (mounted.current && token === generation.current) { release(); report(cause); } }
  }
  async function switchCamera() {
    if (state !== "armed" || !canSwitch || opening.current) return;
    facing.current = facing.current === "environment" ? "user" : "environment"; release(); await activate();
  }
  return { preview, state, error, elapsed, start, activate, stop, canPause, canSwitch, switchCamera, pauseResume, discard: release, canRetrySave, retrySave: () => { if (retryVideo.current) return save(retryVideo.current); } };
}
