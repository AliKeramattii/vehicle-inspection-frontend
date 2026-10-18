export const defaultRecordingTargetSeconds = 60;
export function recordingProgress(elapsed: number, target = defaultRecordingTargetSeconds) {
  const duration = Number.isFinite(target) && target > 0 ? target : defaultRecordingTargetSeconds;
  return Math.min(100, Math.max(0, elapsed / duration * 100));
}
