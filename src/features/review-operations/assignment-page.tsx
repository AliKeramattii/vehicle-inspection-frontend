"use client";
import { useSearchParams } from "next/navigation";
import {useState} from "react";
import {useAdmin} from "@/features/admin/admin-context";
import {AdminPageHeading} from "@/features/admin/admin-common";
import {SecondaryButton} from "@/components/ui/button";
import {InlineAlert} from "@/components/ui/status";
import {useReviewWorkspace} from "./use-review-workspace";
import {caseLifecycle,reviewerWorkload} from "./model";
import { lifecycleLabels } from "@/features/inspection-status/lifecycle-model";
import { filterReviewCases } from "./review-presentation";
import "./case-decisions.css";
export function AssignmentPage(){
 const params=useSearchParams(),[search,setSearch]=useState(""),[status,setStatus]=useState(params.get("status")??"all");
 const {actor}=useAdmin(),{query,refresh,repository}=useReviewWorkspace(actor),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function run(action:()=>Promise<unknown>){setError("");setBusy(true);try{await action();await refresh();}catch(cause){setError(cause instanceof Error?cause.message:"ذخیره ممکن نشد.");}finally{setBusy(false);}}
 if(actor.role!=="platform-admin")return <InlineAlert tone="warning">تنظیمات ارجاع فقط برای مدیر سایت مجاز است.</InlineAlert>;
 const w=query.data;
 const cases=filterReviewCases(w?.cases??[],search,status);
 return <div className="admin-page-scroll assignment-page"><AdminPageHeading title="تنظیمات ارجاع پرونده‌ها" description="ارجاع محلی پرونده‌های ارسال‌شده؛ ظرفیت کارشناسان پیش از هر ارجاع بررسی می‌شود."/>
 {query.isPending&&<p role="status">در حال خواندن پرونده‌ها…</p>}{(error||query.error)&&<InlineAlert tone="destructive">{error||"خواندن پرونده‌ها ممکن نشد."}<SecondaryButton onClick={()=>void query.refetch()}>تلاش دوباره</SecondaryButton></InlineAlert>}
 {w&&<><section className="admin-panel admin-panel-padding assignment-settings"><h2>روش ارجاع</h2><label><input type="radio" name="assignment-mode" value="manual" checked={w.mode==="manual"} disabled={busy} onChange={()=>void run(()=>repository.setMode(actor,"manual"))}/>دستی</label><label><input type="radio" name="assignment-mode" value="random" checked={w.mode==="random"} disabled={busy} onChange={()=>void run(()=>repository.setMode(actor,"random"))}/>تصادفی با رعایت ظرفیت</label><p>{w.cases.filter(c=>!c.reviewerId).length.toLocaleString("fa-IR")} پرونده در انتظار ارجاع</p></section>
 <section className="admin-panel admin-table-wrap"><table><caption>ظرفیت کارشناسان</caption><thead><tr><th>کارشناس</th><th>پرونده جاری</th><th>حداکثر ظرفیت</th><th>وضعیت</th></tr></thead><tbody>{w.reviewers.map(r=><tr key={r.id}><td>{r.name}</td><td>{reviewerWorkload(w,r.id).toLocaleString("fa-IR")}</td><td><input className="assignment-capacity" aria-label={"ظرفیت "+r.name} type="number" min={0} max={100} defaultValue={r.capacity} key={r.capacity} disabled={busy} onBlur={e=>{const next=Number(e.target.value);if(next!==r.capacity)void run(()=>repository.setCapacity(actor,r.id,next));}}/></td><td>{r.active?"فعال":"غیرفعال"}</td></tr>)}</tbody></table></section>
 <section className="admin-panel admin-table-wrap"><div className="operations-filter-bar"><label>جست‌وجوی پرونده<input aria-label="جست‌وجوی پرونده‌های کارگزاری" placeholder="کد پیگیری، تلفن مشتری یا پلاک" value={search} onChange={e=>setSearch(e.target.value)}/></label><label>وضعیت پرونده<select aria-label="وضعیت پرونده" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">همه وضعیت‌ها</option><option value="awaiting-assignment">در انتظار ارجاع</option>{Object.entries(lifecycleLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><span role="status">{cases.length.toLocaleString("fa-IR")} پرونده</span></div><table><caption>پرونده‌ها</caption><thead><tr><th>مرجع</th><th>خودرو</th><th>وضعیت</th><th>کارشناس</th><th>ارجاع / تغییر ارجاع</th></tr></thead><tbody>{cases.map(c=><tr key={c.id}><td><bdi>{c.reference}</bdi>{c.customerPhone&&<small dir="ltr">{c.customerPhone}</small>}</td><td>{c.summary.inspection.vehicle?.model}</td><td>{lifecycleLabels[caseLifecycle(c)]}</td><td>{w.reviewers.find(r=>r.id===c.reviewerId)?.name??"تخصیص داده نشده"}</td><td><select aria-label={"ارجاع "+c.reference} value={c.reviewerId??""} disabled={busy||!!c.finalDecision} onChange={e=>{const selected=e.target.value;if(selected)void run(()=>repository.assign(actor,c.id,selected,Boolean(c.reviewerId)));}}><option value="">انتخاب کارشناس</option>{w.reviewers.map(r=><option key={r.id} value={r.id} disabled={!r.active||(r.id!==c.reviewerId&&reviewerWorkload(w,r.id)>=r.capacity)}>{r.name}</option>)}</select></td></tr>)}</tbody></table>{!cases.length&&<p className="operations-empty">هنوز بازدیدی در این مرورگر ارسال نشده است. پس از ارسال مشتری، پرونده در این فهرست ظاهر می‌شود.</p>}</section>
 <section className="admin-panel admin-panel-padding"><h2>تاریخچه ارجاع</h2><ul className="admin-audit-list">{w.history.slice().reverse().slice(0,20).map((h,i)=><li key={i}><bdi>{w.cases.find(c=>c.id===h.caseId)?.reference}</bdi><span>{w.reviewers.find(r=>r.id===h.from)?.name??"بدون کارشناس"} ← {w.reviewers.find(r=>r.id===h.to)?.name}</span><time>{new Date(h.at).toLocaleString("fa-IR")}</time></li>)}</ul></section>
 <SecondaryButton disabled={busy} onClick={()=>void query.refetch()}>بازخوانی پرونده‌ها</SecondaryButton><InlineAlert>این محیط نمونه محلی است؛ احراز هویت، ارجاع هم‌زمان بین کاربران و تضمین ظرفیت تولید بر عهده سرور است.</InlineAlert></>}
 </div>;
}
