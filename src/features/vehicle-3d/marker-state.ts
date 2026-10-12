import type {LocalPhoto} from "@/lib/media/photo-store";
import type {PhotoRequirement} from "@/schemas/photography";
import {photographyVisualState} from "@/features/photography/photography-model";
import {photoRevision,uploadComplete,type UploadJob} from "@/features/upload/upload-model";
/** Green here means current accepted revision binary-upload-complete, never reviewer approval. */
export function uploadedMarkerState(photo:PhotoRequirement,records:readonly LocalPhoto[],jobs:readonly UploadJob[],namespace:string){
 const local=photographyVisualState(photo,records);if(local==="attention")return local;
 const record=records.find(r=>r.requirementId===photo.id);if(!record||local!=="complete")return "pending" as const;
 const job=jobs.find(j=>j.namespace===namespace&&j.requirementId===photo.id&&j.evidenceKind==="photo"&&j.current&&j.revision===photoRevision(record));
 if(job?.verification==="retake-requested")return "attention" as const;
 return job&&uploadComplete(job)?"complete" as const:"pending" as const;
}
export const fixedMarkerPosition=(index:number)=>({x:index<6?9:91,y:14+(index%6)*14});
