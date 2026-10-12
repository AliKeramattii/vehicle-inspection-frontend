import { useState } from 'react';
import { SvgIcon } from './components/SvgIcon';
import { StatusCard } from './components/StatusCard';
import { GuideDialog } from './components/GuideDialog';
import { OrbitProgressGuide } from './components/OrbitProgressGuide';
import { RecordingTimer } from './components/RecordingTimer';
import { useCameraRecorder } from './hooks/useCameraRecorder';

/** Integrate real values from your inspection backend or validated sensors.
 * null = not measured. Never claim actual speed/light/level by guessing. */
export type QualitySignals = { light: boolean | null; level: boolean | null; speed: boolean | null };

export default function App() {
  const camera = useCameraRecorder();
  const [helpOpen, setHelpOpen] = useState(false);
  const [showScreen, setShowScreen] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const demo = !camera.stream;
  const active = camera.state === 'recording';
  const paused = camera.state === 'paused';
  const duringRecording = active || paused;
  // The mock screenshot uses 65%; NEVER equate elapsed video time with coverage.
  const orbitProgress: number | null = demo ? 65 : null;
  const signals: QualitySignals = demo
    ? { light: true, level: true, speed: true }
    : { light: null, level: null, speed: null };

  const begin = async () => {
    if (camera.state === 'recording' || camera.state === 'paused') { camera.stopRecording(); return; }
    const input = camera.stream ?? await camera.startCamera();
    if (input) camera.startRecording(input);
  };
  const cancelExit = () => setShowExitConfirm(false);
  const confirmExit = () => { camera.stopRecording(); camera.stopCamera(); setShowExitConfirm(false); setShowScreen(false); };

  if (!showScreen) return <main className="welcome-screen" dir="rtl">
    <h1>بازدید ۳۶۰ درجه خودرو</h1>
    <p>برای ادامه، راهنمای فیلم‌برداری را مطالعه کرده و دوربین را فعال کنید.</p>
    <button className="primary-button" onClick={() => setShowScreen(true)}>باز کردن صفحه فیلم‌برداری</button>
  </main>;

  return <main className="capture-screen" dir="rtl">
    <div className="scene-layer" aria-hidden="true">
      {camera.stream ? <video className={`camera-video ${camera.facingMode === 'user' ? 'mirror' : ''}`} ref={camera.videoRef} autoPlay muted playsInline />
        : <img className="demo-scene" src="/images/inspection-360/scene-background.webp" alt="" />}
      <div className="scene-vignette" />
    </div>
    <div className="capture-content">
      <header className="capture-header">
        <button type="button" className="icon-action exit-action" onClick={() => setShowExitConfirm(true)} aria-label="خروج"><SvgIcon name="close" size={28} /></button>
        <h1>فیلم ۳۶۰ درجه خودرو</h1>
        <button type="button" className="help-action" onClick={() => setHelpOpen(true)}><SvgIcon name="guide-book" size={25} /><span>راهنما</span></button>
      </header>
      <section className="capture-instructions" aria-live="polite">
        <h2>آرام دور خودرو حرکت کنید</h2>
        <p>خودرو را در کادر نگه دارید.</p>
        <span className="demo-tag">{demo ? 'پیش‌نمایش نمونه' : 'راهنمای تصویری — پوشش مسیر تأیید نشده'}</span>
      </section>
      <div className="middle-stack">
        <OrbitProgressGuide progress={orbitProgress} demo={demo} />
        <RecordingTimer seconds={demo ? 28 : camera.elapsed} active={active} />
      </div>
      <div className="status-list" aria-label="وضعیت کیفیت فیلم‌برداری">
        <StatusCard icon="speed" label="سرعت حرکت مناسب" ok={signals.speed} />
        <StatusCard icon="level" label="گوشی تراز" ok={signals.level} />
        <StatusCard icon="light" label="نور مناسب" ok={signals.light} />
      </div>
      {camera.error && <p role="alert" className="camera-error">{camera.error}</p>}
      {camera.recordedUrl && camera.state === 'finished' && <div className="saved-video">
        <span>ویدئو آماده ذخیره است.</span>
        <a href={camera.recordedUrl} download={`vehicle-360.${camera.recordedMime.includes('mp4') ? 'mp4' : 'webm'}`}>
          <SvgIcon name="download" size={19} /> دریافت ویدئو
        </a>
      </div>}
      <footer className="capture-controls">
        <button type="button" className="side-control" onClick={() => camera.stream ? camera.switchCamera() : camera.startCamera()}
          disabled={duringRecording} aria-label="تغییر دوربین">
          <span className="control-ring"><SvgIcon name="switch-camera" size={30} /></span><span>تغییر دوربین</span>
        </button>
        <button type="button" className={`record-main ${active ? 'record-active' : ''}`} onClick={begin}
          aria-label={duringRecording ? 'پایان ضبط' : 'شروع ضبط'}>
          <span className="record-main-center"><span className={duringRecording ? 'stop-square' : 'record-dot'} /></span>
        </button>
        <button type="button" className="side-control" onClick={camera.pauseRecording} disabled={!duringRecording}
          aria-label={paused ? 'ادامه ضبط' : 'مکث'}>
          <span className="control-ring"><SvgIcon name={paused ? 'play' : 'pause'} size={30} /></span>
          <span>{paused ? 'ادامه' : 'مکث'}</span>
        </button>
      </footer>
    </div>
    {helpOpen && <GuideDialog close={() => setHelpOpen(false)} />}
    {showExitConfirm && <div className="modal-backdrop"><div className="confirmation" role="dialog" aria-modal="true" aria-label="تأیید خروج">
      <h2>از فیلم‌برداری خارج شوید؟</h2><p>در صورت ضبط، ویدئو را ابتدا متوقف و ذخیره کنید.</p>
      <div className="confirmation-actions"><button className="primary-button" onClick={cancelExit}>ادامه فیلم‌برداری</button><button className="secondary-button" onClick={confirmExit}>خروج</button></div>
    </div></div>}
  </main>;
}
