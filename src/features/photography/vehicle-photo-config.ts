import type { IconName } from "@/components/ui/icon";
import type { InspectionSectionId, PhotographyTemplate } from "@/schemas/photography";

export type PhotographyCategory = "body" | "cabin" | "details";
export const photographyCategories: { id: PhotographyCategory; title: string; icon: IconName }[] = [
  { id: "body", title: "بدنه", icon: "carFront" }, { id: "cabin", title: "کابین", icon: "cabin" }, { id: "details", title: "موتور و مشخصات", icon: "engine" },
];
export function sectionCategory(id: InspectionSectionId): PhotographyCategory { return id === "cabin" ? "cabin" : id === "engine-details" ? "details" : "body"; }
export function categoryRequirements(template: PhotographyTemplate, category: PhotographyCategory) {
  return template.sections.filter((section) => sectionCategory(section.id) === category).flatMap((section) => section.photoRequirements);
}
export const vehiclePhotoControls: { sectionId: InspectionSectionId; title: string; icon: IconName }[] = [
  { sectionId: "roof", title: "بالا", icon: "viewTop" }, { sectionId: "rear", title: "عقب", icon: "viewRear" },
  { sectionId: "right", title: "راست", icon: "viewRight" }, { sectionId: "front", title: "جلو", icon: "viewFront" },
  { sectionId: "left", title: "چپ", icon: "viewLeft" },
];
export type VehiclePhotoMarker = { requirementId: string; x: number; y: number };
export type VehiclePhotoArtwork = { aspectRatio: number; markers: readonly VehiclePhotoMarker[] };
const marker = (requirementId: string, x: number, y: number): VehiclePhotoMarker => ({ requirementId, x, y });
// Percentages belong to the original artwork, not the viewport. The image and markers share
// the same contained artwork layer. Never mirror an image or swap physical vehicle left/right.
const vehiclePhotoArtwork: Record<string, VehiclePhotoArtwork> = {
  "front-45-right": { aspectRatio: 3 / 2, markers: [marker("front-45-right", 58, 57), marker("back-45-right", 75, 58), marker("front-plate", 23, 65), marker("car-roof", 62, 22)] },
  "back-45-right": { aspectRatio: 4 / 3, markers: [marker("back-45-right", 43, 57), marker("front-45-right", 74, 56), marker("rear-plate", 21, 62), marker("car-roof", 54, 20)] },
  "front-45-left": { aspectRatio: 3 / 2, markers: [marker("front-45-left", 42, 57), marker("back-45-left", 20, 48), marker("front-plate", 77, 65), marker("car-roof", 38, 22)] },
  "back-45-left": { aspectRatio: 4 / 3, markers: [marker("back-45-left", 57, 57), marker("front-45-left", 17, 56), marker("rear-plate", 79, 62), marker("car-roof", 46, 20)] },
  "front-plate": { aspectRatio: 4 / 3, markers: [marker("front-plate", 50, 67), marker("front-45-right", 27, 48), marker("front-45-left", 73, 48), marker("car-roof", 50, 23)] },
  "rear-plate": { aspectRatio: 4 / 3, markers: [marker("rear-plate", 50, 67), marker("back-45-right", 73, 48), marker("back-45-left", 27, 48), marker("car-roof", 50, 23)] },
  "car-roof": { aspectRatio: 4 / 3, markers: [marker("car-roof", 50, 48)] },
  "driver-interior": { aspectRatio: 4 / 3, markers: [marker("driver-interior", 43, 65), marker("odometer-on", 64, 43)] },
  "odometer-on": { aspectRatio: 4 / 3, markers: [marker("odometer-on", 50, 61)] },
  "engine-bay": { aspectRatio: 4 / 3, markers: [marker("engine-bay", 50, 51)] },
  "spec-plate": { aspectRatio: 4 / 3, markers: [marker("spec-plate", 50, 57)] },
  "chassis-number": { aspectRatio: 4 / 3, markers: [marker("chassis-number", 50, 57)] },
};
export function artworkForRequirement(id: string): VehiclePhotoArtwork {
  return vehiclePhotoArtwork[id] ?? { aspectRatio: 4 / 3, markers: [marker(id, 50, 50)] };
}
