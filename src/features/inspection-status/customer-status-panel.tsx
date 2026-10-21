"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/auth-workflow-provider";
import { saveMockVerifiedSession } from "@/features/identity/source-context";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { NativeDialog } from "@/components/ui/native-dialog";
import type { Vehicle } from "@/types/domain";
import { lifecycleRepository } from "./lifecycle-repository";
import { lifecycleLabels, lifecycleCopy, forwardingPhaseLabels, type CustomerInspectionStatus } from "./lifecycle-model";
import { VehicleCorrectionEditor } from "./vehicle-correction-editor";
import "./customer-status.css";
export function CustomerStatusPanel({record,vehicle,showHeading=true}:{record:CustomerInspectionStatus;vehicle?:Vehicle|null;showHeading?:boolean}) {
 const {source,store}=useAuthContext(), router=useRouter(), [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
 return <section className="customer-inspection-status" data-lifecycle={record.status} aria-label="وضعیت بازدید">
 {showHeading&&<div role="status"><h3>{lifecycleLabels[record.status]}</h3><p>{lifecycleCopy[record.status]}</p></div>}
 {record.source==="mock"&&<small>وضعیت آزمایشی این مرورگر؛ سرویس واقعی بررسی و ارسال متصل نیست.</small>}
 {record.forwarding&&<p role="status">{forwardingPhaseLabels[record.forwarding.phase]}</p>}
 {record.customerExplanation&&<p className="customer-reviewer-reason">{record.customerExplanation}</p>}
 {record.status==="CHANGES_REQUESTED"&&record.corrections.length>0&&<><p>{record.corrections.filter(c=>c.state==="approved").length.toLocaleString("fa-IR")} از {record.corrections.length.toLocaleString("fa-IR")} اصلاح مشخصات تأیید شده</p>{record.corrections.map(task=><VehicleCorrectionEditor key={task.id+task.state} task={task} inspectionId={record.inspectionId} vehicle={vehicle}/>)}</>}
 {record.status==="REJECTED"&&<SecondaryButton onClick={()=>setConfirm(true)}>شروع بازدید جدید</SecondaryButton>}
 {record.status==="FORWARD_FAILED"&&<p>مدارک و تأیید کارشناس محفوظ‌اند. ارسال مجدد باید توسط سرویس کارگزاری پیگیری شود.</p>}
 {confirm&&<NativeDialog title="شروع بازدید جدید" onDismiss={()=>{if(!busy)setConfirm(false);}}><p>بازدید ردشده و دلیل کارشناس حفظ می‌شوند. همه تصاویر، کیلومتر و ویدیوی بازدید جدید باید از ابتدا ثبت شوند.</p>{error&&<InlineAlert tone="destructive">{error}</InlineAlert>}<div className="customer-restart-actions"><SecondaryButton disabled={busy} onClick={()=>setConfirm(false)}>بازگشت</SecondaryButton><PrimaryButton loading={busy} onClick={async()=>{setBusy(true);setError("");try{const scope=await source.resolve(),next=await lifecycleRepository.restart(scope,record.inspectionId);saveMockVerifiedSession(scope,next.inspectionId);store.getState().setWorkflow({stage:"verified",mobile:scope.mobile,inspectionId:next.inspectionId});router.push("/readiness");}catch(e){setError(e instanceof Error?e.message:"شروع بازدید جدید ممکن نشد.");setBusy(false);}}}>ثبت بازدید جدید و شروع</PrimaryButton></div></NativeDialog>}
 </section>;
}
