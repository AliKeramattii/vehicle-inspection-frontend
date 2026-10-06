import { nodeAnchors, type VehicleNode, type Vector3Tuple } from "./semantic-nodes";

export const vehicleViews = ["front-left", "front", "right", "rear", "left", "top", "front-right", "rear-left", "rear-right", "cabin", "engine"] as const;
export type VehicleView = typeof vehicleViews[number];
export const viewConfig: Record<VehicleView, { label: string; camera: Vector3Tuple; standing: Vector3Tuple; icon: string }> = {
  "front-left": { label: "جلو ۴۵° چپ", camera: [5.8, 3.9, 7.4], standing: [1.7, .02, 2.05], icon: "car-front-45-left" },
  front: { label: "جلو", camera: [0, 3, 8.4], standing: [0, .02, 3.3], icon: "car-front" },
  right: { label: "راست", camera: [-8.1, 2.9, 0], standing: [-2.8, .02, 0], icon: "car-side-right" },
  rear: { label: "عقب", camera: [0, 3, -8.4], standing: [0, .02, -3.3], icon: "car-rear" },
  left: { label: "چپ", camera: [8.1, 2.9, 0], standing: [2.8, .02, 0], icon: "car-side-left" },
  top: { label: "بالا", camera: [0, 9.8, .01], standing: [2.8, .02, 0], icon: "car-top" },
  "front-right": { label: "جلو ۴۵° راست", camera: [-5.8, 3.9, 7.4], standing: [-2.2, .02, 3.2], icon: "car-front-45-right" },
  "rear-left": { label: "عقب ۴۵° چپ", camera: [5.8, 3.9, -7.4], standing: [2.2, .02, -3.2], icon: "car-rear-45-left" },
  "rear-right": { label: "عقب ۴۵° راست", camera: [-5.8, 3.9, -7.4], standing: [-2.2, .02, -3.2], icon: "car-rear-45-right" },
  cabin: { label: "کابین", camera: [5.8, 5.6, 6.5], standing: [2.8, .02, .4], icon: "car-interior" },
  engine: { label: "موتور", camera: [3.8, 6.5, 7.4], standing: [0, .02, 3.3], icon: "hood-open" },
};
export const viewerDirections = ["top", "rear", "right", "front", "left"] as const;
export function resolveVehicleView(value?: string): VehicleView {
  return vehicleViews.find((view) => view === value) ?? "front-left";
}
export type VehicleModelSource = { kind: "development" } | { kind: "glb"; url: string };
export const productionVehicleModels = { mobile: "/vehicle/models/inspection-suv-mobile.glb", desktop: "/vehicle/models/inspection-suv-desktop.glb" } as const;
export const developmentVehicleModel: VehicleModelSource = { kind: "development" };

// Each 2D view is an honest schematic projection, never a mirrored physical photo.
export function projectFallbackAnchor(node: VehicleNode, view: VehicleView): [number, number] {
  const [x, y, z] = nodeAnchors[node];
  if (view === "top") return [50 + x * 24, 48 - z * 14];
  if (view === "front" || view === "rear") return [50 + x * (view === "front" ? 26 : -26), 88 - y * 28];
  const right = view === "right" || view === "front-right" || view === "rear-right";
  return [50 + z * (right ? 14 : -14), 88 - y * 28];
}
