"use client";
import Link from "next/link";
import {useEffect,useRef,useState} from "react";
import {PrimaryButton,SecondaryButton} from "@/components/ui/button";
import {InlineAlert} from "@/components/ui/status";
import {Icon} from "@/components/ui/icon";
import {IranianPlate} from "@/components/vehicle/iranian-plate";
import {PhotoImage} from "@/features/photography/photo-image";
import {useReviewerActor} from "./reviewer-shell";
import {useReviewWorkspace} from "./use-review-workspace";
import {caseStatusLabels} from "./model";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Circle, Info } from "lucide-react";
import { NativeDialog } from "@/components/ui/native-dialog";
import { evidenceDecision, reviewCounts } from "./review-presentation";
import {EvidencePreview, EvidenceThumbnail} from "./evidence-preview";
export function ReviewerWorkspace({caseId}:{caseId:string}){
 const actor=useReviewerActor(),{query,refresh,repository}=useReviewWorkspace(actor),[selected,setSelected]=useState<string>(),[reason,setReason]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[reference,showReference]=useState(false),[lastDecision,setLastDecision]=useState<"approved"|"rejected">("approved");
 const [details,setDetails]=useState(false), strip=useRef<HTMLDivElement>(null);
 const record=query.data?.cases.find(c=>c.id===caseId);
 const jobs=record?.summary.jobs??[];
 const job=jobs.find(j=>j.id===selected)??jobs[0],vehicle=record?.summary.inspection.vehicle,location=record?.summary.inspection.location;
 const selectedIndex=jobs.findIndex(candidate=>candidate.id===job?.id);
 const select=(id:string)=>{setSelected(id);setReason("");setError("");showReference(false);};
 useEffect(()=>{strip.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"});},[job?.id]);
 async function decide(decision:"approved"|"rejected"){
  if(!record||!job||busy)return;setBusy(true);setLastDecision(decision);setError("");
  try{await repository.decide(actor,record.id,job.requirementId??job.evidenceKind,job.revision,decision,decision==="rejected"?reason:undefined);setReason("");await refresh();}
  catch(cause){setError(cause instanceof Error?cause.message:"ثبت تصمیم ممکن نشد.");}finally{setBusy(false);}
 }
 if(query.isError)return <InlineAlert tone="warning">خواندن پرونده‌ها ممکن نشد.<SecondaryButton onClick={()=>void refresh()}>تلاش دوباره</SecondaryButton></InlineAlert>;
 if(query.isPending)return <p role="status" className="operations-empty">در حال خواندن پرونده…</p>;
 if(!record)return <InlineAlert tone="warning">این پرونده در صف شما نیست.<Link href="/reviewer">بازگشت به صف بررسی</Link></InlineAlert>;
 const decision=evidenceDecision(record,job), counts=reviewCounts(record);
 const sample=record.template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===job?.requirementId)?.sampleImage;
 const facts=<><Link className="reviewer-action" href="/reviewer">بازگشت به صف بررسی</Link><section><h2>اطلاعات پرونده</h2><bdi>{record.reference}</bdi><p>ارسال: {new Date(record.submittedAt).toLocaleString("fa-IR")}</p></section><section><h2>مشخصات خودرو</h2><p>{vehicle?.make} {vehicle?.model}</p><p>{vehicle?.year.toLocaleString("fa-IR")} · {vehicle?.colorName}</p>{vehicle&&<IranianPlate plate={vehicle.plate}/>}<p><bdi>{vehicle?.vinMasked}</bdi></p><p>کیلومتر: {record.summary.odometer?.kilometers.toLocaleString("fa-IR")} کیلومتر</p></section><section><h2>موقعیت ثبت‌شده</h2><p>{location?.formattedAddress}</p>{location&&<bdi>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</bdi>}</section><section><h2>تاریخچه تصمیم‌ها</h2><ul>{record.decisions.map(d=><li key={d.id}><strong>{d.decision==="approved"?"تأیید":"درخواست ثبت مجدد"}</strong><p>{jobs.find(j=>j.revision===d.revision)?.title??d.requirementId}</p>{d.reason&&<p>{d.reason}</p>}</li>)}</ul></section></>;
 return <div className="review-workspace"><header className="review-workspace-header"><div><h1>بررسی مدارک</h1><p><bdi>{record.reference}</bdi><span className="review-case-status" data-status={record.status}>{caseStatusLabels[record.status]}</span></p></div><div className="review-workspace-counts"><span><Check size={16}/>{counts.approved.toLocaleString("fa-IR")} تأیید</span><span><RotateCcw size={16}/>{counts.attention.toLocaleString("fa-IR")} ثبت مجدد</span><span>{counts.remaining.toLocaleString("fa-IR")} بررسی‌نشده</span></div><SecondaryButton className="review-case-details-toggle" onClick={()=>setDetails(true)}><Info size={18}/>اطلاعات پرونده</SecondaryButton></header><div className="review-workspace-grid">
 <aside className="review-facts">{facts}</aside>
 <section className="review-evidence-column"><div className="review-evidence-toolbar"><strong>{job?.title??"مدارک پرونده"}</strong><div><SecondaryButton aria-label="مدرک قبلی" disabled={selectedIndex<=0||busy} onClick={()=>select(jobs[selectedIndex-1].id)}><ArrowRight size={18}/></SecondaryButton><span>{(selectedIndex+1).toLocaleString("fa-IR")} از {jobs.length.toLocaleString("fa-IR")}</span><SecondaryButton aria-label="مدرک بعدی" disabled={selectedIndex>=jobs.length-1||busy} onClick={()=>select(jobs[selectedIndex+1].id)}><ArrowLeft size={18}/></SecondaryButton></div></div>{job&&<div className="review-main-frame"><EvidencePreview key={job.id} job={job}/></div>}
 <div className="review-shot-strip" ref={strip} aria-label="انتخاب مدرک">{jobs.map((item,index)=>{const state=evidenceDecision(record,item)?.decision??"pending",Glyph=state==="approved"?Check:state==="rejected"?RotateCcw:Circle;return <button key={item.id} type="button" aria-label={item.title+"، "+(state==="approved"?"تأیید شده":state==="rejected"?"نیاز به ثبت مجدد":"بررسی نشده")} aria-pressed={job?.id===item.id} data-decision={state} disabled={busy} onClick={()=>select(item.id)}><EvidenceThumbnail job={item}/><span className="review-shot-number">{(index+1).toLocaleString("fa-IR")}</span><strong>{item.title}</strong><small><Glyph size={12} aria-hidden="true"/>{state==="approved"?"تأیید شده":state==="rejected"?"ثبت مجدد":"بررسی نشده"}</small></button>;})}</div></section>
 <aside className="review-decisions"><section><h2>{job?.title??"جزئیات مدرک"}</h2><p className="review-evidence-state" data-state={job?.upload === "uploaded" ? "uploaded" : "pending"}>{job?.upload==="uploaded"&&<Icon name="cloud" size={18}/>}ارسال فایل: {job?.upload==="uploaded"?"تکمیل شده":"در انتظار ارسال"}</p><p className="review-evidence-state" data-state={decision?.decision ?? "pending"}>{decision?.decision==="approved"&&<Icon name="check" size={18}/>}تصمیم کارشناس: {decision?(decision.decision==="approved"?"تأیید شد":"نیاز به ثبت مجدد"):"هنوز بررسی نشده"}</p><details className="review-revision"><summary>جزئیات نسخه مدرک</summary><bdi>{job?.revision}</bdi></details>{sample&&<><SecondaryButton onClick={()=>showReference(v=>!v)} aria-expanded={reference}>نمایش نمونه راهنما</SecondaryButton>{reference&&<PhotoImage src={sample} alt={"نمونه راهنما: "+job?.title} frame="comparison"/>}</>}</section>
 <section><h2>تصمیم کارشناس</h2><label htmlFor="review-reason">دلیل درخواست ثبت مجدد</label><textarea aria-describedby="review-reason-help" id="review-reason" value={reason} maxLength={500} disabled={busy||!!decision} onChange={e=>setReason(e.target.value)} placeholder="برای نمونه: پلاک خوانا نیست."/>
 <p id="review-reason-help" className="review-reason-help">علت مشخص را بنویسید؛ درخواست فقط برای همین مدرک ثبت می‌شود.</p><div className="review-reason-presets" aria-label="دلایل پیشنهادی">{["تصویر تار است.","نور کافی نیست.",job?.requirementId?.includes("plate")?"پلاک خوانا نیست.":job?.requirementId==="odometer-on"?"عدد کیلومتر خوانا نیست.":job?.evidenceKind==="video-360"?"خودرو کامل در ویدیو دیده نمی‌شود.":"بخشی از خودرو خارج از کادر است."].map(preset=><button type="button" key={preset} disabled={busy||!!decision} onClick={()=>setReason(preset)}>{preset}</button>)}</div>
 <div className="review-decision-actions"><PrimaryButton disabled={!job||!!decision} loading={busy} onClick={()=>void decide("approved")}><Icon name="check" size={20}/>تأیید مدرک</PrimaryButton><SecondaryButton disabled={!job||!!decision||!reason.trim()||busy} onClick={()=>void decide("rejected")}>درخواست ثبت مجدد</SecondaryButton></div>{decision&&<p className="review-decision-saved" role="status">تصمیم این نسخه ثبت شد. برای ادامه، مدرک بعدی را انتخاب کنید.</p>}{decision?.reason&&<InlineAlert tone="warning">{decision.reason}</InlineAlert>}{error&&<InlineAlert tone="destructive">{error}<SecondaryButton onClick={()=>void decide(lastDecision)}>تلاش دوباره</SecondaryButton></InlineAlert>}</section>
 <InlineAlert>محیط نمونه محلی است. تأیید کارشناس با تکمیل ارسال فایل متفاوت است.</InlineAlert></aside>
 </div>{details&&<NativeDialog title="اطلاعات پرونده" className="reviewer-case-dialog" onDismiss={()=>setDetails(false)}><div className="review-facts">{facts}</div></NativeDialog>}</div>;
}
