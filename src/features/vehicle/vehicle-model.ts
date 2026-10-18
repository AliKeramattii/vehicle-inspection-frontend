import { z } from "zod";
import { vehicleColors } from "./vehicle-colors";
import { iranianPlateSchema } from "@/schemas/domain";

export const vehicleDiscrepancySchema = z.object({
  field: z.enum(["model", "year", "color", "vin"]),
  description: z.string().trim().min(3, "توضیح کوتاهی درباره مغایرت بنویسید.").max(500),
});
export const vehicleConfirmationSchema = z.object({
  plate: iranianPlateSchema,
  colorId: z.enum(vehicleColors.map(c=>c.id)).optional(),
  discrepancy: vehicleDiscrepancySchema.optional(),
});
export type VehicleDiscrepancy = z.infer<typeof vehicleDiscrepancySchema>;
export type VehicleConfirmationInput = z.infer<typeof vehicleConfirmationSchema>;
export type VehicleConfirmationReceipt = VehicleConfirmationInput & { inspectionId: string; confirmedAt: string };
