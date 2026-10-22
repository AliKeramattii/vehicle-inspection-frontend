"use client";
import {useEffect,useRef,useState} from "react";
import type {PhotoDraft} from "@/lib/media/photo-store";
import type {ImagePolicy} from "@/lib/media/image-policy";
import {SecondaryButton} from "@/components/ui/button";
import {InlineAlert} from "@/components/ui/status";
import "./photo-optimization.css";
export type PhotoOptimizationHandlers={prepare:(policy:ImagePolicy,signal:AbortSignal)=>Promise<unknown>;choose:(revision:string,variant:"source"|"optimized")=>Promise<unknown>};
const bytes=(n:number)=>new Intl.NumberFormat("fa-IR",{maximumFractionDigits:0}).format(n/1024)+" کیلوبایت";
export function PhotoOptimizationControl({draft,policy,actions}:{draft:PhotoDraft;policy:ImagePolicy;actions:PhotoOptimizationHandlers}){
 const [busy,setBusy]=useState(false),[error,setError]=useState<string>();const operation=useRef<AbortController|undefined>(undefined);
 useEffect(()=>()=>{operation.current?.abort();operation.current=undefined;},[]);
 async function act(action:(signal:AbortSignal)=>Promise<unknown>){if(operation.current)return;const controller=new AbortController();operation.current=controller;setBusy(true);setError(undefined);
  try{await action(controller.signal);}catch(cause){if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:"کاهش حجم انجام نشد؛ اصل عکس محفوظ است.");}
  finally{if(operation.current===controller){operation.current=undefined;setBusy(false);}}
 }
 const result=draft.optimization,ready=result?.status==="ready"&&draft.optimizedBlob,selected=draft.selectedVariant??"source";
 return <section className="photo-optimization" aria-label="نسخه عکس برای ارسال" aria-busy={busy}>
  <p>اصل عکس محفوظ است. کاهش حجم آزمایشی است؛ خوانایی جزئیات را در بزرگ‌نمایی بررسی کنید.</p>
  {ready?<><div className="photo-variant-choices" role="group" aria-label="انتخاب نسخه عکس">
   <SecondaryButton disabled={busy} aria-pressed={selected==="source"} onClick={()=>void act(()=>actions.choose(draft.revisionId!,"source"))}>اصل عکس · {bytes(draft.blob.size)}</SecondaryButton>
   <SecondaryButton disabled={busy} aria-pressed={selected==="optimized"} onClick={()=>void act(()=>actions.choose(draft.revisionId!,"optimized"))}>نسخه کم‌حجم · {bytes(draft.optimizedBlob!.size)}</SecondaryButton>
  </div><p role="status">{selected==="source"?"اصل عکس انتخاب شده است.":"نسخه کم‌حجم انتخاب شده است؛ اصل عکس نیز نگه داشته می‌شود."}</p></>:
  <><SecondaryButton loading={busy} onClick={()=>void act(signal=>actions.prepare(policy,signal))}>{result?"تلاش دوباره برای کاهش حجم":"آماده‌سازی نسخه کم‌حجم (آزمایشی)"}</SecondaryButton>
   {result&&!busy&&<p role="status">{result.status==="processing"?"آماده‌سازی قبلی کامل نشده است. می‌توانید اصل عکس را تأیید کنید یا دوباره تلاش کنید.":"نسخه مناسب کوچک‌تری آماده نشد؛ اصل عکس انتخاب شده است."}</p>}</>}
  {error&&<InlineAlert tone="warning">{error}</InlineAlert>}
 </section>;
}
