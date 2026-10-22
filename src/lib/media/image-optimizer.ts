import {imagePixelBudget,type ImagePolicy,type ImageOptimizationResult} from "./image-policy";
import {renderOptimizedImage} from "./image-optimizer-core";
let active=false;
/** One optimization per tab; no business queue/state duplication and no media in global storage. */
export async function optimizeImage(blob:Blob,policy:ImagePolicy,signal?:AbortSignal):Promise<ImageOptimizationResult&{method:"worker"|"canvas"}>{
 const source={byteSize:blob.size,mimeType:blob.type};const kept=(reason:string)=>({status:"kept-original" as const,source,reason,elapsedMs:0,method:"canvas" as const});
 if(active)return kept("busy");if(signal?.aborted)return kept("cancelled");active=true;
 try{
  const device=navigator as Navigator&{deviceMemory?:number};const maxPixels=imagePixelBudget(device.deviceMemory,device.hardwareConcurrency);
  if(typeof Worker!=="undefined"&&typeof OffscreenCanvas!=="undefined"&&typeof createImageBitmap==="function"){
   try{return await new Promise<ImageOptimizationResult&{method:"worker"}>((resolve,reject)=>{
    const worker=new Worker(new URL("./image-optimizer.worker.ts",import.meta.url),{type:"module"});
    const finish=()=>{clearTimeout(timeout);signal?.removeEventListener("abort",abort);worker.terminate();};
    const abort=()=>{finish();resolve({...kept("cancelled"),method:"worker"});};
    const timeout=setTimeout(()=>{finish();resolve({...kept("timeout"),method:"worker"});},12_000);
    signal?.addEventListener("abort",abort,{once:true});
    worker.onmessage=(event:MessageEvent<ImageOptimizationResult>)=>{finish();resolve({...event.data,method:"worker"});};
    worker.onerror=()=>{finish();reject(new Error("Worker unavailable"));};
    if(signal?.aborted){abort();return;}
    try { worker.postMessage({blob,policy,maxPixels}); }
    catch (error) { finish(); reject(error); }
   });}catch{/* Unsupported worker/CSP falls back to bounded asynchronous browser canvas. */}
  }
  await new Promise<void>(resolve=>setTimeout(resolve,0));return {...await renderOptimizedImage(blob,policy,maxPixels,signal),method:"canvas"};
 }finally{active=false;}
}
