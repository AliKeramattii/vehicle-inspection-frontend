import { z } from "zod";
import { inspectionSectionSchema } from "./photography";

export const inspectionStatusSchema = z.enum(["draft", "capturing", "uploading", "readyToSubmit", "queuedForReview", "underReview", "additionalEvidenceRequired", "approved", "rejected"]);
export const evidenceStateSchema = z.enum(["local", "queued", "uploading", "processing", "uploaded", "verified", "failed", "retakeRequired"]);
export const captureCategorySchema = z.enum(["body", "cabin", "engineChassis"]);
export const iranianPlateLetters = ["الف", "ب", "ج", "د", "س", "ص", "ط", "ع", "ق", "ل", "م", "ن", "و", "ه", "ی"] as const;
export const iranianPlateSchema = z.object({
  firstTwoDigits: z.string().regex(/^\d{2}$/, "دو رقم اول پلاک را وارد کنید."),
  letter: z.enum(iranianPlateLetters, { error: "حرف پلاک را انتخاب کنید." }),
  threeDigits: z.string().regex(/^\d{3}$/, "سه رقم اصلی پلاک را وارد کنید."),
  regionDigits: z.string().regex(/^\d{2}$/, "دو رقم کد ایران را وارد کنید."),
});
export const vehicleSchema = z.object({
  make: z.string().min(1), model: z.string().min(1), year: z.number().int().positive(),
  colorName: z.string().min(1), colorHex: z.string().regex(/^#[\da-fA-F]{6}$/).optional(),
  vinMasked: z.string().min(1), plate: iranianPlateSchema, odometerKm: z.number().int().nonnegative().optional(),
});
export const captureSlotSchema = z.object({
  code: z.string().min(1), title: z.string().min(1), category: captureCategorySchema,
  required: z.boolean(), guideAvailable: z.boolean(), distanceMeters: z.number().positive().optional(),
  phoneHeight: z.enum(["waist", "headlight", "chest", "custom"]).optional(),
  cameraOrientation: z.enum(["portrait", "landscape"]).optional(), viewpoint: z.string().optional(),
  highlightNodes: z.array(z.string()),
  status: z.enum(["pending", "completed", "retake"]).optional(),
});
export const capturePlanSchema = z.object({
  templateId: z.string().min(1), templateVersion: z.number().int().positive(),
  totalRequired: z.number().int().nonnegative(), shots: z.array(captureSlotSchema),
  sections: z.array(inspectionSectionSchema).optional(),
}).superRefine((plan, context) => {
  if (plan.totalRequired !== plan.shots.filter((shot) => shot.required).length) {
    context.addIssue({ code: "custom", path: ["totalRequired"], message: "Required count must match the plan." });
  }
  if (new Set(plan.shots.map((shot) => shot.code)).size !== plan.shots.length) {
    context.addIssue({ code: "custom", path: ["shots"], message: "Capture codes must be unique." });
  }
});
export const evidenceSchema = z.object({
  id: z.string().min(1), shotCode: z.string().min(1), mediaType: z.enum(["image", "video360"]),
  state: evidenceStateSchema, thumbnailUrl: z.url().optional(), remoteUrl: z.url().optional(),
  capturedAt: z.iso.datetime().optional(),
});
export const inspectionLocationSchema = z.object({
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().nonnegative(), formattedAddress: z.string().min(1),
  buildingNumber: z.string().optional(), unitFloor: z.string().optional(), parkingDescription: z.string().optional(),
});
export const inspectionSchema = z.object({
  id: z.string().min(1), status: inspectionStatusSchema, vehicle: vehicleSchema.nullable(),
  location: inspectionLocationSchema.nullable(), evidence: z.array(evidenceSchema),
});
