"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSubmissionRecord } from "@/features/submission/use-submission-record";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { InlineAlert } from "@/components/ui/status";
import { SecondaryButton } from "@/components/ui/button";
import { assertRequestScope, parseAdditionalView } from "./request-model";
import { useEvidenceRequests } from "./use-evidence-requests";

/** A URL exemption never grants edit rights: validate ownership, active version and exact item before mounting media UI. */
export function AdditionalRouteGuard({ inspectionId, children }: { inspectionId: string; children: ReactNode }) {
  const pathname = usePathname(), requests = useEvidenceRequests(inspectionId), original = useSubmissionRecord(inspectionId);
  let parts: string[] = [];
  try { parts = pathname.split("/additional-evidence/")[1]?.split("/").map(decodeURIComponent) ?? []; } catch { /* Invalid URL encoding is an invalid request, not authorization. */ }
  const request = requests.data?.find((request) => request.id === parts[0]), view = parseAdditionalView(parts.slice(1));
  if (requests.isPending || original.isPending) return <main id="main-content" className="submission-loading" role="status" aria-label="در حال خواندن درخواست کارشناس"><div /><div /><div /></main>;
  let error = requests.error?.message ?? original.error?.message;
  if (!error) { try {
    if (!request || !view || !original.data?.receipt || request.originalNamespace !== original.data.summary?.namespace) throw new Error("درخواست فعال و معتبری برای این بازدید پیدا نشد.");
    if (view.kind !== "list") assertRequestScope(request, original.data, { inspectionId, requestId: request.id, version: request.version, kind: view.kind, requirementId: view.kind === "photo" ? view.requirementId : undefined });
  } catch (cause) { error = cause instanceof Error ? cause.message : "این مدرک قابل ویرایش نیست."; } }
  if (error) return <main id="main-content" className="submission-recovery"><InlineAlert tone="warning">{error}</InlineAlert>{requests.error && <SecondaryButton onClick={() => void requests.refetch()}>تلاش مجدد</SecondaryButton>}<Link href={original.data?.receipt ? inspectionRoutes.receipt(inspectionId) : inspectionRoutes.summary(inspectionId)}>بازگشت به وضعیت بازدید</Link></main>;
  return children;
}
