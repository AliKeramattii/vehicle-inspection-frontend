import type { PhotoRequirement } from "@/schemas/photography";
import type { Point3 } from "./vehicle-view-presets";
// Metres after centring X/Z and placing audited bounds on the studio floor.
// Guide anchors, not mesh-extracted inspection points; no fabricated VIN/odometer positions.
export type VehicleAnchor = { requirementId: PhotoRequirement["id"]; point: Point3; facing: Point3; standing?: Point3; region: string };
export const vehicleAnchors: readonly VehicleAnchor[] = [
  { requirementId: "front-45-right", point: [1.04, .82, -1.55], facing: [1,0,-1], standing: [2.0,.015,-2.6], region: "Door_FR" },
  { requirementId: "front-45-left", point: [-1.04,.82,-1.55], facing: [-1,0,-1], standing: [-2,.015,-2.6], region: "Door_FL" },
  { requirementId: "back-45-right", point: [1.04,.9,1.65], facing: [1,0,1], standing: [2,.015,2.6], region: "Door_RR" },
  { requirementId: "back-45-left", point: [-1.04,.9,1.65], facing: [-1,0,1], standing: [-2,.015,2.6], region: "Door_RL" },
  { requirementId: "front-plate", point: [0,.48,-2.28], facing: [0,0,-1], standing: [0,.015,-3], region: "Bumper_Front" },
  { requirementId: "rear-plate", point: [0,.75,2.28], facing: [0,0,1], standing: [0,.015,3], region: "Bumper_Rear" },
  { requirementId: "car-roof", point: [0,1.68,.25], facing: [0,1,0], region: "Roof" },
  { requirementId: "engine-bay", point: [0,1.05,-1.5], facing: [0,1,-1], region: "Hood_Surface" },
];
export const contextualRequirements = ["driver-interior", "odometer-on", "spec-plate", "chassis-number"] as const;
