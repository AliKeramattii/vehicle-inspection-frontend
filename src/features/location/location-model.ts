import { MAX_LOCATION_ADDRESS_LENGTH } from "@/lib/map/location-selection";
import { z } from "zod";
import { inspectionLocationSchema } from "@/schemas/domain";
import { normalizeDigits } from "@/lib/utils/persian";

export const locationFormSchema = inspectionLocationSchema.extend({
  accuracyMeters: z.number().finite().nonnegative().nullable(),
  formattedAddress: z.string().trim().min(1, "آدرس کامل بازدید را وارد کنید.").max(MAX_LOCATION_ADDRESS_LENGTH, "آدرس بیش از حد طولانی است."),
  buildingNumber: z.string().trim().max(20, "شماره پلاک بیش از حد طولانی است.").transform(normalizeDigits),
  unitFloor: z.string().trim().max(80, "طبقه و واحد بیش از حد طولانی است."),
  parkingDescription: z.string().trim().max(300, "توضیحات محل پارک بیش از حد طولانی است."),
});
export type LocationFormValues = z.infer<typeof locationFormSchema>;

export const locationDetailsSchema = locationFormSchema.pick({ buildingNumber: true, unitFloor: true, parkingDescription: true });
