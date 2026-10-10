import { NextResponse, type NextRequest } from "next/server";
import { isLoopbackRequestHost, vehiclePreviewEnabled } from "@/features/vehicle-3d/preview-gate";

// Keep the user's untracked public copy, without exposing it as an unguarded asset.
// Gate the preview before the customer layout streams: page-level notFound() alone
// can render a not-found screen with HTTP 200 after a streaming response starts.
export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/assets/models/") ||
    !vehiclePreviewEnabled(process.env.NODE_ENV, process.env.VEHICLE_3D_PREVIEW) ||
    !isLoopbackRequestHost(request.headers.get("host") ?? "")
  ) return new Response(null, { status: 404 });
  return NextResponse.next();
}

export const config = {
  matcher: ["/assets/models/:path*", "/inspection/:inspectionId/capture/preview-3d"],
};
