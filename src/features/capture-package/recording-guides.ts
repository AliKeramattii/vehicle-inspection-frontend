export const defaultRecordingTargetSeconds = 60;
export const recordingGuides = [
  { id: "front", title: "جلو", file: "ghost-front.webp" },
  { id: "front-45-right", title: "جلو ۴۵ درجه راست", file: "ghost-front-45-right.webp" },
  { id: "right", title: "راست", file: "ghost-right.webp" },
  { id: "rear-45-left", title: "عقب ۴۵ درجه چپ", file: "ghost-rear-45-left.webp" },
  { id: "rear", title: "عقب", file: "ghost-rear.webp" },
  { id: "rear-45-right", title: "عقب ۴۵ درجه راست", file: "ghost-rear-45-right.webp" },
  { id: "left", title: "چپ", file: "ghost-left.webp" },
  { id: "front-45-left", title: "جلو ۴۵ درجه چپ", file: "ghost-front-45-left.webp" },
] as const;
export function recordingProgress(elapsed: number, target = defaultRecordingTargetSeconds) {
  const duration = Number.isFinite(target) && target > 0 ? target : defaultRecordingTargetSeconds;
  return Math.min(100, Math.max(0, elapsed / duration * 100));
}
