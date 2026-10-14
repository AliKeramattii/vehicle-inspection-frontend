import { RecorderController } from './recorder-controller.js';
import {resumePendingHandoffs} from './integration/upload-adapter.js';
import { CircularRecordingProgress } from './components/CircularRecordingProgress.js';
import { PERSPECTIVES,GhostVehicleOverlay } from './components/GhostVehicleOverlay.js';
import { GhostVisibilityToggle } from './components/GhostVisibilityToggle.js';
import { LiveCameraPreview } from './components/LiveCameraPreview.js';
import { RecordingControls } from './components/RecordingControls.js';
import { CaptureGuidance } from './components/CaptureGuidance.js';

const $ = id=>document.getElementById(id);
const config = window.Vehicle360Config || {};
const TARGET_MS = Math.max(15000, Number(config.targetDurationMs)||60000);
const READ_ONLY = Boolean(config.readOnly);
let perspectiveIndex=0,ghostVisible=true;
let currentPreviewMode='';
const {wrapper,video:cameraVideo}=LiveCameraPreview();
const controller=new RecorderController({
  targetMs:TARGET_MS,
  onState:()=>renderAll(),
  onTick:()=>{renderMeter();if(isLive())renderStatus();},
  onStream:stream=>{cameraVideo.srcObject=stream;if(stream)cameraVideo.play().catch(()=>{});}
});
const statusDescriptions={
  idle:'آماده شروع',starting:'در حال دریافت تصویر دوربین',ready:'دوربین آماده است',
  recording:'در حال ضبط',paused:'ضبط در حالت مکث',stopping:'در حال آماده‌سازی پیش‌نمایش',
  saving:'در حال ذخیره ایمن',review:'بازبینی ویدیو',completed:'ضبط تکمیل شد',
  error:'خطا در ضبط',unsupported:'مرورگر ناسازگار',locked:'این بازدید ثبت نهایی شده و ویرایش ویدیو مجاز نیست.'
};
function isLive(){return ['ready','recording','paused','starting'].includes(controller.state)}
function showPreview(){
  let mode=isLive()?'live':(controller.objectUrl && ['review','saving','completed'].includes(controller.state) ? 'review':'empty');
  if(currentPreviewMode===mode)return;
  currentPreviewMode=mode;
  const root=$('previewRoot');root.replaceChildren();
  if(mode==='live'){
    root.append(wrapper);
    if(controller.stream)cameraVideo.srcObject=controller.stream;
    cameraVideo.play().catch(()=>{});
  }else if(mode==='review'){
    const saved=document.createElement('video');
    saved.className='recording-review-video';saved.controls=true;
    saved.playsInline=true;saved.preload='metadata';saved.src=controller.objectUrl;
    saved.setAttribute('aria-label','بازبینی ویدیوی ضبط‌شده');
    root.append(saved);
  }else{
    root.innerHTML=`<div class="camera-empty"><div class="camera-empty-illustration"><span class="empty-car-shape">◇</span><div class="empty-horizon"></div></div><span class="empty-kicker">CAMERA • LIVE PREVIEW</span><strong>تصویر زنده دوربین</strong><p>برای شروع، دسترسی دوربین را فعال کنید.</p></div>`;
  }
}
function renderGhost(){
  const active=isLive();
  const ghost=$('ghostRoot');
  ghost.style.display=active?'block':'none';
  if(active)ghost.innerHTML=GhostVehicleOverlay({visible:ghostVisible,perspective:PERSPECTIVES[perspectiveIndex].id,recording:controller.state==='recording'});
}
function renderStageControls(){
  const active=isLive();
  const recording=controller.state==='recording';
  const paused=controller.state==='paused';
  const review=['review','saving','completed'].includes(controller.state);
  $('previewTop').innerHTML=`<div class="stage-status ${recording ? 'recording-now':''} ${paused?'status-paused':''}">
      <span class="status-dot"></span>${statusDescriptions[controller.state]||''}</div>
      ${active?GhostVisibilityToggle(ghostVisible):'<span class="stage-chip">فقط ضبط با دوربین</span>'}`;
  $('previewBottom').innerHTML=active?`<div class="perspective-picker">
      <button id="nextPerspective" type="button" aria-label="زاویه بعدی">❮</button>
      <span class="perspective-text"><small>زاویه راهنمای فعلی <span>${perspectiveIndex+1} / ${PERSPECTIVES.length}</span></small><strong>${PERSPECTIVES[perspectiveIndex].title}</strong></span>
      <button id="previousPerspective" type="button" aria-label="زاویه قبلی">❯</button>
    </div>` : (review ? `<span class="stage-video-caption">ویدیوی ثبت‌شده • قابل بازبینی پیش از تأیید</span>` : `<span class="stage-video-caption">راهنمای کادر هنگام روشن شدن دوربین نمایش داده می‌شود</span>`);
}
function renderMeter(){
  $('progressRoot').innerHTML=CircularRecordingProgress({elapsedMs:controller.elapsedMs,targetMs:controller.targetMs,status:controller.state});
}
function renderStatus(){
  const targetReached=controller.elapsedMs>=TARGET_MS;
  const error=controller.state==='error'||controller.state==='unsupported';
  const complete=controller.state==='completed';
  const text=error?controller.errorMessage : (controller.state==='review'&&controller.errorMessage?controller.errorMessage : complete?controller.savedMessage : targetReached && ['recording','paused','stopping','review','saving'].includes(controller.state) ? 'زمان پیشنهادی کامل شد؛ می‌توانید ضبط را ادامه دهید.' : statusDescriptions[controller.state]);
  $('statusRoot').innerHTML=`<strong class="status-title ${error?'text-danger':''} ${complete?'text-success':''}">${error?'⚠ ':complete?'✓ ':''}${text}</strong><span class="status-subtitle">${targetReached?'هدف زمانی: تکمیل‌شده':'هدف زمانی: ۶۰ ثانیه یا مقدار تنظیم‌شده'} <span class="status-separator">·</span> ارزیابی پوشش: انجام نشده</span>`;
}
function renderAll(){
  showPreview();renderGhost();renderStageControls();renderMeter();renderStatus();
  $('controlsRoot').innerHTML=RecordingControls({status:controller.state,canPause:controller.canPause,canSwitch:controller.canSwitch,disabled:READ_ONLY});
  $('guidanceRoot').innerHTML=CaptureGuidance({status:controller.state,perspective:PERSPECTIVES[perspectiveIndex]});
}
const actions={
  activateCamera:()=>controller.activateCamera(),
  startRecording:()=>controller.start(),
  pauseRecording:()=>controller.pause(),
  resumeRecording:()=>controller.resume(),
  stopRecording:()=>controller.stop(),
  acceptRecording:()=>controller.accept(),
  retakeRecording:()=>READ_ONLY?undefined:controller.retake(),
  switchCamera:()=>controller.switchCamera(),
  ghostToggle:()=>{ghostVisible=!ghostVisible;renderGhost();renderStageControls();},
  nextPerspective:()=>{perspectiveIndex=(perspectiveIndex+1)%PERSPECTIVES.length;renderGhost();renderStageControls();},
  previousPerspective:()=>{perspectiveIndex=(perspectiveIndex+PERSPECTIVES.length-1)%PERSPECTIVES.length;renderGhost();renderStageControls();}
};
document.addEventListener('click',e=>{
  const btn=e.target.closest('button[id]');
  if(btn && actions[btn.id]){actions[btn.id]();}
});
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
$('closeButton').addEventListener('click',()=>{
  if(['recording','paused','stopping'].includes(controller.state)&&!confirm('ضبط فعلی کنار گذاشته می‌شود. خارج شوید؟'))return;
  controller.dispose();
  window.dispatchEvent(new CustomEvent('vehicle360:close'));
  $('statusRoot').textContent='صفحه ضبط بسته شد. برای ادامه، صفحه را دوباره باز کنید.';
  $('controlsRoot').replaceChildren();
});
window.addEventListener('beforeunload',e=>{
  if(['recording','paused','stopping'].includes(controller.state)){e.preventDefault();e.returnValue='';}
});
// Exposed for host lifecycle cleanup only, not an upload bypass.
window.Vehicle360Recorder={dispose:()=>controller.dispose()};
if(READ_ONLY) controller.state='locked';
renderAll();
resumePendingHandoffs().catch(err=>console.warn('Queue handoff recovery unavailable:',err));
