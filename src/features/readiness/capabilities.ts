export const capabilityIds = ["camera", "location", "webgl", "storage", "video"] as const;
export type CapabilityId = typeof capabilityIds[number];
export type CapabilityStatus = "checking" | "ready" | "unavailable" | "permission-required" | "unsupported" | "unknown";
export type CapabilityResult = { id: CapabilityId; status: CapabilityStatus; message?: string };
export interface CapabilityService {
  readonly mode: "mock" | "browser";
  check(signal: AbortSignal): Promise<readonly CapabilityResult[]>;
}
export const capabilityStatusLabels: Record<CapabilityStatus, string> = {
  unknown: "بررسی هنگام ثبت", checking: "در حال بررسی", ready: "آماده", unavailable: "در دسترس نیست",
  "permission-required": "نیاز به اجازه", unsupported: "پشتیبانی نمی‌شود",
};
export const capabilityDefinitions = [
  { id: "camera", label: "دوربین", icon: "cameraReady" },
  { id: "location", label: "موقعیت مکانی", icon: "gpsReady" },
  { id: "webgl", label: "نمایش سه‌بعدی", icon: "webglReady" },
  { id: "storage", label: "فضای ذخیره‌سازی", icon: "storageReady" },
  { id: "video", label: "ضبط ویدیوی ۳۶۰ درجه", icon: "cameraReady" },
] as const;
export const customerCapabilityDefinitions = capabilityDefinitions.filter(({ id }) => id !== "webgl");
export function initialCapabilities(): CapabilityResult[] {
  return capabilityIds.map((id) => ({ id, status: "checking" }));
}
export function normalizeCapabilities(results: readonly CapabilityResult[]): CapabilityResult[] {
  return capabilityIds.map((id) => results.find((result) => result.id === id) ?? { id, status: "unavailable" });
}
export function canContinueReadiness(results: readonly CapabilityResult[]): boolean {
  const normalized = normalizeCapabilities(results);
  return normalized.filter(({ id }) => id !== "webgl" && id !== "location").every(({ status }) => status !== "checking" &&
    status !== "unavailable" && status !== "unsupported");
}
// Diagnostic only: these fixtures do not grant camera/GPS permission, reserve
// storage, or create a WebGL context. A browser adapter can implement this interface.
export function createMockCapabilityService(overrides: Partial<Record<CapabilityId, CapabilityStatus>> = {}): CapabilityService {
  return { mode: "mock", async check(signal) {
    signal.throwIfAborted();
    return capabilityIds.map((id) => ({ id, status: overrides[id] ?? "ready" }));
  } };
}
