import { useCallback, useEffect, useRef, useState } from 'react';

type RecorderState = 'idle' | 'recording' | 'paused' | 'finished';
const supportedMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const mime of ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return '';
};

export function useCameraRecorder() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedMime, setRecordedMime] = useState('video/webm');
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const dataUrlRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTicker = useCallback(() => {
    if (tickerRef.current) clearInterval(tickerRef.current);
    tickerRef.current = null;
  }, []);
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(null);
  }, []);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);
  useEffect(() => () => {
    clearTicker();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (dataUrlRef.current) URL.revokeObjectURL(dataUrlRef.current);
  }, [clearTicker]);

  const startCamera = useCallback(async (facing: 'environment' | 'user' = facingMode): Promise<MediaStream | null> => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('دسترسی به دوربین فقط در HTTPS یا localhost و مرورگر سازگار ممکن است.');
      return null;
    }
    try {
      // Avoid holding both front and rear cameras simultaneously on mobile.
      stopCamera();
      const next = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = next;
      setStream(next);
      setFacingMode(facing);
      setState('idle');
      setElapsed(0);
      return next;
    } catch (e) {
      setError(e instanceof Error ? `دوربین در دسترس نیست: ${e.message}` : 'خطا در دسترسی به دوربین');
      return null;
    }
  }, [facingMode, stopCamera]);

  const startRecording = useCallback((inputStream?: MediaStream): boolean => {
    setError('');
    const current = inputStream ?? streamRef.current;
    if (!current) { setError('ابتدا دوربین را فعال کنید.'); return false; }
    if (typeof MediaRecorder === 'undefined') { setError('این مرورگر از ضبط ویدئو پشتیبانی نمی‌کند.'); return false; }
    try {
      const mime = supportedMimeType();
      const recorder = new MediaRecorder(current, mime ? { mimeType: mime } : undefined);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = event => { if (event.data.size > 0) chunks.push(event.data); };
      recorder.onerror = () => setError('ضبط ویدئو با خطا مواجه شد.');
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
        if (!blob.size) { setError('فایل ویدئو تولید نشد.'); return; }
        if (dataUrlRef.current) URL.revokeObjectURL(dataUrlRef.current);
        dataUrlRef.current = URL.createObjectURL(blob);
        setRecordedMime(blob.type);
        setRecordedUrl(dataUrlRef.current);
        setState('finished');
      };
      recorderRef.current = recorder;
      setRecordedUrl(null);
      setElapsed(0);
      recorder.start(1000);
      setState('recording');
      clearTicker();
      tickerRef.current = setInterval(() => setElapsed(v => v + 1), 1000);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'امکان شروع ضبط وجود ندارد.');
      return false;
    }
  }, [clearTicker]);

  const pauseRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.state === 'recording') { rec.pause(); setState('paused'); clearTicker(); }
    else if (rec.state === 'paused') {
      rec.resume(); setState('recording');
      tickerRef.current = setInterval(() => setElapsed(v => v + 1), 1000);
    }
  }, [clearTicker]);
  const stopRecording = useCallback(() => {
    clearTicker();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
  }, [clearTicker]);
  const switchCamera = useCallback(async () => {
    if (state === 'recording' || state === 'paused') return;
    await startCamera(facingMode === 'environment' ? 'user' : 'environment');
  }, [facingMode, startCamera, state]);

  return { stream, facingMode, state, elapsed, error, recordedUrl, recordedMime, videoRef,
    startCamera, stopCamera, startRecording, pauseRecording, stopRecording, switchCamera };
}
