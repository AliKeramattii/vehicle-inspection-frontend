import { selectVideoMime } from "@/lib/media/video-recorder";
import type { CapabilityResult, CapabilityService, CapabilityStatus } from "./capabilities";
/** Queries support/permission only. Never opens camera, requests GPS or creates a WebGL context. */
export function createBrowserCapabilityService(): CapabilityService {
  return { mode: "browser", async check(signal) {
    signal.throwIfAborted();
    const permission = async (name: PermissionName): Promise<CapabilityStatus> => {
      try { const result = await navigator.permissions?.query({ name });
        return result?.state === "granted" ? "ready" : result?.state === "denied" ? "permission-denied" : "permission-required";
      } catch { return "permission-required"; }
    };
    const cameraStatus = window.isSecureContext && typeof navigator.mediaDevices?.getUserMedia === "function" ? await permission("camera" as PermissionName) : "unsupported";
    const camera: CapabilityResult = { id: "camera", status: cameraStatus,
      message: cameraStatus === "permission-denied" ? "دسترسی دوربین مسدود است. در تنظیمات سایت مرورگر، دوربین را مجاز کنید و بررسی دوباره را بزنید." : "دوربین زنده به اتصال امن و مرورگر پشتیبانی‌شده نیاز دارد؛ با HTTPS یا localhost باز کنید." };
    const location: CapabilityResult = { id: "location", status: window.isSecureContext && navigator.geolocation ? await permission("geolocation") : "unsupported",
      message: "موقعیت خودرو در مرحله بعد انتخاب می‌شود؛ انتخاب دستی روی نقشه همیشه در دسترس است." };
    const video: CapabilityResult = { id: "video", status: selectVideoMime(typeof MediaRecorder === "undefined" ? undefined : MediaRecorder) ? "ready" : "unsupported",
      message: "ضبط مستقیم ویدیو در این مرورگر پشتیبانی نمی‌شود؛ با مرورگر به‌روز و پشتیبانی‌شده ادامه دهید." };
    let storage: CapabilityResult = { id: "storage", status: "unknown", message: "فضای آزاد قابل سنجش نیست؛ ذخیره‌سازی هنگام ثبت مدارک بررسی می‌شود." };
    try { const estimate = await navigator.storage?.estimate();
      if (typeof estimate?.quota === "number" && typeof estimate.usage === "number")
        storage = { id: "storage", status: estimate.quota - estimate.usage >= 100 * 1024 * 1024 ? "ready" : "unavailable",
          message: estimate.quota - estimate.usage >= 100 * 1024 * 1024 ? "برآورد فضای آزاد مرورگر؛ تضمین رزرو فضا نیست." : "فضای قابل استفاده مرورگر کمتر از ۱۰۰ مگابایت است؛ فضا را آزاد کنید و بررسی دوباره را بزنید." };
    } catch { /* Capture persistence retains its own truthful failure recovery. */ }
    signal.throwIfAborted();
    return [camera, location, storage, video, { id: "webgl", status: "unsupported" }];
  } };
}
export const browserCapabilityService = createBrowserCapabilityService();
