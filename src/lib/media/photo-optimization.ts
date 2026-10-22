import {beginPhotoOptimization,finishPhotoOptimization,choosePhotoVariant} from "./photo-store";
import type {ImagePolicy, ImageOptimizationResult} from "./image-policy";
export type PhotoMediaMutation = <T>(operation:(namespace:string)=>Promise<T>)=>Promise<T>;
/** Authorize each short persistence step separately; CPU work never holds an IndexedDB transaction or request lease. */
export function createPhotoOptimization(mutate:PhotoMediaMutation){
 return {
  async prepare(requirementId:string,policy:ImagePolicy,signal?:AbortSignal){
   const work=await mutate(namespace=>beginPhotoOptimization(namespace,requirementId,policy));
   let result: ImageOptimizationResult;
   try {
    const {optimizeImage}=await import("./image-optimizer");
    result=await optimizeImage(work.blob,policy,signal);
   } catch {
    // A failed lazy chunk must leave a recoverable durable source, not a stuck processing state.
    result={status:"kept-original",reason:"optimizer-unavailable",source:{byteSize:work.blob.size,mimeType:work.blob.type},elapsedMs:0};
   }
   // The durable draft/attempt CAS rejects late work after recapture, discard, confirmation or another tab.
   return mutate(namespace=>finishPhotoOptimization(namespace,requirementId,work,result));
  },
  choose:(requirementId:string,revisionId:string,variant:"source"|"optimized")=>mutate(namespace=>choosePhotoVariant(namespace,requirementId,revisionId,variant)),
 };
}
