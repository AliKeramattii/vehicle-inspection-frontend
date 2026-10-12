"use client";
import Image from "next/image";
import {useEffect,useState} from "react";
import {readPhoto} from "@/lib/media/photo-store";
import {indexedDBCaptureDataStore} from "@/lib/media/capture-data-store";
import {photoRevision,type UploadJob} from "@/features/upload/upload-model";
import {InlineAlert} from "@/components/ui/status";
export function EvidencePreview({job}:{job:UploadJob}){
 const[url,setUrl]=useState<string>(),[error,setError]=useState(false);
 useEffect(()=>{let active=true,owned:string|undefined;
 void(async()=>{let blob:Blob|undefined;
  if(job.evidenceKind==="photo"){const record=await readPhoto(job.localBlobKey);if(record&&photoRevision(record)===job.revision)blob=record.blob;}
  else{const data=await indexedDBCaptureDataStore.get(job.namespace);if(data.video360?.accepted?.metadata.localBlobKey===job.revision)blob=data.video360.accepted.blob;}
  if(!blob)throw new Error("Evidence unavailable");if(!active)return;owned=URL.createObjectURL(blob);setUrl(owned);
 })().catch(()=>{if(active)setError(true);});return()=>{active=false;if(owned)URL.revokeObjectURL(owned);};
 },[job]);
 if(error)return <InlineAlert tone="warning">این نسخه مدرک روی این دستگاه در دسترس نیست. نمایش آن به سرویس دریافت مدارک نیاز دارد.</InlineAlert>;
 if(!url)return <div className="review-evidence-loading" role="status">در حال خواندن مدرک…</div>;
 return job.evidenceKind==="video-360"?<video className="review-evidence-media" src={url} controls playsInline preload="metadata" aria-label="ویدیوی ثبت‌شده بازدید"/>:<Image unoptimized fill sizes="65vw" className="review-evidence-media" src={url} alt={"مدرک ثبت‌شده: "+job.title}/>;
}
