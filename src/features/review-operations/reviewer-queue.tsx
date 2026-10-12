"use client";
import Link from "next/link";
import {useState} from "react";
import {IranianPlate} from "@/components/vehicle/iranian-plate";
import {InlineAlert} from "@/components/ui/status";
import {SecondaryButton} from "@/components/ui/button";
import {useReviewerActor} from "./reviewer-shell";
import {useReviewWorkspace} from "./use-review-workspace";
import {caseStatusLabels} from "./model";
export function ReviewerQueue(){
 const actor=useReviewerActor(),{query}=useReviewWorkspace(actor),[search,setSearch]=useState("");
 const cases=query.data?.cases.filter(c=>(c.reference+" "+c.summary.inspection.vehicle?.model).includes(search))??[];
 return <section className="reviewer-queue"><div className="operations-heading"><div><h1>صف بررسی</h1><p>فقط پرونده‌های ارجاع‌شده به شما نمایش داده می‌شوند.</p></div><SecondaryButton onClick={()=>void query.refetch()}>بازخوانی صف</SecondaryButton></div>
 <label className="reviewer-search">جست‌وجوی پرونده<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="مرجع یا مدل خودرو"/></label>
 {query.isPending&&<p role="status">در حال خواندن صف بررسی…</p>}{query.isError&&<InlineAlert tone="destructive">خواندن صف ممکن نشد.<SecondaryButton onClick={()=>void query.refetch()}>تلاش دوباره</SecondaryButton></InlineAlert>}
 <div className="reviewer-table-scroll"><table><thead><tr><th>مرجع</th><th>خودرو</th><th>پلاک</th><th>زمان ارسال</th><th>وضعیت</th><th>مدارک</th><th>عملیات</th></tr></thead><tbody>{cases.map(c=><tr key={c.id}><td><bdi>{c.reference}</bdi></td><td>{c.summary.inspection.vehicle?.make} {c.summary.inspection.vehicle?.model}</td><td>{c.summary.inspection.vehicle&&<IranianPlate plate={c.summary.inspection.vehicle.plate}/>}</td><td>{new Date(c.submittedAt).toLocaleString("fa-IR")}</td><td><span className="review-case-status" data-status={c.status}>{caseStatusLabels[c.status]}</span></td><td>{c.summary.jobs.length.toLocaleString("fa-IR")}</td><td><Link className="reviewer-action" href={"/reviewer/cases/"+encodeURIComponent(c.id)}>مشاهده پرونده</Link></td></tr>)}</tbody></table>{!query.isPending&&!cases.length&&<p className="operations-empty">پرونده‌ای به شما ارجاع نشده است.</p>}</div>
 </section>;
}
