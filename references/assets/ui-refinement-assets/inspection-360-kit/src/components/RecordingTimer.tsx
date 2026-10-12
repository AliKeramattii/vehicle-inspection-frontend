export function formatPersianDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`.replace(/[0-9]/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
}
export function RecordingTimer({ seconds, active }: { seconds: number; active: boolean }) {
  return <div className="recording-timer" role="timer" aria-label="مدت فیلم‌برداری" dir="ltr">
    <i className={`record-led ${active ? 'pulsing' : ''}`} />
    <span>{formatPersianDuration(seconds)}</span>
  </div>;
}
