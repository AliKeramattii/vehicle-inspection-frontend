export type VehicleQuality = "mobile" | "desktop" | "reduced" | "original";
export const vehicleModelConfig = {
  source: "Kia sportage GT line 2023 — 3D Cars Studio", license: "CC BY-NC-SA 4.0", commercialCleared: false,
  defaultPaint: "#e8edf2", maxDpr: 1.5,
} as const;
export function modelVariant(quality: VehicleQuality) { return quality === "reduced" ? "mobile" : quality; }
export function adaptiveQuality(width: number, memory?: number): VehicleQuality { return memory !== undefined && memory <= 4 ? "reduced" : width >= 1024 ? "desktop" : "mobile"; }
/** Semantic aliases for the original hierarchy; optimized nodes retain source paths as extras. */
export function vehicleSemanticAlias(path: string, center?: readonly number[]): string {
  if (/19inch|Wheels_/i.test(path)) return center ? `Wheel_${center[2]<0?"F":"R"}${center[0]<0?"L":"R"}` : "Wheels";
  const door = path.match(/Door_(FL|FR|RL|RR)/i); if (door) return `Door_${door[1].toUpperCase()}`;
  if (/frontlight/i.test(path)) return "Lights_Front";
  if (/rearlight/i.test(path)) return "Lights_Rear";
  if (/frontbumper|lowergrill|frontgrill/i.test(path)) return "Bumper_Front";
  if (/rearbumper/i.test(path)) return "Bumper_Rear";
  if (/carpaint__front/i.test(path)) return "Hood_Surface";
  if (/roof/i.test(path)) return "Roof";
  if (/steeringwheel/i.test(path)) return "Interior_Steering";
  if (/dash|display/i.test(path)) return "Interior_Dashboard";
  if (/seats/i.test(path)) return "Interior_Seats";
  if (/carpaint/i.test(path)) return "Body_Main";
  return "Trim";
}
