import { selectVideoMime } from "@/lib/media/video-recorder";
import type { CapabilityResult, CapabilityService, CapabilityStatus } from "./capabilities";
/** Queries support/permission only. Never opens camera, requests GPS or creates a WebGL context. */
export function createBrowserCapabilityService(): CapabilityService {
  return { mode: "browser", async check(signal) {
    signal.throwIfAborted();
    const permission = async (name: PermissionName): Promise<CapabilityStatus> => {
      try { const result = await navigator.permissions?.query({ name });
        return result?.state === "granted" ? "ready" : result?.state === "denied" ? "unavailable" : "permission-required";
      } catch { return "permission-required"; }
    };
    const camera: CapabilityResult = { id: "camera", status: window.isSecureContext && typeof navigator.mediaDevices?.getUserMedia === "function" ? await permission("camera" as PermissionName) : "unsupported" };
    const location: CapabilityResult = { id: "location", status: window.isSecureContext && navigator.geolocation ? await permission("geolocation") : "unsupported",
      message: "موقعیت خودرو در مرحله بعد انتخاب می‌شود؛ انتخاب دستی روی نقشه همیشه در دسترس است." };
    const video: CapabilityResult = { id: "video", status: selectVideoMime(typeof MediaRecorder === "undefined" ? undefined : MediaRecorder) ? "ready" : "unsupported",
      message: "پشتیبانی ضبط بررسی می‌شود؛ این وضعیت به معنی ثبت ویدیو نیست." };
    let storage: CapabilityResult = { id: "storage", status: "unknown", message: "فضای آزاد قابل سنجش نیست؛ ذخیره‌سازی هنگام ثبت مدارک بررسی می‌شود." };
    try { const estimate = await navigator.storage?.estimate();
      if (typeof estimate?.quota === "number" && typeof estimate.usage === "number")
        storage = { id: "storage", status: estimate.quota - estimate.usage >= 100 * 1024 * 1024 ? "ready" : "unavailable",
          message: "برآورد فضای آزاد مرورگر؛ تضمین رزرو فضا نیست." };
    } catch { /* Capture persistence retains its own truthful failure recovery. */ }
    signal.throwIfAborted();
    return [camera, location, storage, video, { id: "webgl", status: "unsupported" }];
  } };
}
export const browserCapabilityService = createBrowserCapabilityService();
