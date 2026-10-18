import { RecordingTimer } from './RecordingTimer.js';
const radius = 39, circumference = 2 * Math.PI * radius;
export function CircularRecordingProgress({ elapsedMs, targetMs, status }) {
  const percent = Math.max(0, Math.min(100, elapsedMs / targetMs * 100));
  const error = status === 'error' || status === 'unsupported';
  const complete = status === 'completed';
  const ringColor = error ? 'var(--danger)' : complete ? 'var(--success)' : 'var(--blue)';
  const offset = (circumference * (1 - percent/100)).toFixed(3);
  return `<div class="circular-progress" role="progressbar" aria-label="پیشرفت زمان ضبط" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(percent)}" aria-valuetext="${Math.round(percent)} درصد از مدت زمان پیشنهادی">
    <svg class="meter-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle class="meter-track" cx="50" cy="50" r="${radius}" />
      <circle class="meter-arc" cx="50" cy="50" r="${radius}" style="stroke:${ringColor};stroke-dasharray:${circumference};stroke-dashoffset:${offset}" />
    </svg>
    <div class="meter-center">${RecordingTimer(elapsedMs, targetMs)}</div>
  </div>`;
}
