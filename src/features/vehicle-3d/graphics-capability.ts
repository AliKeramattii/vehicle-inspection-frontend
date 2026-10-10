import type { CapabilityResult } from "@/features/readiness/capabilities";

/** Optional viewer only. API detection requests no permissions and allocates no context.
 * A driver/allocation failure is handled separately by the scene's fallback boundary. */
export function vehicleGraphicsCapability(webgl2Available: boolean): CapabilityResult {
  return { id: "webgl", status: webgl2Available ? "ready" : "unsupported" };
}
