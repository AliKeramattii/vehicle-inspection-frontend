"use client";
import Image from "next/image";
import { resolveVehicleGuide, vehicleGhostAssets, vehicleGuideAssets } from "@/config/vehicle-assets";
import type { PhotoRequirement } from "@/schemas/photography";
import "./vehicle-guidance.css";

const alignmentViews = [
  [vehicleGuideAssets["front-45-right"].src, "front-45-right"],
  [vehicleGuideAssets["front-45-left"].src, "front-45-left"],
  [vehicleGuideAssets["back-45-right"].src, "rear-45-right"],
  [vehicleGuideAssets["back-45-left"].src, "rear-45-left"],
  [vehicleGuideAssets["front-plate"].src, "front"],
  [vehicleGuideAssets["rear-plate"].src, "rear"],
] as const;
export function photoAlignmentView(photo: PhotoRequirement) {
  return alignmentViews.find(([src]) => src === resolveVehicleGuide(photo.sampleImage))?.[1];
}
/** Decorative DOM only: useCamera captures the video element, never this overlay. */
export function PhotoAlignmentGuide({ photo }: { photo: PhotoRequirement }) {
  const view = photoAlignmentView(photo);
  return view ? <div className="photo-alignment-guide" data-view={view} aria-hidden="true"><Image src={vehicleGhostAssets[view]} alt="" width={1254} height={1254} sizes="(max-width:480px) 92vw, 442px" unoptimized /></div> : null;
}
