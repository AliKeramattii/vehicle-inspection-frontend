"use client";
import { useState } from "react";
import { SecondaryButton } from "@/components/ui/button";
import { NativeDialog } from "@/components/ui/native-dialog";
import type { UploadJob } from "@/features/upload/upload-model";
import type { ReviewCase } from "./model";
import { EvidencePreview } from "./evidence-preview";
export function RevisionComparison({record,current}:{record:ReviewCase;current:UploadJob}) {
 const [open,setOpen]=useState(false);
 const prior=record.evidenceHistory?.filter(j=>j.evidenceKind===current.evidenceKind&&j.requirementId===current.requirementId).at(-1);
 if(!prior)return null;
 return <><SecondaryButton onClick={()=>setOpen(true)}>مقایسه نسخه قبلی و جدید</SecondaryButton>{open&&<NativeDialog title="مقایسه نسخه‌های مدرک" className="review-revisions-dialog" onDismiss={()=>setOpen(false)}><div className="review-revisions-grid">{[{job:prior,title:"نسخه قبلی"},{job:current,title:"نسخه جدید"}].map(({job,title})=><section key={job.revision}><h3>{title}</h3><p>{job.title}</p><div className="review-main-frame"><EvidencePreview job={job}/></div><small><bdi>{job.revision}</bdi></small></section>)}</div><p>اگر نسخه قبلی روی این دستگاه موجود نباشد، بازیابی امن آن به سرویس آینده نیاز دارد. تاریخچه تصمیم‌ها حفظ می‌شود.</p><SecondaryButton onClick={()=>setOpen(false)}>بستن مقایسه</SecondaryButton></NativeDialog>}</>;
}
