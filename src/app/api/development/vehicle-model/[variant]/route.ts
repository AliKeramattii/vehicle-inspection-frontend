import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isLoopbackRequestHost, vehiclePreviewEnabled } from "@/features/vehicle-3d/preview-gate";

export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ variant: string }> }) {
  // Next dev constructs request.url from its 0.0.0.0 bind address; inspect the incoming Host.
  const host = request.headers.get("host") ?? "";
  if (!vehiclePreviewEnabled(process.env.NODE_ENV, process.env.VEHICLE_3D_PREVIEW) || !isLoopbackRequestHost(host)) return new Response(null, { status: 404 });
  const { variant } = await context.params;
  // Whitelist relative paths. No source path, filename or upload is accepted from the client.
  if (!["original", "mobile", "desktop"].includes(variant)) return new Response(null, { status: 404 });
  try {
    // Bound file tracing to these local asset directories, never a dynamic project-wide path.
    const file = await readFile(variant === "original"
      ? join(process.cwd(), "references/assets/3d/source/kia_sportage_gt_line_2023.glb")
      : join(process.cwd(), ".agent/vehicle-3d", `${variant}.glb`));
    return new Response(file, { headers: { "Content-Type": "model/gltf-binary", "Content-Length": String(file.length), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Model-License": "CC-BY-NC-SA-4.0; not-commercially-cleared" } });
  } catch { return new Response(null, { status: 404 }); }
}
