export interface CameraService { open(): Promise<MediaStream>; capture(video: HTMLVideoElement): Promise<Blob>; stop(stream: MediaStream): void }
export function cameraError(error: unknown): string {
  const name = typeof error === "object" && error !== null && "name" in error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "دسترسی دوربین داده نشد. دسترسی مرورگر را بررسی کنید یا عکس را انتخاب کنید.";
  if (name === "NotFoundError" || name === "NotReadableError") return "دوربین در دسترس نیست یا در برنامه دیگری استفاده می‌شود.";
  return error instanceof Error ? error.message : "باز کردن دوربین ممکن نشد. دوباره تلاش کنید یا عکس را انتخاب کنید.";
}
export const browserCameraService: CameraService = {
  async open() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("دوربین زنده به اتصال امن نیاز دارد. از انتخاب عکس یا دوربین گوشی استفاده کنید.");
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
  },
  async capture(video) {
    if (!video.videoWidth || !video.videoHeight) throw new Error("دوربین هنوز آماده نیست؛ چند لحظه صبر کنید.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("ثبت عکس در این مرورگر ممکن نیست.");
    context.drawImage(video, 0, 0);
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("ثبت عکس ممکن نشد؛ دوباره تلاش کنید.")), "image/jpeg", .92));
  },
  stop(stream) { stream.getTracks().forEach((track) => track.stop()); },
};
