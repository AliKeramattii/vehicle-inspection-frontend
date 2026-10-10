"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InspectionJourneyHeader } from "@/components/inspection/inspection-journey-header";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { Icon } from "@/components/ui/icon";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { useSubmissionRecord } from "@/features/submission/use-submission-record";
import { indexedDBUploadQueue } from "@/features/upload/queue-repository";
import { uploadQueryKey, useUploadRuntime } from "@/features/upload/upload-runtime";
import { toPersianDigits as fa } from "@/lib/utils/persian";
import { requestActive, requestReadiness, type AdditionalView, type EvidenceRequest } from "./request-model";
import { useEvidenceRequests, requestQueryKey } from "./use-evidence-requests";
import { readRequestPackage } from "./request-source";
import { requestService } from "./request-service";
import { AdditionalCapture } from "./additional-capture";
import { RequestCard } from "./request-card";
import { AdditionalTimeline } from "./additional-timeline";

export function AdditionalWorkflow({ inspectionId, requestId, view }: { inspectionId: string; requestId: string; view: AdditionalView }) {
  const requests = useEvidenceRequests(inspectionId), original = useSubmissionRecord(inspectionId), request = requests.data?.find((request) => request.id === requestId);
  if (!request || !original.data?.receipt) return null; // The outer scoped guard owns loading/error/authorization.
  return <><InspectionJourneyHeader current="upload" backHref={inspectionRoutes.receipt(inspectionId)} referenceCode={original.data.receipt.reference} partnerName="بیمه ملت" />{view.kind === "list" ? <RequestList request={request} submittedAt={original.data.receipt.submittedAt} reference={original.data.receipt.reference} /> : <AdditionalCapture key={`${request.id}:${view.kind}:${view.stage}:${view.kind === "photo" ? view.requirementId : "video"}`} request={request} view={view} />}</>;
}
function RequestList({ request, submittedAt, reference }: { request: EvidenceRequest; submittedAt: string; reference: string }) {
  const runtime = useUploadRuntime(), cache = useQueryClient(), controller = useRef<AbortController | null>(null), [error, setError] = useState<string>();
  const { resume } = runtime;
  const source = useQuery({ queryKey: [...requestQueryKey, "package", request.id, request.version], queryFn: () => readRequestPackage(request), networkMode: "always", retry: false });
  const queue = useQuery({ queryKey: uploadQueryKey, queryFn: () => indexedDBUploadQueue.list(), networkMode: "always", retry: false });
  const [queueError, setQueueError] = useState<string>();
  useEffect(() => { resume(); return () => controller.current?.abort(); }, [resume]);
  useEffect(() => { if (!runtime.online) controller.current?.abort(); }, [runtime.online]);
  useEffect(() => {
    if (source.data && !source.isFetching && !request.mutationOwner && requestActive(request)) void indexedDBUploadQueue.reconcile(source.data.namespace, source.data.media).catch((cause: unknown) => setQueueError(cause instanceof Error ? cause.message : "خواندن صف ارسال ممکن نشد."));
  }, [source.data, source.isFetching, request]);
  const status = source.data ? requestReadiness(request, source.data.media, queue.data ?? [], source.data.drafts) : undefined;
  const pending = request.status === "resubmitting", ready = Boolean(status?.canResubmit && runtime.online && !queueError && !source.error && !queue.error);
  async function resubmit() {
    if (controller.current || !ready) return;
    controller.current = new AbortController(); setError(undefined);
    try { await requestService.submit(request.inspectionId, request.id, request.version, () => navigator.onLine, controller.current.signal); }
    catch (cause) { if (!(cause instanceof DOMException && cause.name === "AbortError")) setError(cause instanceof Error ? cause.message : "ارسال انجام نشد."); }
    finally { controller.current = null; await cache.invalidateQueries({ queryKey: requestQueryKey }); }
  }
  const retry = async (ids: string[]) => { try { if (!requestActive(request) || pending) return; await indexedDBUploadQueue.retry(ids); runtime.resume(); setQueueError(undefined); } catch (cause) { setQueueError(cause instanceof Error ? cause.message : "تلاش مجدد ممکن نشد."); } };
  if (request.receipt) return <div className="additional-route additional-confirmation"><div className="additional-scroll"><div className="additional-success" aria-hidden="true"><Icon name="check" size={34} /></div><h2>مدارک تکمیلی با موفقیت ارسال شد</h2><p>مدارک جدید برای بررسی مجدد ارسال شدند.</p><div className="additional-receipt-reference"><span>کد پیگیری</span><bdi dir="ltr">{reference}</bdi><small>{fa(request.receipt.evidenceIds.length)} مدرک تکمیلی ارسال شده</small></div><AdditionalTimeline request={request} submittedAt={submittedAt} /><p className="additional-preservation">ارسال اولیه و مدارک قبلی محفوظ هستند. نتیجه بررسی هنوز اعلام نشده است.</p></div><BottomStickyCTA className="additional-actions additional-receipt-actions"><Link className="photography-primary" href={inspectionRoutes.receipt(request.inspectionId)}>بازگشت به وضعیت بازدید</Link></BottomStickyCTA></div>;
  if (!requestActive(request)) return <div className="submission-recovery"><InlineAlert tone="warning">این درخواست دیگر فعال نیست.</InlineAlert><Link href={inspectionRoutes.receipt(request.inspectionId)}>بازگشت به وضعیت بازدید</Link></div>;
  const issue = source.error?.message ?? queue.error?.message ?? queueError ?? runtime.error;
  return <div className="additional-route"><div className="additional-scroll">
    <div className="additional-heading"><h2>مدارک تکمیلی</h2><p>تصاویر درخواستی را مطابق راهنمای کارشناس ثبت کنید.</p></div>
    <div className="additional-request-notice"><Icon name="warning" size={25} /><div><strong>کارشناس {fa(request.items.length)} مدرک جدید درخواست کرده است.</strong><p>مدارک قبلی محفوظ هستند؛ فقط موارد زیر قابل تغییرند.</p></div></div>
    {!runtime.online && <InlineAlert tone="warning">اتصال اینترنت برقرار نیست. مدارک روی دستگاه محفوظ هستند؛ پس از اتصال، ارسال ادامه می‌یابد.</InlineAlert>}
    {issue && <div className="additional-recovery"><InlineAlert tone="destructive">{issue}</InlineAlert><SecondaryButton onClick={() => { setQueueError(undefined); void source.refetch(); void queue.refetch(); runtime.resume(); }}>تلاش مجدد</SecondaryButton></div>}
    <p className="additional-progress" role="status">{status ? `${fa(status.captured)} از ${fa(status.total)} مدرک ثبت شده • ${fa(status.uploaded)} ارسال شده` : "در حال خواندن وضعیت مدارک…"}</p>
    <ul className="additional-cards">{request.items.map((item, index) => <RequestCard key={item.id} request={request} item={item} captured={Boolean(status?.itemMedia[index])} draft={Boolean(source.data?.drafts.includes(item.id))} job={status?.itemJobs[index]} retry={() => void retry(status?.itemJobs[index] ? [status.itemJobs[index]!.id] : [])} />)}</ul>
    {status && status.failed > 1 && <SecondaryButton onClick={() => void retry(status.itemJobs.filter((job) => job?.upload === "failed" && job.retryable).map((job) => job!.id))}>تلاش مجدد همه</SecondaryButton>}
    <div className="additional-info"><Icon name="info" size={21} /><p>پس از تأیید مدارک جدید و ارسال فایل‌ها، آن‌ها را برای بررسی مجدد ارسال کنید.</p></div>
    {(error || request.lastError) && <InlineAlert tone="destructive">{error ?? request.lastError}</InlineAlert>}
    {pending && <p role="status" className="additional-submitting">در حال ارسال مدارک تکمیلی برای بررسی…</p>}
  </div><BottomStickyCTA className="additional-actions"><PrimaryButton onClick={() => void resubmit()} disabled={!ready || pending} loading={pending} aria-describedby="additional-submit-reason">{!pending && <Icon name="cloud" size={21} />}{request.status === "resubmit-failed" ? "تلاش مجدد" : "ارسال مدارک تکمیلی"}</PrimaryButton><p id="additional-submit-reason">{pending ? "لطفاً منتظر تأیید ارسال بمانید." : !runtime.online ? "برای ارسال نهایی مدارک، اتصال اینترنت لازم است." : ready ? "مدارک جدید برای بررسی مجدد ارسال می‌شوند." : source.data?.drafts.length ? "مدرک جدید را در صفحه بررسی تأیید کنید." : status?.captured !== status?.total ? "ابتدا همه مدارک درخواستی را ثبت و تأیید کنید." : "ابتدا ارسال فایل‌های جدید را کامل کنید."}</p><Link className="additional-back" aria-label="بازگشت به وضعیت بازدید" href={inspectionRoutes.receipt(request.inspectionId)}>بازگشت</Link></BottomStickyCTA></div>;
}
