import { z } from "zod";
import { evidenceSchema, inspectionLocationSchema, inspectionSchema, inspectionStatusSchema, vehicleSchema } from "@/schemas/domain";
import type { Inspection } from "@/types/domain";

// Provisional transport schema: replace with generated ASP.NET DTOs when OpenAPI arrives.
export const inspectionDtoSchema = z.object({
  inspectionId: z.string().min(1), status: inspectionStatusSchema,
  vehicleDetails: vehicleSchema.nullable(), locationDetails: inspectionLocationSchema.nullable(),
  evidenceItems: z.array(evidenceSchema),
});
export type InspectionDto = z.infer<typeof inspectionDtoSchema>;
export function adaptInspection(payload: unknown): Inspection {
  const dto = inspectionDtoSchema.parse(payload);
  return inspectionSchema.parse({ id: dto.inspectionId, status: dto.status, vehicle: dto.vehicleDetails,
    location: dto.locationDetails, evidence: dto.evidenceItems });
}
