"use client";
import Image from "next/image";
import {useEffect,useRef,useState} from "react";
import {Camera,Video,ImageOff} from "lucide-react";
import {readPhoto} from "@/lib/media/photo-store";
import {indexedDBCaptureDataStore} from "@/lib/media/capture-data-store";
import {photoRevision,type UploadJob} from "@/features/upload/upload-model";
import {InlineAlert} from "@/components/ui/status";
import {SecondaryButton} from "@/components/ui/button";
async function evidenceBlob(job:UploadJob) {
 if(job.evidenceKind==="photo"){const record=await readPhoto(job.localBlobKey);if(record&&photoRevision(record)===job.revision&&record.blob)return record.blob;}
 else {const data=await indexedDBCaptureDataStore.get(job.namespace);if(data.video360?.accepted?.metadata.localBlobKey===job.revision)return data.video360.accepted.blob;}
 throw new Error("Evidence unavailable");
}
async function previewBlob(blob:Blob) {
 const bitmap=await createImageBitmap(blob);
 try {const ratio=Math.min(1,280/bitmap.width,168/bitmap.height),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext("2d")!.drawImage(bitmap,0,0,canvas.width,canvas.height);return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Preview unavailable")),"image/jpeg",.75));}
 finally {bitmap.close();}
}
export function EvidencePreview({job,compact=false}:{job:UploadJob;compact?:boolean}) {
 const[url,setUrl]=useState<string>(),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true,owned:string|undefined;
 void(async()=>{const blob=await evidenceBlob(job),display=compact?await previewBlob(blob):blob;if(!active)return;owned=URL.createObjectURL(display);setUrl(owned);})().catch(()=>{if(active)setError(true);});
 return()=>{active=false;if(owned)URL.revokeObjectURL(owned);};
 },[job,compact,attempt]);
 if(error)return compact?<ImageOff size={22} aria-hidden="true"/>:<InlineAlert tone="warning">این نسخه مدرک روی این دستگاه در دسترس نیست. داده‌های پرونده حفظ شده‌اند؛ دریافت از سرور به سرویس آینده نیاز دارد.<SecondaryButton onClick={()=>{setUrl(undefined);setError(false);setAttempt(value=>value+1);}}>تلاش دوباره برای نمایش مدرک</SecondaryButton></InlineAlert>;
 if(!url)return <div className="review-evidence-loading" role={compact?undefined:"status"}>{compact?<Camera size={22} aria-hidden="true"/>:<><Camera size={36} aria-hidden="true"/><p>در حال خواندن مدرک…</p><small>نسخه ثبت‌شده روی دستگاه</small></>}</div>;
 return job.evidenceKind==="video-360"?<video className="review-evidence-media" src={url} controls playsInline preload="metadata" aria-label="ویدیوی ثبت‌شده بازدید"/>:compact?<Image unoptimized width={140} height={84} src={url} alt="" className="review-thumbnail-image" onError={()=>setError(true)}/>:<Image unoptimized fill sizes="(max-width: 1100px) 90vw, 60vw" className="review-evidence-media" src={url} alt={"مدرک ثبت‌شده: "+job.title} onError={()=>setError(true)}/>;
}
/** Only visible thumbnails decode their own current revision; video bytes are never loaded for a thumbnail. */
export function EvidenceThumbnail({job}:{job:UploadJob}) {
 const target=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{const element=target.current;if(!element)return;const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting));observer.observe(element);return()=>observer.disconnect();},[]);
 return <span className="review-thumbnail" ref={target} aria-hidden="true">{job.evidenceKind==="video-360"?<Video size={26}/>:visible?<EvidencePreview key={job.revision} job={job} compact/>:<Camera size={22}/>}</span>;
}
