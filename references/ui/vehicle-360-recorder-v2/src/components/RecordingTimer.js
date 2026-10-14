/** Duration text, elapsed active capture time only (pause excluded). */
export function formatTime(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  const ascii = `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  return ascii.replace(/\d/g, n => '۰۱۲۳۴۵۶۷۸۹'[Number(n)]);
}
export function RecordingTimer(elapsedMs, targetMs) {
  return `<strong class="time-value" dir="ltr">${formatTime(elapsedMs)}</strong><span class="time-target" dir="ltr">از ${formatTime(targetMs)}</span>`;
}
