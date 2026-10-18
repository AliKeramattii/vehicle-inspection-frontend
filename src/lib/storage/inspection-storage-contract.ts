import { z } from "zod";
/** Backend handoff specification only. Does not write files or authorize users. */
const safeId=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/);
const extension=z.enum(["webp","jpg","png","mp4","webm"]);
export function inspectionFolder(inspectionId:string) {return "INSPECTION_"+safeId.parse(inspectionId);}
export function evidenceRelativePath(input:{inspectionId:string;evidenceId:string;revision:number;extension:z.infer<typeof extension>}) {
  const id=safeId.parse(input.evidenceId),revision=z.number().int().positive().safe().parse(input.revision);
  return inspectionFolder(input.inspectionId)+"/"+id+"-rev-"+revision+"."+extension.parse(input.extension);
}
export const evidenceMetadataColumns=["EvidenceId","InspectionId","RequirementId","EvidenceKind","RelativeFilePath","MimeType","FileSizeBytes","Revision","UploadStatus","CreatedAt","UploadedAt","DeletedAt","RetentionUntil"] as const;
export function assertUniqueEvidencePaths(paths:readonly string[]) {if(new Set(paths).size!==paths.length)throw new Error("Duplicate evidence path");}
