"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { isEditLocked, isSubmitted } from "./submission-model";
import { useSubmissionRecord } from "./use-submission-record";
import { AdditionalRouteGuard } from "@/features/additional-evidence/additional-route-guard";

/** Children never mount on a locked editable route, including camera/replacement routes. */
export function InspectionEditGuard({ inspectionId, children }: { inspectionId: string; children: ReactNode }) {
  const query = useSubmissionRecord(inspectionId), pathname = usePathname(), router = useRouter();
  const additional = pathname.startsWith(`/inspection/${encodeURIComponent(inspectionId)}/additional-evidence/`);
  const editable = !additional && pathname !== inspectionRoutes.summary(inspectionId) && pathname !== inspectionRoutes.receipt(inspectionId);
  const locked = editable && isEditLocked(query.data ?? undefined);
  useEffect(() => { if (locked) router.replace(isSubmitted(query.data ?? undefined) ? inspectionRoutes.receipt(inspectionId) : inspectionRoutes.summary(inspectionId)); }, [locked, query.data, router, inspectionId]);
  if (query.error) return <main id="main-content" className="p-5"><InlineAlert tone="destructive">{query.error.message}</InlineAlert><SecondaryButton onClick={() => void query.refetch()}>تلاش مجدد</SecondaryButton></main>;
  if (query.isPending || locked) return <main id="main-content" className="p-5" role="status">در حال خواندن وضعیت بازدید…</main>;
  return additional ? <AdditionalRouteGuard inspectionId={inspectionId}>{children}</AdditionalRouteGuard> : children;
}
