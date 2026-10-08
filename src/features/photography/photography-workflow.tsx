"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InlineAlert } from "@/components/ui/status";
import { SecondaryButton } from "@/components/ui/button";
import { useInspectionAccess } from "@/features/inspection/use-inspection-access";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { photographyTemplateSchema, type PhotographyTemplate } from "@/schemas/photography";
import { PhotographyOverview } from "./photography-overview";
import { SectionDetail } from "./section-detail";
import { PhotoGuidance } from "./photo-guidance";
import { PhotoCamera } from "./photo-camera";
import { PhotoReview } from "./photo-review";
import { PhotographyCompletion } from "./photography-completion";
import { usePhotoRecords } from "./use-photo-records";
import { findRequirement, nextRequirement } from "./photography-model";
import { PhotographyRouteFocus } from "./photography-route-focus";
import { PhotographyLoading } from "./photography-loading";
import { useCaptureData } from "@/features/capture-package/use-capture-data";
import { nextCaptureTask } from "@/features/capture-package/capture-package-model";
import { VideoCapture } from "@/features/capture-package/video-capture";
import { VideoReview } from "@/features/capture-package/video-review";
import { photoNamespace, photoKey } from "@/lib/media/photo-store";
import { videoBlobKey } from "@/lib/media/capture-data-store";

