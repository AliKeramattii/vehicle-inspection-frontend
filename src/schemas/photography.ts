import { z } from "zod";

export const sectionIdSchema = z.enum(["right", "left", "front", "rear", "cabin", "engine-details", "roof"]);
export const photoStatusSchema = z.enum(["pending", "captured", "uploading", "uploaded", "verified", "retake-requested"]);
export const photoRequirementSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), description: z.string().min(1),
  sampleImage: z.string().startsWith("/assets/inspection/photo-guides/"), instructions: z.array(z.string().min(1)).min(1),
  distance: z.string().optional(), height: z.string().optional(), orientation: z.enum(["portrait", "landscape"]).optional(),
  required: z.boolean(), status: photoStatusSchema, reviewerReason: z.string().optional(),
  checks: z.array(z.string().min(1)).min(1), semanticNodes: z.array(z.string()).optional(),
  guidanceTopics: z.array(z.enum(["frame", "distance", "angle", "ignition", "glare", "interior", "hood", "text", "roof", "steady"])).optional(),
});
export const inspectionSectionSchema = z.object({
  id: sectionIdSchema, title: z.string().min(1), order: z.number().int().positive(),
  photoRequirements: z.array(photoRequirementSchema).min(1),
});
export const photographyTemplateSchema = z.object({
  templateId: z.string().min(1), templateVersion: z.number().int().positive(), sections: z.array(inspectionSectionSchema).min(1),
}).superRefine((template, ctx) => {
  const ids = template.sections.flatMap((section) => section.photoRequirements.map((photo) => photo.id));
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", path: ["sections"], message: "Requirement IDs must be unique." });
  if (new Set(template.sections.map((section) => section.id)).size !== template.sections.length) ctx.addIssue({ code: "custom", path: ["sections"], message: "Section IDs must be unique." });
});
export type InspectionSectionId = z.infer<typeof sectionIdSchema>;
export type PhotoRequirementStatus = z.infer<typeof photoStatusSchema>;
export type PhotoRequirement = z.infer<typeof photoRequirementSchema>;
export type InspectionSection = z.infer<typeof inspectionSectionSchema>;
export type PhotographyTemplate = z.infer<typeof photographyTemplateSchema>;
