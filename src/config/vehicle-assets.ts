/** Exact supplied sedan artwork. References only; never substitute customer evidence. */
export const vehicleGuideAssets = {
  "front-45-right": { src: "/assets/inspection-vehicle/photo-guides/front-45-right.webp", width: 1697, height: 927 },
  "back-45-right": { src: "/assets/inspection-vehicle/photo-guides/back-45-right.webp", width: 1697, height: 927 },
  "front-45-left": { src: "/assets/inspection-vehicle/photo-guides/front-45-left.webp", width: 1697, height: 927 },
  "back-45-left": { src: "/assets/inspection-vehicle/photo-guides/back-45-left.webp", width: 1697, height: 927 },
  "front-plate": { src: "/assets/inspection-vehicle/photo-guides/front-plate.webp", width: 1697, height: 927 },
  "rear-plate": { src: "/assets/inspection-vehicle/photo-guides/rear-plate.webp", width: 1697, height: 927 },
  "odometer-on": { src: "/assets/inspection-vehicle/photo-guides/odometer-on.webp", width: 1697, height: 927 },
  "driver-interior": { src: "/assets/inspection-vehicle/photo-guides/driver-interior.webp", width: 1698, height: 926 },
  "engine-bay": { src: "/assets/inspection-vehicle/photo-guides/engine-bay.webp", width: 1697, height: 927 },
  "spec-plate": { src: "/assets/inspection-vehicle/photo-guides/spec-plate.webp", width: 1672, height: 941 },
  "chassis-number": { src: "/assets/inspection-vehicle/photo-guides/chassis-number.webp", width: 1697, height: 927 },
  "car-roof": { src: "/assets/inspection-vehicle/photo-guides/car-roof.webp", width: 1697, height: 927 },
} as const;
export type VehicleGuideId = keyof typeof vehicleGuideAssets;
export const vehicleHeroAssets = {
  landing: "/assets/inspection-vehicle/hero/landing-vehicle.webp",
  introduction: "/assets/inspection-vehicle/hero/introduction-vehicle.webp",
  consent: "/assets/inspection-vehicle/hero/consent-vehicle.webp",
  readiness: "/assets/inspection-vehicle/hero/readiness-vehicle.webp",
  receipt: "/assets/inspection-vehicle/hero/receipt-vehicle.webp",
} as const;
// The supplied navigation files duplicate source photographs. Reuse one public copy.
export const vehicleViewAssets = {
  top: vehicleGuideAssets["car-roof"].src,
  rear: vehicleGuideAssets["rear-plate"].src,
  right: "/assets/inspection-vehicle/photo-guides/right.webp",
  front: vehicleGuideAssets["front-plate"].src,
  left: "/assets/inspection-vehicle/photo-guides/left.webp",
  body: vehicleGuideAssets["front-45-right"].src,
  cabin: vehicleGuideAssets["driver-interior"].src,
  "engine-specs": vehicleGuideAssets["engine-bay"].src,
} as const;
export const vehicleGhostAssets = {
  "front": "/assets/inspection-vehicle/ghost-guides/ghost-front.webp",
  "front-45-right": "/assets/inspection-vehicle/ghost-guides/ghost-front-45-right.webp",
  "right": "/assets/inspection-vehicle/ghost-guides/ghost-right.webp",
  "rear-45-left": "/assets/inspection-vehicle/ghost-guides/ghost-rear-45-left.webp",
  "rear": "/assets/inspection-vehicle/ghost-guides/ghost-rear.webp",
  "rear-45-right": "/assets/inspection-vehicle/ghost-guides/ghost-rear-45-right.webp",
  "left": "/assets/inspection-vehicle/ghost-guides/ghost-left.webp",
  "front-45-left": "/assets/inspection-vehicle/ghost-guides/ghost-front-45-left.webp",
} as const;
/** Keep immutable, pinned legacy templates readable without rewriting their history.
 * Only exact built-in guide URLs are aliases. Tenant overrides and Blob URLs pass through.
 */
export function resolveVehicleGuide(src: string): string {
  return Object.values(vehicleGuideAssets).find(asset => src === "/assets/inspection/photo-guides/" + asset.src.split("/").at(-1))?.src ?? src;
}
/** Narrow public allowlist for Site Settings; no traversal, query or arbitrary assets. */
export function isVehicleAssetUrl(src: string): boolean {
  return [...Object.values(vehicleGuideAssets).map(asset=>asset.src), ...Object.values(vehicleHeroAssets), ...Object.values(vehicleViewAssets), ...Object.values(vehicleGhostAssets), ...Object.values(vehicleReadinessAssets), ...Object.values(vehicleIdentificationAssets)].some(value => value === src);
}

/** Supplied readiness illustrations; intentionally distinct from the studio hero. */
export const vehicleReadinessAssets = {
  clean: "/assets/inspection-vehicle/readiness/readiness-clean-vehicle.webp",
  space: "/assets/inspection-vehicle/readiness/readiness-open-space.webp",
} as const;
/** Additional locations are guidance variants, never additional photo requirements. */
export const vehicleIdentificationAssets = {
  pillar: vehicleGuideAssets["spec-plate"].src,
  engine: vehicleGuideAssets["chassis-number"].src,
  seat: "/assets/inspection-vehicle/photo-guides/spec-plate-2.webp",
  windshield: "/assets/inspection-vehicle/photo-guides/windshield-vin.webp",
} as const;
