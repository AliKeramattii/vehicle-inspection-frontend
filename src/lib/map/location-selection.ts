export const MAX_LOCATION_ADDRESS_LENGTH = 300;

import { z } from "zod";
import type { InspectionLocation } from "@/types/domain";

export const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});
export const selectionSchema = coordinatesSchema.extend({
  selectionSource: z.enum(["gps", "manual"]),
  accuracyMeters: z.number().finite().nonnegative().nullable(),
}).superRefine((value, context) => {
  if (value.selectionSource === "manual" && value.accuracyMeters !== null)
    context.addIssue({ code: "custom", path: ["accuracyMeters"], message: "Manual points do not have GPS accuracy." });
});
export type LocationSelection = z.infer<typeof selectionSchema>;
export function samePoint(a: z.infer<typeof coordinatesSchema>, b: z.infer<typeof coordinatesSchema>) {
  return Math.abs(a.latitude - b.latitude) < 1e-7 && Math.abs(a.longitude - b.longitude) < 1e-7;
}
export function savedSelection(location?: InspectionLocation | null): LocationSelection | null {
  if (!location?.formattedAddress.trim() || !coordinatesSchema.safeParse(location).success) return null;
  // Legacy confirmed records lack provenance: retain the point, never invent GPS precision.
  return { latitude: location.latitude, longitude: location.longitude,
    selectionSource: location.selectionSource ?? "manual",
    accuracyMeters: location.selectionSource === "gps" ? location.accuracyMeters : null };
}
