"use client";

import { useEffect, useRef, useState } from "react";
import { browserCameraService, cameraError, type CameraService } from "@/lib/media/camera-service";

export function useCamera(service: CameraService = browserCameraService) {
  const video = useRef<HTMLVideoElement>(null), [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: "opening" | "ready" | "error"; error?: string }>({ status: "opening" });
  useEffect(() => {
    let cancelled = false, stream: MediaStream | undefined;
    const element = video.current;
    const stop = () => { if (stream) service.stop(stream); if (element) element.srcObject = null; };
    const hidden = () => { if (document.visibilityState === "hidden") { cancelled = true; stop(); setState({ status: "error", error: "دوربین متوقف شد؛ برای ادامه دوباره فعال کنید." }); } };
    document.addEventListener("visibilitychange", hidden);
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setState({ status: "opening" });
      try {
        const opened = await service.open();
        if (cancelled) { service.stop(opened); return; }
        stream = opened;
        if (element) { element.srcObject = stream; await element.play(); }
        if (!cancelled) setState({ status: "ready" });
      } catch (error) { stop(); if (!cancelled) setState({ status: "error", error: cameraError(error) }); }
    });
    return () => { cancelled = true; stop(); document.removeEventListener("visibilitychange", hidden); };
  }, [attempt, service]);
  return { video, state, retry: () => setAttempt((value) => value + 1), take: () => video.current ? service.capture(video.current) : Promise.reject(new Error("دوربین آماده نیست.")) };
}
