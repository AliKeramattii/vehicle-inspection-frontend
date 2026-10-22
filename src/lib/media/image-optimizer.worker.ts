import {renderOptimizedImage} from "./image-optimizer-core";
import type {ImagePolicy,ImageOptimizationResult} from "./image-policy";
const scope=globalThis as unknown as {onmessage:(event:MessageEvent<{blob:Blob;policy:ImagePolicy;maxPixels:number}>)=>void;postMessage:(result:ImageOptimizationResult)=>void};
scope.onmessage=event=>{void renderOptimizedImage(event.data.blob,event.data.policy,event.data.maxPixels).then(result=>scope.postMessage(result));};
