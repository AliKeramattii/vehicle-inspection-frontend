import {test,expect} from "@playwright/test";
import {writeFile,mkdir} from "node:fs/promises";
import {videoExperimentProfiles} from "../../src/lib/media/video-profiles";
test("real browser 720p/1080p and bitrate experiment with playback and cleanup",async({page})=>{
 await page.goto("/foundation");
 const cdp=await page.context().newCDPSession(page);await cdp.send("Performance.enable");const before=await cdp.send("Performance.getMetrics") as {metrics:{name:string;value:number}[]};
 const metric=(data:typeof before,name:string)=>data.metrics.find(item=>item.name===name)?.value??0;
 const result=await page.evaluate(async profiles=>{
  const mimeTypes=["video/webm;codecs=vp8","video/mp4","video/webm","video/webm;codecs=vp9"].filter(type=>typeof MediaRecorder!=="undefined"&&MediaRecorder.isTypeSupported(type));
  if(!mimeTypes.length)return {supported:false,mimeTypes,rows:[]};
  const image=new Image();image.src="/assets/inspection-vehicle/photo-guides/front-45-right.webp";await image.decode();const rows=[];
  for(const profile of profiles){
   const canvas=document.createElement("canvas");canvas.width=profile.width;canvas.height=profile.height;const context=canvas.getContext("2d")!,stream=canvas.captureStream(profile.frameRate),chunks:Blob[]=[];
   let frame=0,animation=0;const draw=()=>{context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight)*.95;context.drawImage(image,(canvas.width-image.naturalWidth*scale)/2+Math.sin(frame++/20)*8,(canvas.height-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);animation=requestAnimationFrame(draw);};draw();
   const recorder=new MediaRecorder(stream,{mimeType:mimeTypes[0],videoBitsPerSecond:profile.videoBitsPerSecond});let started=0;
   await new Promise<void>(ok=>{recorder.onstart=()=>{started=performance.now();ok()};recorder.start(250)});
   recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};
   await new Promise<void>(ok=>setTimeout(ok,2000));const settings=stream.getVideoTracks()[0].getSettings();
   await new Promise<void>(ok=>{recorder.onstop=()=>ok();recorder.stop()});const seconds=(performance.now()-started)/1000;
   cancelAnimationFrame(animation);stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:chunks[0]?.type||recorder.mimeType}),url=URL.createObjectURL(blob),video=document.createElement("video");video.muted=true;video.playsInline=true;video.src=url;
   let playable=false;try{await new Promise<void>((ok,no)=>{const timeout=setTimeout(()=>no(Error("Video decode timeout")),8000);video.onloadeddata=()=>{clearTimeout(timeout);ok()};video.onerror=()=>{clearTimeout(timeout);no(Error("Video decode failed"))}});await video.play();await new Promise<void>(ok=>setTimeout(ok,300));playable=video.currentTime>0;video.pause();}finally{video.removeAttribute("src");video.load();URL.revokeObjectURL(url);canvas.width=1;canvas.height=1;}
   rows.push({profile,actualSettings:{width:settings.width,height:settings.height,frameRate:settings.frameRate},actualRecorderBitsPerSecond:recorder.videoBitsPerSecond,mimeType:blob.type,bytes:blob.size,seconds,observedMbps:blob.size*8/seconds/1e6,playable,tracksStopped:stream.getTracks().every(t=>t.readyState==="ended")});
  }
  return {supported:true,mimeTypes,rows};
 },videoExperimentProfiles);
 expect(result.supported).toBe(true);expect(result.rows).toHaveLength(6);for(const row of result.rows){expect(row.playable).toBe(true);expect(row.tracksStopped).toBe(true);expect(row.bytes).toBeGreaterThan(0);}
 const after=await cdp.send("Performance.getMetrics") as typeof before;await cdp.detach();
 await mkdir(".agent/reference-review/performance",{recursive:true});await writeFile(".agent/reference-review/performance/video-profile-matrix.json",JSON.stringify({...result,observations:{taskMsDelta:(metric(after,"TaskDuration")-metric(before,"TaskDuration"))*1000,heapBefore:metric(before,"JSHeapUsedSize"),heapAfter:metric(after,"JSHeapUsedSize"),note:"Whole six-profile lab JS counters only; not per-codec native CPU, peak RAM or battery."}},null,2));
});
