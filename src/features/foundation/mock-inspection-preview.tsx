"use client";

import { useQuery } from "@tanstack/react-query";
import { createMockInspectionRepository } from "@/mocks/inspection-repository";
import { mockInspectionId } from "@/mocks/fixtures";
import { InlineAlert } from "@/components/ui/status";
import { SecondaryButton } from "@/components/ui/button";

const repository = createMockInspectionRepository();
export function MockInspectionPreview() {
  const query = useQuery({ queryKey: ["foundation", "inspection", mockInspectionId], queryFn: () => repository.getInspection(mockInspectionId) });
  if (query.isPending) return <p role="status" className="text-sm text-muted">در حال دریافت اطلاعات نمونه…</p>;
  if (query.isError) return <><InlineAlert tone="destructive">دریافت اطلاعات نمونه ناموفق بود.</InlineAlert>
    <SecondaryButton onClick={() => void query.refetch()}>تلاش دوباره</SecondaryButton></>;
  return <div className="space-y-3 text-sm leading-7">
    <p>{query.data.vehicle ? `${query.data.vehicle.make} ${query.data.vehicle.model}` : "خودرویی ثبت نشده است."}</p>
    <p className="text-muted">شناسه: <bdi dir="ltr" className="font-mono text-ink">{query.data.id}</bdi></p>
    {query.data.evidence.length === 0 && <p className="text-muted">هنوز تصویری ثبت نشده است.</p>}
  </div>;
}
