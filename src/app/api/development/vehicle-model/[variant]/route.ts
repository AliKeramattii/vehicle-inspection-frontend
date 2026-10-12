import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {isLoopbackRequestHost,vehiclePreviewEnabled} from "@/features/vehicle-3d/preview-gate";
export const runtime="nodejs";
export async function GET(request:Request,context:{params:Promise<{variant:string}>}){
 if(!vehiclePreviewEnabled(process.env.NODE_ENV,process.env.VEHICLE_3D_PREVIEW)||!isLoopbackRequestHost(request.headers.get("host")??"")||(await context.params).variant!=="mobile")return new Response(null,{status:404});
 try{const bytes=await readFile(join(process.cwd(),".agent/vehicle-3d/mobile.glb"));return new Response(bytes,{headers:{"Content-Type":"model/gltf-binary","Content-Length":String(bytes.length),"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","X-Model-License":"CC-BY-NC-SA-4.0; not-commercially-cleared"}});}catch{return new Response(null,{status:404});}
}
