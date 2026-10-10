"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { InlineAlert } from "@/components/ui/status";
import { BottomStickyCTA } from "@/components/ui/bottom-sticky-cta";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useInspectionAccess } from "@/features/inspection/use-inspection-access";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { photographyTemplateSchema, type PhotographyTemplate } from "@/schemas/photography";
import { photoNamespace } from "@/lib/media/photo-store";
import { formatOdometer } from "@/features/capture-package/capture-package-model";
import { readUploadPackage } from "./upload-package";
import { indexedDBUploadQueue } from "./queue-repository";
import { requiredMediaCount, uploadJobId, uploadProgress } from "./upload-model";
import { uploadQueryKey, useUploadRuntime } from "./upload-runtime";
import { UploadProgress } from "./upload-progress";
import { UploadRow } from "./upload-row";

export function UploadWorkflow({ inspectionId }: { inspectionId: string }) {
  const { authorized, repository } = useInspectionAccess(inspectionId);
  const plan = useQuery({ queryKey: ["capture-plan", inspectionId], queryFn: () => repository.getCapturePlan(inspectionId), retry: false });
  if (!authorized) return <div className="upload-recovery"><InlineAlert>برای ادامه، بازدید خود را از صفحه شروع باز کنید.</InlineAlert><Link href="/">بازگشت به شروع</Link></div>;
  if (plan.isPending) return <UploadLoading />;
  const parsed = photographyTemplateSchema.safeParse(plan.data);
  if (plan.error || !parsed.success) return <div className="upload-recovery"><InlineAlert tone="destructive">قالب بازدید در دسترس نیست.</InlineAlert><SecondaryButton onClick={() => void plan.refetch()}>تلاش مجدد</SecondaryButton><Link href={inspectionRoutes.capture(inspectionId)}>بازگشت به عکاسی</Link></div>;
  return <UploadSession inspectionId={inspectionId} template={parsed.data} />;
}
function UploadSession({ inspectionId, template }: { inspectionId: string; template: PhotographyTemplate }) {
  const namespace = photoNamespace(inspectionId, template.templateId, template.templateVersion), runtime = useUploadRuntime();
  const router = useRouter();
  const capture = useQuery({ queryKey: ["upload-package", namespace], queryFn: () => readUploadPackage(inspectionId, namespace, template), retry: false, staleTime: 0, networkMode: "always" });
  const reconciliation = useQuery({ queryKey: ["upload-reconcile", namespace, capture.data?.media.map(uploadJobId)], enabled: Boolean(capture.data), staleTime: 0, retry: false, networkMode: "always", queryFn: async () => { await indexedDBUploadQueue.reconcile(namespace, capture.data!.media); runtime.coordinator.wake(); return true; } });
  const queue = useQuery({ queryKey: uploadQueryKey, queryFn: () => indexedDBUploadQueue.list(), retry: false, refetchInterval: 1500, networkMode: "always" });
  const retry = useMutation({ mutationFn: (ids: string[]) => runtime.coordinator.retry(ids), networkMode: "always" });
  const error = capture.error ?? queue.error ?? reconciliation.error;
  if (error) return <div className="upload-recovery"><InlineAlert tone="destructive">{error.message}</InlineAlert><SecondaryButton onClick={() => { void capture.refetch(); void queue.refetch(); if (capture.data) void reconciliation.refetch(); runtime.resume(); }}>تلاش مجدد</SecondaryButton><Link href={inspectionRoutes.photographyReview(inspectionId)}>بررسی فایل‌های ذخیره‌شده</Link></div>;
  if (capture.isPending || queue.isPending || reconciliation.isPending) return <UploadLoading />;
  const current = new Map(queue.data?.filter((job) => job.current).map((job) => [job.id, job]));
  const jobs = capture.data!.media.map((media) => current.get(uploadJobId(media))).filter((job) => job !== undefined);
  const expected = requiredMediaCount(template), progress = uploadProgress(jobs, expected);
  const failures = jobs.filter((job) => job.upload === "failed" && job.retryable);
  const canContinue = progress.complete && capture.data!.capture.complete;
  const odometerId = template.captureRequirements?.odometerRequirementId;
  return <div className="upload-route"><div className="upload-heading"><h2>همگام‌سازی فایل‌ها</h2><p>وضعیت ارسال تصاویر و ویدیوی بازدید</p></div>
    <UploadProgress jobs={jobs} expected={expected} />
    {!runtime.online && <div className="upload-alert"><InlineAlert tone="warning"><strong>اتصال اینترنت برقرار نیست.</strong><br />فایل‌ها روی دستگاه شما محفوظ هستند و پس از اتصال دوباره ارسال می‌شوند.</InlineAlert></div>}
    {(retry.error || runtime.error) && <div className="upload-alert"><InlineAlert tone="destructive">{retry.error?.message ?? runtime.error}<SecondaryButton onClick={() => { retry.reset(); runtime.resume(); }}>تلاش مجدد</SecondaryButton></InlineAlert></div>}
    <div className="upload-list-scroll" role="region" aria-label="فهرست فایل‌های بازدید" tabIndex={0}>
      {odometerId && <div className="upload-odometer"><Icon name="ignition" size={21} /><span>کیلومتر</span><b>{capture.data!.odometer ? `${formatOdometer(capture.data!.odometer.kilometers)} کیلومتر` : "ثبت نشده"}</b><Link href={inspectionRoutes.photo(inspectionId, odometerId, "review")}>{capture.data!.odometer ? "ویرایش" : "ثبت کیلومتر"}</Link></div>}
      {!capture.data!.capture.complete && <InlineAlert tone="warning">نیازمندی‌های بازدید هنوز کامل نیست. <Link href={inspectionRoutes.photographyReview(inspectionId)}>بررسی و تکمیل بازدید</Link></InlineAlert>}
      <ul className="upload-list">{jobs.map((job) => <UploadRow key={job.id} job={job} retry={() => retry.mutate([job.id])} />)}</ul>
      <p className="upload-local-note"><Icon name="storageReady" size={18} />فایل‌ها روی دستگاه محفوظ هستند. ارسال این نسخه آزمایشی است.</p>
    </div>
    <BottomStickyCTA className="upload-actions">{failures.length > 1 && <SecondaryButton loading={retry.isPending} onClick={() => retry.mutate(failures.map((job) => job.id))}><Icon name="resetView" size={20} />تلاش مجدد همه</SecondaryButton>}<PrimaryButton disabled={!canContinue} onClick={() => router.push(inspectionRoutes.summary(inspectionId))}>ادامه به بررسی نهایی<Icon name="forward" size={20} /></PrimaryButton></BottomStickyCTA>
  </div>;
}
function UploadLoading() { return <div className="upload-loading" role="status" aria-label="در حال آماده‌سازی ارسال"><div /><div /><div /><div /></div>; }
