"use client";
import { ClipboardList, UserRoundPlus, RotateCcw, CheckCheck } from "lucide-react";
import { AdminLink, useAdmin } from "./admin-context";
import { useReviewWorkspace } from "@/features/review-operations/use-review-workspace";
import { reviewerWorkload } from "@/features/review-operations/model";
import { persian } from "./admin-common";
import { InlineAlert } from "@/components/ui/status";
export function OperationalSnapshot() {
  const {actor} = useAdmin();
  return actor.role === "platform-admin" ? <Snapshot actorId={actor.id}/> : null;
}
function Snapshot({actorId}:{actorId:string}) {
  const {query} = useReviewWorkspace({id:actorId,role:"platform-admin"}), data=query.data;
  const metrics=[{label:"در انتظار ارجاع",status:"awaiting-assignment",icon:UserRoundPlus},{label:"در حال بررسی",status:"in-review",icon:ClipboardList},{label:"نیاز به مدرک تکمیلی",status:"needs-more-evidence",icon:RotateCcw},{label:"بررسی تکمیل شد",status:"review-complete",icon:CheckCheck}];
  return <section className="operations-snapshot" aria-label="وضعیت عملیاتی پرونده‌ها" aria-busy={query.isPending}>
    <div className="operations-section-heading"><div><h2>وضعیت پرونده‌ها</h2><p>بازدیدهای ارسال‌شده در همین محیط نمونه</p></div><AdminLink href="/admin/assignments" className="admin-text-action">تنظیمات ارجاع</AdminLink></div>
    {query.isError ? <InlineAlert tone="warning">خواندن وضعیت پرونده‌ها ممکن نشد.<button type="button" className="admin-text-action" onClick={()=>void query.refetch()}>تلاش مجدد</button></InlineAlert> : <>
      <div className="operations-metrics">{metrics.map(({label,status,icon:Glyph})=><div key={status} data-status={status}><Glyph size={20} aria-hidden="true"/><span>{label}</span><strong>{query.isPending ? "…" : persian(data?.cases.filter(record=>record.status===status).length??0)}</strong></div>)}</div>
      {data&&<div className="operations-workload"><h3>بار کاری کارشناسان</h3>{data.reviewers.map(reviewer=><div key={reviewer.id}><span>{reviewer.name}<small>{reviewer.active ? "فعال" : "غیرفعال"}</small></span><meter min={0} max={Math.max(1,reviewer.capacity)} value={reviewerWorkload(data,reviewer.id)} aria-label={"بار کاری "+reviewer.name}/><bdi>{persian(reviewerWorkload(data,reviewer.id))} / {persian(reviewer.capacity)}</bdi></div>)}</div>}
    </>}
  </section>;
}
