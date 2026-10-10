import type { PhotoRequirement } from "@/schemas/photography";
export type VehicleView = "front" | "rear" | "left" | "right" | "top" | "front-right" | "front-left" | "rear-right" | "rear-left";
export type Point3 = readonly [number, number, number];
// Audited glTF world coordinates: +Y up, front -Z, physical left -X, right +X.
export const vehicleViewPresets: Record<VehicleView, Point3> = {
  front: [0, 1.8, -5.5], rear: [0, 1.8, 5.5], left: [-6.9, 2, 0], right: [6.9, 2, 0], top: [0, 8.4, .01],
  "front-right": [3.9, 2.4, -5], "front-left": [-3.9, 2.4, -5], "rear-right": [3.9, 2.4, 5], "rear-left": [-3.9, 2.4, 5],
};
export function requirementView(id: PhotoRequirement["id"]): VehicleView {
  const views: Record<string, VehicleView> = { "front-45-right": "front-right", "front-45-left": "front-left", "back-45-right": "rear-right", "back-45-left": "rear-left", "front-plate": "front", "rear-plate": "rear", "car-roof": "top", "engine-bay": "front" };
  return views[id] ?? "front-right";
}
