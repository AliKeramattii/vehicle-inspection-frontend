"use client";
import Link from "next/link";
import {useState} from "react";
import {PrimaryButton,SecondaryButton} from "@/components/ui/button";
import {InlineAlert} from "@/components/ui/status";
import {Icon} from "@/components/ui/icon";
import {IranianPlate} from "@/components/vehicle/iranian-plate";
import {PhotoImage} from "@/features/photography/photo-image";
import {useReviewerActor} from "./reviewer-shell";
import {useReviewWorkspace} from "./use-review-workspace";
import {caseStatusLabels} from "./model";
import {EvidencePreview} from "./evidence-preview";
export function ReviewerWorkspace({caseId}:{caseId:string}){
 const actor=useReviewerActor(),{query,refresh,repository}=useReviewWorkspace(actor),[selected,setSelected]=useState<string>(),[reason,setReason]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[reference,showReference]=useState(false),[lastDecision,setLastDecision]=useState<"approved"|"rejected">("approved");
 const record=query.data?.cases.find(c=>c.id===caseId);
 const jobs=record?.summary.jobs??[];
 const job=jobs.find(j=>j.id===selected)??jobs[0],vehicle=record?.summary.inspection.vehicle,location=record?.summary.inspection.location;
 async function decide(decision:"approved"|"rejected"){
  if(!record||!job||busy)return;setBusy(true);setLastDecision(decision);setError("");
  try{await repository.decide(actor,record.id,job.requirementId??job.evidenceKind,job.revision,decision,decision==="rejected"?reason:undefined);setReason("");await refresh();}
  catch(cause){setError(cause instanceof Error?cause.message:"ثبت تصمیم ممکن نشد.");}finally{setBusy(false);}
 }
 if(query.isError)return <InlineAlert tone="warning">خواندن پرونده‌ها ممکن نشد.<SecondaryButton onClick={()=>void refresh()}>تلاش دوباره</SecondaryButton></InlineAlert>;
 if(query.isPending)return <p role="status" className="operations-empty">در حال خواندن پرونده…</p>;
 if(!record)return <InlineAlert tone="warning">این پرونده در صف شما نیست.<Link href="/reviewer">بازگشت به صف بررسی</Link></InlineAlert>;
 const decision=record.decisions.find(d=>d.revision===job?.revision&&d.requirementId===(job?.requirementId??job?.evidenceKind));
 const sample=record.template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===job?.requirementId)?.sampleImage;
 return <div className="review-workspace-grid">
 <aside className="review-facts"><Link className="reviewer-action" href="/reviewer">بازگشت به صف بررسی</Link><section><h2>اطلاعات پرونده</h2><bdi>{record.reference}</bdi><p className="review-case-status" data-status={record.status}>{caseStatusLabels[record.status]}</p><p>ارسال: {new Date(record.submittedAt).toLocaleString("fa-IR")}</p></section><section><h2>مشخصات خودرو</h2><p>{vehicle?.make} {vehicle?.model}</p><p>{vehicle?.year.toLocaleString("fa-IR")} · {vehicle?.colorName}</p>{vehicle&&<IranianPlate plate={vehicle.plate}/>}<p><bdi>{vehicle?.vinMasked}</bdi></p><p>کیلومتر: {record.summary.odometer?.kilometers.toLocaleString("fa-IR")} کیلومتر</p></section><section><h2>موقعیت ثبت‌شده</h2><p>{location?.formattedAddress}</p>{location&&<bdi>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</bdi>}</section><section><h2>تاریخچه تصمیم‌ها</h2><ul>{record.decisions.map(d=><li key={d.id}><strong>{d.decision==="approved"?"تأیید":"درخواست ثبت مجدد"}</strong><p>{jobs.find(j=>j.revision===d.revision)?.title??d.requirementId}</p>{d.reason&&<p>{d.reason}</p>}</li>)}</ul></section></aside>
 <section className="review-evidence-column"><div className="operations-heading"><h1>بررسی مدارک</h1><bdi>{record.reference}</bdi></div>{job&&<div className="review-main-frame"><EvidencePreview key={job.id} job={job}/></div>}
 <div className="review-shot-strip" aria-label="انتخاب مدرک">{jobs.map((j,i)=><button key={j.id} type="button" aria-pressed={job?.id===j.id} onClick={()=>{setSelected(j.id);setReason("");showReference(false);}}><span>{(i+1).toLocaleString("fa-IR")}</span><Icon name={j.evidenceKind==="photo"?"camera":"video"} size={23}/>{j.title}</button>)}</div></section>
 <aside className="review-decisions"><section><h2>{job?.title??"جزئیات مدرک"}</h2><p className="review-true-success">{job?.upload==="uploaded"&&<Icon name="check" size={18}/>}ارسال فایل: {job?.upload==="uploaded"?"تکمیل شده":"در انتظار ارسال"}</p><p className="review-true-success">{decision?.decision==="approved"&&<Icon name="check" size={18}/>}تصمیم کارشناس: {decision?(decision.decision==="approved"?"تأیید شد":"نیاز به ثبت مجدد"):"هنوز بررسی نشده"}</p><p className="review-revision"><bdi>{job?.revision}</bdi></p>{sample&&<><SecondaryButton onClick={()=>showReference(v=>!v)} aria-expanded={reference}>نمایش نمونه راهنما</SecondaryButton>{reference&&<PhotoImage src={sample} alt={"نمونه راهنما: "+job?.title} frame="comparison"/>}</>}</section>
 <section><h2>تصمیم کارشناس</h2><label htmlFor="review-reason">دلیل درخواست ثبت مجدد</label><textarea id="review-reason" value={reason} maxLength={500} disabled={busy||!!decision} onChange={e=>setReason(e.target.value)} placeholder="برای نمونه: پلاک خوانا نیست."/>
 <div className="review-decision-actions"><PrimaryButton disabled={!job||!!decision} loading={busy} onClick={()=>void decide("approved")}><Icon name="check" size={20}/>تأیید مدرک</PrimaryButton><SecondaryButton disabled={!job||!!decision||!reason.trim()||busy} onClick={()=>void decide("rejected")}>درخواست ثبت مجدد</SecondaryButton></div>{decision?.reason&&<InlineAlert tone="warning">{decision.reason}</InlineAlert>}{error&&<InlineAlert tone="destructive">{error}<SecondaryButton onClick={()=>void decide(lastDecision)}>تلاش دوباره</SecondaryButton></InlineAlert>}</section>
 <InlineAlert>محیط نمونه محلی است. تأیید کارشناس با تکمیل ارسال فایل متفاوت است.</InlineAlert></aside>
 </div>;
}
