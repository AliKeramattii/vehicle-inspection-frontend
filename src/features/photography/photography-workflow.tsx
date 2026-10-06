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

export type PhotographyView = { kind: "overview" } | { kind: "completion" } | { kind: "section"; sectionId: string } | { kind: "guide" | "camera" | "review"; requirementId: string };
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
  if (photos.query.isPending) return <PhotographyLoading message="در حال خواندن عکس‌های ذخیره‌شده…" />;
  if (photos.query.error) return <div className="photography-recovery"><InlineAlert tone="destructive">{photos.query.error.message}</InlineAlert><SecondaryButton onClick={() => void photos.query.refetch()}>تلاش دوباره</SecondaryButton></div>;
  const shared = { inspectionId, records: photos.records };
  const focus = (children: React.ReactNode) => <PhotographyRouteFocus routeKey={JSON.stringify(view)}>{children}</PhotographyRouteFocus>;
  if (view.kind === "overview") return focus(<PhotographyOverview {...shared} template={template} />);
  if (view.kind === "completion") return focus(<PhotographyCompletion {...shared} template={template} />);
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
  return focus(<PhotoReview key={photo.id} photo={photo} section={section} inspectionId={inspectionId} record={photos.records.find((record) => record.requirementId === photo.id)} pending={photos.confirm.isPending || photos.discard.isPending} error={photos.confirm.error?.message ?? photos.discard.error?.message}
    onConfirm={() => photos.confirm.mutate(photo.id, { onSuccess: () => {
      const next = nextRequirement(section, photos.records, photo.id);
      router.push(next ? inspectionRoutes.photo(inspectionId, next.id, "guide") : inspectionRoutes.section(inspectionId, section.id));
    } })} onRetake={() => photos.discard.mutate(photo.id, { onSuccess: () => router.push(inspectionRoutes.photo(inspectionId, photo.id, "guide")) })} />);
}
function MissingPhoto({ inspectionId }: { inspectionId: string }) { return <div className="photography-recovery"><InlineAlert>این بخش یا عکس در قالب بازدید وجود ندارد.</InlineAlert><Link href={inspectionRoutes.capture(inspectionId)}>بازگشت به عکاسی</Link></div>; }
