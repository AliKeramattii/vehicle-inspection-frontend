import type { z } from "zod";
import type { captureCategorySchema, capturePlanSchema, captureSlotSchema, evidenceSchema, evidenceStateSchema,
  inspectionLocationSchema, inspectionSchema, inspectionStatusSchema, iranianPlateSchema, vehicleSchema } from "@/schemas/domain";

export type InspectionStatus = z.infer<typeof inspectionStatusSchema>;
export type EvidenceState = z.infer<typeof evidenceStateSchema>;
export type CaptureCategory = z.infer<typeof captureCategorySchema>;
export type IranianPlate = z.infer<typeof iranianPlateSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
export type CaptureSlot = z.infer<typeof captureSlotSchema>;
export type CapturePlan = z.infer<typeof capturePlanSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type InspectionLocation = z.infer<typeof inspectionLocationSchema>;
export type Inspection = z.infer<typeof inspectionSchema>;
