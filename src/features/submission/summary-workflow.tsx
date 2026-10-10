"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { InlineAlert } from "@/components/ui/status";
import { Icon } from "@/components/ui/icon";
import { useInspectionAccess } from "@/features/inspection/use-inspection-access";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { subscribeQueue } from "@/features/upload/queue-repository";
import { useUploadRuntime } from "@/features/upload/upload-runtime";
import { readInspectionSummary } from "./summary-source";
import { isSubmitted } from "./submission-model";
import { useSubmissionRecord, submissionQueryKey } from "./use-submission-record";
import { submissionService } from "./submission-service";
import { SummarySections } from "./summary-sections";
import { SubmissionLoading } from "./submission-loading";

export function SummaryWorkflow({ inspectionId }: { inspectionId: string }) {
  const { repository, authorized } = useInspectionAccess(inspectionId), router = useRouter(), cache = useQueryClient(), runtime = useUploadRuntime();
  const record = useSubmissionRecord(inspectionId), controller = useRef<AbortController | null>(null);
  const key = ["inspection-summary", inspectionId];
  const summary = useQuery({ queryKey: key, queryFn: () => readInspectionSummary(inspectionId, repository), enabled: authorized, retry: false, staleTime: 0, networkMode: "always" });
  useEffect(() => subscribeQueue(() => { void cache.invalidateQueries({ queryKey: ["inspection-summary", inspectionId] }); }), [cache, inspectionId]);
  useEffect(() => { const cancel = () => controller.current?.abort(); window.addEventListener("pagehide", cancel); return () => { cancel(); window.removeEventListener("pagehide", cancel); }; }, []);
  useEffect(() => { if (!runtime.online) controller.current?.abort(); }, [runtime.online]);
  const submit = useMutation({ networkMode: "always", mutationFn: async () => {
    if (controller.current) return;
    const active = new AbortController(); controller.current = active;
    try { return await submissionService.submit(inspectionId, () => readInspectionSummary(inspectionId, repository), () => navigator.onLine, active.signal); }
    finally { if (controller.current === active) controller.current = null; }
  }, onSettled: () => { void cache.invalidateQueries({ queryKey: submissionQueryKey(inspectionId) }); } });
  const submitted = isSubmitted(record.data ?? undefined);
  useEffect(() => { if (submitted) router.replace(inspectionRoutes.receipt(inspectionId)); }, [submitted, router, inspectionId]);
  if (submitted || record.isPending || authorized && summary.isPending) return <SubmissionLoading />;
  const error = record.error ?? summary.error;
  if (error) return <div className="submission-recovery"><InlineAlert tone="destructive">خواندن اطلاعات بازدید ممکن نشد. فایل‌ها محفوظ هستند.</InlineAlert><SecondaryButton onClick={() => { void record.refetch(); void summary.refetch(); }}>تلاش مجدد</SecondaryButton><Link href={inspectionRoutes.upload(inspectionId)}>رفتن به مرکز ارسال</Link></div>;
  if (!authorized || !summary.data) return <div className="submission-recovery"><InlineAlert>برای بررسی نهایی، بازدید خود را از صفحه شروع باز کنید.</InlineAlert><Link href="/">بازگشت به شروع</Link></div>;
  const data = summary.data, busy = submit.isPending || record.data?.status === "submitting";
  const failed = submit.error || record.data?.status === "submit-failed";
  const reason = !runtime.online ? "برای ارسال نهایی، اتصال اینترنت را برقرار کنید." : !data.readiness.captureComplete ? "نیازمندی‌های بازدید هنوز کامل نیست." : !data.readiness.factsConfirmed ? "موقعیت و مشخصات خودرو را تأیید کنید." : !data.readiness.requiredMediaUploaded ? "برخی فایل‌ها هنوز ارسال نشده‌اند." : undefined;
  return <div className="submission-route">
    <div className="summary-heading"><h2>بررسی نهایی</h2><p>لطفاً قبل از ارسال، اطلاعات بازدید را بررسی کنید.</p></div>
    <div className="summary-scroll" role="region" aria-label="خلاصه اطلاعات بازدید" tabIndex={0}>
      <div className="summary-readiness" data-ready={data.readiness.canSubmit}><Icon name={data.readiness.canSubmit ? "check" : "info"} size={28} /><div><h3>{data.readiness.canSubmit ? "آماده ارسال" : data.readiness.captureComplete ? "در انتظار ارسال فایل‌ها" : "بازدید هنوز کامل نیست"}</h3><p>{data.readiness.canSubmit ? "اطلاعات و فایل‌ها برای بررسی آماده‌اند." : "موارد باقی‌مانده را پیش از ارسال تکمیل کنید."}</p></div></div>
      {reason && <div className="summary-blocker" id="submission-blocking-reason"><InlineAlert tone="warning">{reason}<Link href={!data.readiness.captureComplete || !data.readiness.factsConfirmed ? inspectionRoutes.photographyReview(inspectionId) : inspectionRoutes.upload(inspectionId)}>{!data.readiness.captureComplete || !data.readiness.factsConfirmed ? "بررسی و تکمیل بازدید" : "رفتن به مرکز ارسال"}</Link></InlineAlert></div>}
      <SummarySections summary={data} />
    </div>
    <BottomStickyCTA className="submission-actions">
      {failed && <InlineAlert tone="destructive">ارسال بازدید انجام نشد. لطفاً دوباره تلاش کنید.</InlineAlert>}
      <p id="submission-explanation" role={busy ? "status" : undefined}>{busy ? "در حال ارسال بازدید برای بررسی…" : "پس از ارسال، اطلاعات بازدید برای بررسی ارسال می‌شود و ویرایش آن قفل خواهد شد."}</p>
      <PrimaryButton aria-describedby={reason ? "submission-blocking-reason submission-explanation" : "submission-explanation"} loading={busy} disabled={!data.readiness.canSubmit || !runtime.online} onClick={() => submit.mutate()}>{failed ? "تلاش مجدد" : "ارسال برای بررسی"}<Icon name="forward" size={21} /></PrimaryButton>
    </BottomStickyCTA>
  </div>;
}
