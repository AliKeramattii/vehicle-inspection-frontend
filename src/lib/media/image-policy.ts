/** Experimental client policy; never an insurance quality standard or backend limit. */
export type ImagePolicy = { name: "exterior" | "detail"; maxLongEdge: number; suitableBytes: number; quality: number; mimeType: "image/jpeg" | "image/webp"; preserveDimensions: boolean };
export type ImageDimensions = { width: number; height: number; orientation: number; animated?: boolean };
export type ImageDescriptor = { byteSize: number; mimeType: string; width?: number; height?: number; orientation?: number };
export type ImageOptimizationMetadata = { status: "processing" | "ready" | "kept-original"; attemptId: string; draftRevision: string; policy: string; source: ImageDescriptor; optimized?: ImageDescriptor; reason?: string; method?: "worker" | "canvas"; elapsedMs?: number; selectedVariant?: "source" | "optimized" };
export type ImageOptimizationResult = { status: "ready"; blob: Blob; source: ImageDescriptor; optimized: ImageDescriptor; elapsedMs: number } | { status: "kept-original"; reason: string; source: ImageDescriptor; elapsedMs: number };
export const imagePolicies: Record<ImagePolicy["name"], ImagePolicy> = {
 exterior: {name:"exterior",maxLongEdge:2048,suitableBytes:600*1024,quality:.88,mimeType:"image/jpeg",preserveDimensions:false},
 detail: {name:"detail",maxLongEdge:2560,suitableBytes:2*1024*1024,quality:.9,mimeType:"image/jpeg",preserveDimensions:true},
};
/** Use requirement semantics, not another hardcoded list of the twelve IDs. Unknown guidance stays conservative. */
export function photoImagePolicy(photo: {guidanceTopics?: readonly string[]; checks: readonly string[]}): ImagePolicy {
 const topics=photo.guidanceTopics;
 const detail=!topics || topics.some(t=>["text","focus","ignition"].includes(t)) || photo.checks.some(t=>/خوانا/.test(t));
 return imagePolicies[detail?"detail":"exterior"];
}
export function imagePixelBudget(deviceMemory?:number,cores?:number){return deviceMemory!==undefined&&deviceMemory<=4 || cores!==undefined&&cores<=4 ? 8_000_000 : 16_000_000;}
export function imageTarget(dim:ImageDimensions,policy:ImagePolicy){const swapped=dim.orientation>=5&&dim.orientation<=8;const width=swapped?dim.height:dim.width,height=swapped?dim.width:dim.height;const ratio=policy.preserveDimensions?1:Math.min(1,policy.maxLongEdge/Math.max(width,height));return {width:Math.max(1,Math.round(width*ratio)),height:Math.max(1,Math.round(height*ratio))};}
