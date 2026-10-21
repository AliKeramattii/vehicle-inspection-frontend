"use client";
import { useState } from "react";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { NativeDialog } from "@/components/ui/native-dialog";
import { fieldCorrectionLabels, forwardingPhaseLabels, type VehicleFieldCorrection } from "@/features/inspection-status/lifecycle-model";
import { IranianPlate } from "@/components/vehicle/iranian-plate";
import { canApproveInspection, type OperationsActor, type ReviewCase } from "./model";
import type { ReviewRepository } from "./repository";
import "./case-decisions.css";
export function CaseDecisionPanel({record,actor,repository,refresh}:{record:ReviewCase;actor:OperationsActor;repository:ReviewRepository;refresh:()=>Promise<unknown>}) {
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[note,setNote]=useState(""),[reason,setReason]=useState(""),[field,setField]=useState<VehicleFieldCorrection["field"]>("plate"),[fieldReason,setFieldReason]=useState(""),[confirm,setConfirm]=useState<"approved"|"rejected">();
 const own=actor.role==="reviewer"&&actor.id===record.reviewerId, locked=!own||!!record.finalDecision;
 async function run(action:()=>Promise<unknown>,done?:()=>void) { if(busy)return;setBusy(true);setError("");try{await action();await refresh();done?.();}catch(e){setError(e instanceof Error?e.message:"ثبت تصمیم ممکن نشد.");}finally{setBusy(false);} }
 return <section className="review-case-decisions" aria-label="تصمیم نهایی و یادداشت‌های پرونده">
 <h2>تصمیم کل بازدید</h2>{record.forwarding&&<p>{forwardingPhaseLabels[record.forwarding.phase]}</p>}
 {record.finalDecision?<><p>{record.finalDecision.kind==="approved"?"کل بازدید تأیید شده است. تأیید دریافت کارگزاری هنوز مستقل از این تصمیم است.":"کل بازدید رد شده است. دلیل زیر برای مشتری نمایش داده می‌شود."}</p>{record.finalDecision.customerReason&&<p className="review-public-reason">{record.finalDecision.customerReason}</p>}<small>ثبت توسط <bdi>{record.finalDecision.actorId}</bdi> · {new Date(record.finalDecision.at).toLocaleString("fa-IR")}</small></>:<>
 <p>تأیید هر مدرک، جای تصمیم نهایی پرونده را نمی‌گیرد.</p>
 <PrimaryButton disabled={locked||busy||!canApproveInspection(record)} onClick={()=>setConfirm("approved")}>تأیید کل بازدید</PrimaryButton>
 {!canApproveInspection(record)&&<small>ابتدا همه مدارک و اصلاحات لازم را جداگانه تأیید کنید.</small>}
 <label htmlFor="whole-rejection-reason">دلیل رد کل بازدید — قابل مشاهده برای مشتری</label><textarea id="whole-rejection-reason" maxLength={2000} value={reason} disabled={locked||busy} onChange={e=>setReason(e.target.value)}/>
 <SecondaryButton disabled={locked||busy||!reason.trim()} onClick={()=>setConfirm("rejected")}>رد کل بازدید</SecondaryButton>
 </>}
 <details><summary>اصلاح مشخصات خودرو</summary><p>فقط مشخصه انتخاب‌شده برای مشتری باز می‌شود.</p>
 {(record.fieldCorrections??[]).map(task=><div className="review-field-task" key={task.id}><strong>{fieldCorrectionLabels[task.field]}</strong><p className="review-public-reason">{task.customerReason}</p><p>{task.state==="requested"?"در انتظار اصلاح مشتری":task.state==="submitted"?"اصلاح مشتری آماده بررسی است":"اصلاح تأیید شد"}</p>{task.proposal&&(task.proposal.field==="plate"?<IranianPlate plate={task.proposal.value}/>:<p>مقدار پیشنهادی: {task.proposal.field==="modelYear"?task.proposal.value.toLocaleString("fa-IR"):task.proposal.value}</p>)}{task.state==="submitted"&&<SecondaryButton disabled={locked||busy} onClick={()=>void run(()=>repository.approveField(actor,record.id,task.id))}>تأیید اصلاح {fieldCorrectionLabels[task.field]}</SecondaryButton>}</div>)}
 {!record.finalDecision&&<><label htmlFor="correction-field">مشخصه نیازمند اصلاح<select id="correction-field" value={field} disabled={locked||busy} onChange={e=>{const value=e.target.value;if(value==="plate"||value==="color"||value==="modelYear")setField(value);}}>{Object.entries(fieldCorrectionLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label htmlFor="field-customer-reason">دلیل اصلاح مشخصات — قابل مشاهده برای مشتری<textarea id="field-customer-reason" maxLength={2000} value={fieldReason} disabled={locked||busy} onChange={e=>setFieldReason(e.target.value)}/></label><SecondaryButton disabled={locked||busy||!fieldReason.trim()} onClick={()=>void run(()=>repository.requestField(actor,record.id,field,fieldReason),()=>setFieldReason(""))}>درخواست اصلاح مشخصه</SecondaryButton></>}
 </details>
 <details><summary>یادداشت داخلی کارشناسان</summary><p>این یادداشت برای مشتری ارسال نمی‌شود.</p><ul>{record.internalNotes?.map((item,index)=><li key={index}><p className="review-public-reason">{item.text}</p><small><bdi>{item.actorId}</bdi> · {new Date(item.at).toLocaleString("fa-IR")}</small></li>)}</ul><label htmlFor="staff-note">یادداشت داخلی<textarea id="staff-note" value={note} maxLength={2000} disabled={!own||busy} onChange={e=>setNote(e.target.value)}/></label><SecondaryButton disabled={!own||busy||!note.trim()} onClick={()=>void run(()=>repository.note(actor,record.id,note),()=>setNote(""))}>ذخیره یادداشت داخلی</SecondaryButton></details>
 {error&&<InlineAlert tone="destructive">{error}</InlineAlert>}
 {confirm&&<NativeDialog title={confirm==="approved"?"تأیید نهایی کارشناس":"رد کل بازدید"} onDismiss={()=>{if(!busy)setConfirm(undefined);}}><p>{confirm==="approved"?"این تصمیم کل پرونده را تأیید می‌کند؛ ارسال واقعی به کارگزاری توسط سرویس آینده انجام می‌شود.":"دلیل کامل برای مشتری نمایش داده می‌شود. مدارک قبلی حفظ می‌شوند و شروع بازدید جدید با انتخاب مشتری خواهد بود."}</p>{confirm==="rejected"&&<p className="review-public-reason">{reason}</p>}{error&&<InlineAlert tone="destructive">{error}</InlineAlert>}<div className="admin-dialog-actions"><SecondaryButton disabled={busy} onClick={()=>setConfirm(undefined)}>بازگشت</SecondaryButton><PrimaryButton loading={busy} onClick={()=>void run(()=>repository.finalize(actor,record.id,confirm,confirm==="rejected"?reason:undefined),()=>setConfirm(undefined))}>{confirm==="approved"?"ثبت تأیید کل بازدید":"ثبت رد کل بازدید"}</PrimaryButton></div></NativeDialog>}
 </section>;
}
