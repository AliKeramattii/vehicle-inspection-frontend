import { z } from "zod";
import { inspectionLocationSchema } from "@/schemas/domain";
import { normalizeDigits } from "@/lib/utils/persian";

export const locationFormSchema = inspectionLocationSchema.extend({
  formattedAddress: z.string().trim().min(8, "آدرس کامل بازدید را وارد کنید.").max(300),
  buildingNumber: z.string().trim().max(20, "شماره پلاک بیش از حد طولانی است.").transform(normalizeDigits),
  unitFloor: z.string().trim().max(80, "طبقه و واحد بیش از حد طولانی است."),
  parkingDescription: z.string().trim().max(300, "توضیحات محل پارک بیش از حد طولانی است."),
});
export type LocationFormValues = z.infer<typeof locationFormSchema>;
