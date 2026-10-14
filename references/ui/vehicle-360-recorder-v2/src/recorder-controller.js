import { persistRecording } from './storage/recordings-db.js';
import { enqueueWithHostQueue } from './integration/upload-adapter.js';
const MIME_PREFERENCES = [
  'video/mp4;codecs=h264',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8',
  'video/mp4',
  'video/webm'
];
export class RecorderController {
  constructor({targetMs=60000,onState=()=>{},onTick=()=>{},onStream=()=>{}}={}) {
    this.targetMs=targetMs;
    this.onState=onState;
    this.onTick=onTick;
    this.onStream=onStream;
    this.state='idle';
    this.errorMessage='';
    this.savedMessage='';
    this.stream=null;
    this.mediaRecorder=null;
    this.chunks=[];
    this.blob=null;
    this.mimeType='';
    this.objectUrl=null;
    this.durationActiveMs=0;
    this.lastActiveStart=0;
    this.clockInterval=null;
    this.facingMode='environment';
    this.canSwitch=false;
    this.canPause=false;
    this.disposed=false;
  }
  setState(next){this.state=next;this.onState(this);}
  get elapsedMs(){
    return Math.max(0,this.durationActiveMs + (this.state==='recording' ? performance.now()-this.lastActiveStart : 0));
  }
  _notifyTick(){ this.onTick(this); }
  _beginTicks(){ this._clearTicks(); this.clockInterval=window.setInterval(()=>this._notifyTick(),120);this._notifyTick(); }
  _clearTicks(){ if(this.clockInterval!==null)window.clearInterval(this.clockInterval);this.clockInterval=null; }
  _closeStream(){
    if(this.stream){this.stream.getTracks().forEach(t=>{t.onended=null;t.stop()});this.stream=null;}
    this.onStream(null);
  }
  _dropPreview(){ if(this.objectUrl){URL.revokeObjectURL(this.objectUrl);this.objectUrl=null;} }
  _supportsRecording(){ return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && window.isSecureContext); }
  async activateCamera(){
    if(this.disposed)return;
    if(!this._supportsRecording()){
      this.errorMessage='ضبط مستقیم با دوربین در این مرورگر یا این آدرس پشتیبانی نمی‌شود. از مرورگر به‌روز و HTTPS یا localhost استفاده کنید.';
      this.setState('unsupported');return;
    }
    if(!['idle','ready','error','unsupported','completed'].includes(this.state))return;
    this.setState('starting');
    try{
      this._closeStream();
      const constraints = { audio:false, video:{facingMode:{ideal:this.facingMode}, width:{ideal:1280},height:{ideal:720},frameRate:{ideal:30,max:30}} };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if(this.disposed){stream.getTracks().forEach(t=>t.stop());return;}
      this.stream=stream;
      for(const track of stream.getVideoTracks()) track.onended=()=>{
        if(['recording','paused'].includes(this.state)) this.fail('اتصال به دوربین هنگام ضبط قطع شد. لطفاً دوباره ضبط کنید.');
        else if(this.state==='ready') this.fail('دوربین قطع شد. لطفاً دوباره تلاش کنید.');
      };
      this.onStream(stream);
      this.canPause=typeof MediaRecorder.prototype.pause==='function' && typeof MediaRecorder.prototype.resume==='function';
      try{
        const devices=await navigator.mediaDevices.enumerateDevices();
        this.canSwitch=devices.filter(d=>d.kind==='videoinput').length>1;
      }catch{this.canSwitch=false;}
      this.errorMessage='';this.setState('ready');
    }catch(e){
      const permission = e?.name==='NotAllowedError' || e?.name==='PermissionDeniedError';
      this.fail(permission ? 'دسترسی به دوربین داده نشد. لطفاً مجوز دوربین را از تنظیمات مرورگر فعال کنید.' : `دوربین قابل راه‌اندازی نیست: ${e?.message || 'خطای نامشخص'}`);
    }
  }
  async switchCamera(){
    if(this.state!=='ready'||!this.canSwitch)return;
    this.facingMode=this.facingMode==='environment'?'user':'environment';
    await this.activateCamera();
  }
  start(){
    if(this.state!=='ready'||!this.stream)return;
    try{
      const mime=MIME_PREFERENCES.find(m=>MediaRecorder.isTypeSupported?.(m));
      const mr=mime ? new MediaRecorder(this.stream,{mimeType:mime}) : new MediaRecorder(this.stream);
      this.mediaRecorder=mr;
      this.mimeType=mr.mimeType || mime || '';
      this.chunks=[];this.durationActiveMs=0;this.lastActiveStart=performance.now();
      this.blob=null;this._dropPreview();
      mr.ondataavailable=(event)=>{if(event.data?.size>0)this.chunks.push(event.data);};
      mr.onerror=()=>this.fail('خطای ضبط ویدیو رخ داد؛ ویدیوی ناقص کنار گذاشته شد.');
      mr.onstop=()=>{
        if(this.disposed || this.state==='error')return;
        this._clearTicks();
        const actualMime=mr.mimeType || this.chunks[0]?.type || this.mimeType || 'video/webm';
        const blob=new Blob(this.chunks,{type:actualMime});
        this.chunks=[];this._closeStream();
        if(!blob.size){this.fail('دوربین هیچ داده ویدیویی تولید نکرد؛ دوباره تلاش کنید.');return;}
        this.blob=blob;this.mimeType=actualMime;
        this.objectUrl=URL.createObjectURL(blob);
        this.setState('review');
      };
      mr.start(1000);
      this.setState('recording');this._beginTicks();
    }catch(e){this.fail(`ضبط آغاز نشد: ${e?.message||'فرمت ویدیویی پشتیبانی نمی‌شود'}`);}
  }
  pause(){
    if(this.state!=='recording'||this.mediaRecorder?.state!=='recording'||!this.canPause)return;
    try{
      this.mediaRecorder.pause();
      this.durationActiveMs += performance.now()-this.lastActiveStart;
      this.lastActiveStart=0;
      this._clearTicks();this.setState('paused');this._notifyTick();
    }catch(e){this.fail(`توقف موقت امکان‌پذیر نبود: ${e?.message}`);}
  }
  resume(){
    if(this.state!=='paused'||this.mediaRecorder?.state!=='paused'||!this.canPause)return;
    try{
      this.mediaRecorder.resume();
      this.lastActiveStart=performance.now();
      this.setState('recording');this._beginTicks();
    }catch(e){this.fail(`ادامه ضبط امکان‌پذیر نبود: ${e?.message}`);}
  }
  stop(){
    if(!['recording','paused'].includes(this.state))return;
    if(this.state==='recording')this.durationActiveMs += performance.now()-this.lastActiveStart;
    this.lastActiveStart=0;
    this._clearTicks();this.setState('stopping');
    try{ this.mediaRecorder?.stop(); }
    catch(e){this.fail(`پایان ضبط با خطا مواجه شد: ${e?.message}`);}
  }
  async accept(){
    if(this.state!=='review'||!this.blob)return;
    this.setState('saving');
    const record={
      id:crypto.randomUUID?.() || `walkaround-${Date.now()}`,
      blob:this.blob, mimeType:this.mimeType, durationMs:Math.round(this.durationActiveMs),
      createdAt:new Date().toISOString(), evidenceType:'walkaround-360',
      origin:'in-app-camera', uploadStatus:'pending-handoff'
    };
    try{
      await persistRecording(record);
    }catch(e){
      this.errorMessage=`ذخیره ایمن ویدیو انجام نشد (${e?.message||'خطای فضای ذخیره‌سازی'}). لطفاً فضای دستگاه را بررسی و دوباره تأیید کنید.`;
      this.setState('review');return;
    }
    try{
      const outcome=await enqueueWithHostQueue(record);
      this.savedMessage=outcome.message;
    }catch(e){
      this.savedMessage='ویدیو ذخیره شد، ولی افزودن به صف آپلود موفق نبود. این مورد باید از طریق صف اصلی بازیابی شود.';
    }
    this.errorMessage='';
    this.setState('completed');
  }
  retake(){
    if(!['review','completed','error','unsupported'].includes(this.state))return;
    this._clearTicks();
    this._closeStream();
    this._dropPreview();
    this.blob=null;this.chunks=[];this.durationActiveMs=0;this.lastActiveStart=0;
    this.errorMessage='';this.savedMessage='';this.setState('idle');
  }
  fail(message){
    if(this.disposed)return;
    this.errorMessage=message;
    this._clearTicks();
    try{if(this.mediaRecorder?.state!=='inactive')this.mediaRecorder?.stop();}catch{}
    this.mediaRecorder=null;this.chunks=[];
    this._closeStream();this.setState('error');
  }
  dispose(){
    this.disposed=true;this._clearTicks();
    try{if(this.mediaRecorder?.state!=='inactive')this.mediaRecorder?.stop();}catch{}
    this._closeStream();this._dropPreview();
  }
}
