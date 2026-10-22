import {imageTarget,type ImageDescriptor,type ImagePolicy,type ImageOptimizationResult} from "./image-policy";
import {readImageHeader} from "./image-header";
export async function renderOptimizedImage(blob:Blob,policy:ImagePolicy,maxPixels:number,signal?:AbortSignal):Promise<ImageOptimizationResult>{
 const started=performance.now();let source:ImageDescriptor={byteSize:blob.size,mimeType:blob.type};
 const keep=(reason:string):ImageOptimizationResult=>({status:"kept-original",source,reason,elapsedMs:performance.now()-started});
 let bitmap:ImageBitmap|undefined;let image:HTMLImageElement|undefined;let url:string|undefined;let canvas:HTMLCanvasElement|OffscreenCanvas|undefined;
 try{
  if(signal?.aborted)return keep("cancelled");
  const dim=await readImageHeader(blob);if(!dim||!dim.width||!dim.height||dim.animated)return keep("unsupported-metadata");
  source={...source,width:dim.width,height:dim.height,orientation:dim.orientation};
  // PNG EXIF/animation/HDR semantics are not inferred here; preserve that source unchanged.
  if(!["image/jpeg","image/webp"].includes(blob.type))return keep("unsupported-format");
  if(dim.width*dim.height>maxPixels)return keep("pixel-budget");
  if(blob.size<=policy.suitableBytes && (policy.preserveDimensions||Math.max(dim.width,dim.height)<=policy.maxLongEdge))return keep("already-suitable");
  const target=imageTarget(dim,policy);
  if(typeof createImageBitmap==="function")bitmap=await createImageBitmap(blob,{imageOrientation:"from-image",resizeWidth:target.width,resizeHeight:target.height,resizeQuality:"high"});
  else if(typeof document!=="undefined"){
   image=new Image();url=URL.createObjectURL(blob);image.src=url;await image.decode();
  }else return keep("unsupported-browser");
  if(signal?.aborted)return keep("cancelled");
  canvas=typeof OffscreenCanvas!=="undefined"?new OffscreenCanvas(target.width,target.height):Object.assign(document.createElement("canvas"),target);
  const context=canvas.getContext("2d") as CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D|null;if(!context)return keep("canvas-unavailable");
  context.drawImage(bitmap??image!,0,0,target.width,target.height);
  bitmap?.close();bitmap=undefined;if(image){image.removeAttribute("src");image=undefined;}if(url){URL.revokeObjectURL(url);url=undefined;}
  const candidate=!("convertToBlob" in canvas)?await new Promise<Blob|null>(resolve=>(canvas as HTMLCanvasElement).toBlob(resolve,policy.mimeType,policy.quality)) : await (canvas as OffscreenCanvas).convertToBlob({type:policy.mimeType,quality:policy.quality});
  if(!candidate?.size||candidate.type!==policy.mimeType)return keep("encoding-unavailable");
  if(candidate.size>=blob.size*.9)return keep("not-smaller");
  const header=await readImageHeader(candidate);if(!header||header.width!==target.width||header.height!==target.height)return keep("verification-failed");
  // Confirm actual decode before persisting/offering the candidate, not only its MIME/header.
  if(typeof createImageBitmap==="function"){const verified=await createImageBitmap(candidate,{resizeWidth:Math.min(64,target.width)});verified.close();}
  else{const verificationUrl=URL.createObjectURL(candidate),verified=new Image();try{verified.src=verificationUrl;await verified.decode();if(verified.naturalWidth!==target.width||verified.naturalHeight!==target.height)return keep("verification-failed");}finally{verified.removeAttribute("src");URL.revokeObjectURL(verificationUrl);}}
  if(signal?.aborted)return keep("cancelled");
  return {status:"ready",blob:candidate,source,optimized:{byteSize:candidate.size,mimeType:candidate.type,...target,orientation:1},elapsedMs:performance.now()-started};
 }catch{return keep("processing-failed");}
 finally{bitmap?.close();if(image){image.removeAttribute("src");}if(url)URL.revokeObjectURL(url);if(canvas){canvas.width=1;canvas.height=1;}}
}
