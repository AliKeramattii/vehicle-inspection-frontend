"use client";
import Image from "next/image";
import {useEffect,useRef,useState} from "react";
import {Camera,Video,ImageOff} from "lucide-react";
import {photoRevisionKey,readPhoto} from "@/lib/media/photo-store";
import {indexedDBCaptureDataStore} from "@/lib/media/capture-data-store";
import {photoRevision,type UploadJob} from "@/features/upload/upload-model";
import {InlineAlert} from "@/components/ui/status";
import {readImageHeader} from "@/lib/media/image-header";
import type {ThumbnailCache} from "@/lib/media/thumbnail-cache";
import {SecondaryButton} from "@/components/ui/button";
async function evidenceBlob(job:Pick<UploadJob,"namespace"|"evidenceKind"|"localBlobKey"|"revision">) {
 if(job.evidenceKind==="photo"){const record=await readPhoto(job.localBlobKey);if(record&&photoRevision(record)===job.revision&&record.blob)return record.blob;const historical=await readPhoto(photoRevisionKey(job.localBlobKey,job.revision));if(historical?.blob&&photoRevision(historical)===job.revision)return historical.blob;}
 else {const data=await indexedDBCaptureDataStore.get(job.namespace);if(data.video360?.accepted?.metadata.localBlobKey===job.revision)return data.video360.accepted.blob;}
 throw new Error("Evidence unavailable");
}
async function previewBlob(blob:Blob) {
 const dimensions=await readImageHeader(blob);
 const orientedWidth=dimensions&&dimensions.orientation>=5&&dimensions.orientation<=8?dimensions.height:dimensions?.width;
 const bitmap=await createImageBitmap(blob,{imageOrientation:"from-image",...(orientedWidth?{resizeWidth:Math.min(280,orientedWidth),resizeQuality:"high" as const}:{})});
 try {const ratio=Math.min(1,280/bitmap.width,168/bitmap.height),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));canvas.getContext("2d")!.drawImage(bitmap,0,0,canvas.width,canvas.height);return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Preview unavailable")),"image/jpeg",.75));}
 finally {bitmap.close();}
}
export function EvidencePreview({job,compact=false,cache}:{job:UploadJob;compact?:boolean;cache?:ThumbnailCache}) {
 const {namespace,evidenceKind,localBlobKey,revision}=job;
 const identity=JSON.stringify([namespace,evidenceKind,localBlobKey,revision,compact]);
 const[value,setValue]=useState<{identity:string;url?:string;error?:boolean}>(),[attempt,setAttempt]=useState(0);
 useEffect(()=>{let active=true,owned:string|undefined;
 const reference={namespace,evidenceKind,localBlobKey,revision};
 void(async()=>{const load=async()=>{const blob=await evidenceBlob(reference);return compact?previewBlob(blob):blob;};
  const display=compact&&cache?await cache.get(identity,load):await load();if(!active)return;owned=URL.createObjectURL(display);setValue({identity,url:owned});
 })().catch(()=>{if(active)setValue({identity,error:true});});
 return()=>{active=false;if(owned)URL.revokeObjectURL(owned);};
 },[namespace,evidenceKind,localBlobKey,revision,identity,compact,cache,attempt]);
 const current=value?.identity===identity?value:undefined,url=current?.url;
 if(current?.error)return compact?<ImageOff size={22} aria-hidden="true"/>:<InlineAlert tone="warning">این نسخه مدرک روی این دستگاه در دسترس نیست. داده‌های پرونده حفظ شده‌اند؛ دریافت از سرور به سرویس آینده نیاز دارد.<SecondaryButton onClick={()=>{setValue(undefined);setAttempt(value=>value+1);}}>تلاش دوباره برای نمایش مدرک</SecondaryButton></InlineAlert>;
 if(!url)return <div className="review-evidence-loading" role={compact?undefined:"status"}>{compact?<Camera size={22} aria-hidden="true"/>:<><Camera size={36} aria-hidden="true"/><p>در حال خواندن مدرک…</p><small>نسخه ثبت‌شده روی دستگاه</small></>}</div>;
 return evidenceKind==="video-360"?<video className="review-evidence-media" src={url} controls playsInline preload="metadata" aria-label="ویدیوی ثبت‌شده بازدید"/>:compact?<Image unoptimized width={140} height={84} src={url} alt="" className="review-thumbnail-image" onError={()=>setValue({identity,error:true})}/>:<Image unoptimized fill sizes="(max-width: 1100px) 90vw, 60vw" className="review-evidence-media" src={url} alt={"مدرک ثبت‌شده: "+job.title} onError={()=>setValue({identity,error:true})}/>;
}
/** Only visible thumbnails decode their own current revision; video bytes are never loaded for a thumbnail. */
export function EvidenceThumbnail({job,cache}:{job:UploadJob;cache?:ThumbnailCache}) {
 const target=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false);
 useEffect(()=>{const element=target.current;if(!element)return;const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting));observer.observe(element);return()=>observer.disconnect();},[]);
 return <span className="review-thumbnail" ref={target} aria-hidden="true">{job.evidenceKind==="video-360"?<Video size={26}/>:visible?<EvidencePreview key={job.revision} job={job} compact cache={cache}/>:<Camera size={22}/>}</span>;
}