export type PhotographyView = { kind: "overview" } | { kind: "completion" } | { kind: "video-record" } | { kind: "video-review" } | { kind: "section"; sectionId: string } | { kind: "guide" | "camera" | "review"; requirementId: string };
export function PhotographyWorkflow({ inspectionId, view }: { inspectionId: string; view: PhotographyView }) {
  const { repository, authorized } = useInspectionAccess(inspectionId);
  const inspection = useQuery({ queryKey: ["inspection", inspectionId], queryFn: () => repository.getInspection(inspectionId), retry: false });
  const plan = useQuery({ queryKey: ["capture-plan", inspectionId], queryFn: () => repository.getCapturePlan(inspectionId), retry: false });
  if (inspection.isPending || plan.isPending) return <PhotographyLoading message="در حال آماده‌سازی عکاسی…" />;
  const error = inspection.error ?? plan.error;
  if (error) return <div className="photography-recovery"><InlineAlert tone="destructive">{error.message}</InlineAlert><SecondaryButton onClick={() => { void inspection.refetch(); void plan.refetch(); }}>تلاش دوباره</SecondaryButton></div>;
  if (!authorized || !inspection.data?.location || !inspection.data.vehicle) return <div className="photography-recovery"><InlineAlert>برای شروع عکاسی، موقعیت و مشخصات خودرو را تأیید کنید.</InlineAlert><Link href={inspectionRoutes.vehicle(inspectionId)}>بازگشت به مشخصات خودرو</Link></div>;
  const parsed = photographyTemplateSchema.safeParse(plan.data);
  if (!parsed.success) return <div className="photography-recovery"><InlineAlert>قالب عکاسی در دسترس نیست.</InlineAlert><SecondaryButton onClick={() => void plan.refetch()}>تلاش دوباره</SecondaryButton><Link href={inspectionRoutes.vehicle(inspectionId)}>بازگشت به مشخصات خودرو</Link></div>;
  return <PhotographySession inspectionId={inspectionId} template={parsed.data} view={view} />;
}
function PhotographySession({ inspectionId, template, view }: { inspectionId: string; template: PhotographyTemplate; view: PhotographyView }) {
  const router = useRouter(), photos = usePhotoRecords(inspectionId, template);
  const namespace = photoNamespace(inspectionId, template.templateId, template.templateVersion), capture = useCaptureData(namespace);
  if (photos.query.isPending || capture.query.isPending) return <PhotographyLoading message="در حال خواندن عکس‌های ذخیره‌شده…" />;
  if (capture.query.error) return <div className="photography-recovery"><InlineAlert tone="destructive">{capture.query.error.message}</InlineAlert><SecondaryButton onClick={() => void capture.query.refetch()}>تلاش دوباره</SecondaryButton></div>;
  if (photos.query.error) return <div className="photography-recovery"><InlineAlert tone="destructive">{photos.query.error.message}</InlineAlert><SecondaryButton onClick={() => void photos.query.refetch()}>تلاش دوباره</SecondaryButton></div>;
  const shared = { inspectionId, records: photos.records, data: capture.data };
  const focus = (children: React.ReactNode) => <PhotographyRouteFocus routeKey={JSON.stringify(view)}>{children}</PhotographyRouteFocus>;
  if (view.kind === "overview") return focus(<PhotographyOverview {...shared} template={template} />);
  if (view.kind === "completion") return focus(<PhotographyCompletion {...shared} template={template} />);
  if (view.kind === "video-record") return focus(<VideoCapture inspectionId={inspectionId} reason={capture.data?.video360?.reviewerReason} onRecorded={async ({ blob, durationSeconds }, signal) => {
    await capture.draft.mutateAsync({ blob, durationSeconds, metadata: { kind: "video-360", mimeType: blob.type, sizeBytes: blob.size, localBlobKey: videoBlobKey(namespace), capturedAt: new Date().toISOString() } });
    if (!signal.aborted) router.push(inspectionRoutes.video(inspectionId, "review"));
  }} />);
  if (view.kind === "video-review") return focus(<VideoReview inspectionId={inspectionId} video={capture.data?.video360} pending={capture.confirm.isPending || capture.discard.isPending} error={capture.confirm.error?.message ?? capture.discard.error?.message}
    onConfirm={() => capture.confirm.mutate(undefined, { onSuccess: () => router.push(inspectionRoutes.photographyReview(inspectionId)) })}
    onRetake={() => capture.discard.mutate(undefined, { onSuccess: () => router.push(inspectionRoutes.video(inspectionId, "record")) })} />);
  if (view.kind === "section") {
    const section = template.sections.find((section) => section.id === view.sectionId);
    return focus(section ? <SectionDetail {...shared} section={section} template={template} /> : <MissingPhoto inspectionId={inspectionId} />);
  }
  const found = findRequirement(template, view.requirementId);
  if (!found) return <MissingPhoto inspectionId={inspectionId} />;
  const { photo, section } = found;
  if (view.kind === "guide") return focus(<PhotoGuidance {...shared} photo={photo} section={section} />);
  if (view.kind === "camera") return focus(<PhotoCamera photo={photo} inspectionId={inspectionId} onCapture={async (blob) => {
    await photos.draft.mutateAsync({ id: photo.id, draft: { blob, capturedAt: new Date().toISOString() } });
    router.push(inspectionRoutes.photo(inspectionId, photo.id, "review"));
  }} />);
  const record = photos.records.find((record) => record.requirementId === photo.id);
  return focus(<PhotoReview key={`${photo.id}:${capture.data?.odometer?.updatedAt ?? ""}`} photo={photo} section={section} inspectionId={inspectionId} record={record} pending={photos.confirm.isPending || photos.discard.isPending || capture.odometer.isPending} error={photos.confirm.error?.message ?? photos.discard.error?.message ?? capture.odometer.error?.message}
    odometer={template.captureRequirements?.odometerRequirementId === photo.id ? { reading: capture.data?.odometer, onSave: (kilometers) => {
      void (async () => {
        // Photo credit and numeric data remain separate. A data-save failure cannot erase the accepted photo.
        if (record?.draft) await photos.confirm.mutateAsync(photo.id);
        const reading = { kilometers, evidenceId: photoKey(namespace, photo.id) };
        await capture.odometer.mutateAsync(reading);
        const updated = photos.records.map((item) => item.requirementId === photo.id ? { ...item, status: "captured" as const, draft: undefined } : item);
        const task = nextCaptureTask(inspectionId, template, updated, { ...capture.data, namespace, odometer: reading });
        const next = nextRequirement(section, updated, photo.id);
        router.push(next ? inspectionRoutes.photo(inspectionId, next.id, "guide") : task.kind === "photos" ? inspectionRoutes.section(inspectionId, section.id) : task.href);
      })().catch(() => { /* Mutation errors remain visible and accepted evidence remains durable. */ });
    } } : undefined}
    onConfirm={() => photos.confirm.mutate(photo.id, { onSuccess: () => {
      const next = nextRequirement(section, photos.records, photo.id);
      router.push(next ? inspectionRoutes.photo(inspectionId, next.id, "guide") : inspectionRoutes.section(inspectionId, section.id));
    } })} onRetake={() => photos.discard.mutate(photo.id, { onSuccess: () => router.push(inspectionRoutes.photo(inspectionId, photo.id, "guide")) })} />);
}
function MissingPhoto({ inspectionId }: { inspectionId: string }) { return <div className="photography-recovery"><InlineAlert>این بخش یا عکس در قالب بازدید وجود ندارد.</InlineAlert><Link href={inspectionRoutes.capture(inspectionId)}>بازگشت به عکاسی</Link></div>; }
