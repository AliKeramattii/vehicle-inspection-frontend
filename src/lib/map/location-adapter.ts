import type { InspectionLocation } from "@/types/domain";

export type Coordinates = Pick<InspectionLocation, "latitude" | "longitude">;
export type MapOffset = { x: number; y: number };
export type LocationFix = Coordinates & { accuracyMeters: number };
export type LocationFailure = "denied" | "unavailable" | "unsupported";
export class LocationServiceError extends Error {
  constructor(public readonly code: LocationFailure) { super(code); }
}
export interface InspectionLocationAdapter {
  readonly initialLocation: InspectionLocation;
  readonly artwork: string;
  readonly metersPerPixel: number;
  offsetCoordinates(center: Coordinates, offset: MapOffset): Coordinates;
  coordinatesOffset(center: Coordinates, location: Coordinates): MapOffset;
  locate(): Promise<LocationFix>;
}

// Deterministic development provider. Replace this adapter, not the page, for live map/GPS.
// A future browser locate implementation must request permission only on explicit interaction.
export const developmentLocationAdapter: InspectionLocationAdapter = {
  initialLocation: {
    latitude: 35.735, longitude: 51.435, accuracyMeters: 8,
    formattedAddress: "تهران، خیابان سهروردی شمالی، نبش خیابان خرمشهر، پلاک ۱۲۳، ساختمان پارس، منطقه ۷",
    buildingNumber: "۱۲۳", unitFloor: "طبقه ۳، واحد ۱۲",
    parkingDescription: "پارکینگ روبروی ساختمان، سمت راست",
  },
  artwork: "/images/location/development-map.svg",
  metersPerPixel: 0.15,
  offsetCoordinates(center, offset) {
    const degreesPerPixel = this.metersPerPixel / 111320;
    return { latitude: center.latitude + offset.y * degreesPerPixel,
      longitude: center.longitude - offset.x * degreesPerPixel / Math.cos(center.latitude * Math.PI / 180) };
  },
  coordinatesOffset(center, location) {
    const degreesPerPixel = this.metersPerPixel / 111320;
    return { x: (center.longitude - location.longitude) * Math.cos(center.latitude * Math.PI / 180) / degreesPerPixel,
      y: (location.latitude - center.latitude) / degreesPerPixel };
  },
  async locate() {
    const { latitude, longitude, accuracyMeters } = this.initialLocation;
    return { latitude, longitude, accuracyMeters };
  },
};
export function isGpsMatched(location: Coordinates, fix: LocationFix) {
  const north = (location.latitude - fix.latitude) * 111320;
  const east = (location.longitude - fix.longitude) * 111320 * Math.cos(fix.latitude * Math.PI / 180);
  return Math.hypot(north, east) <= fix.accuracyMeters;
}
