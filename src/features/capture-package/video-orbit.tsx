import Image from "next/image";
import { toPersianDigits } from "@/lib/utils/persian";
/** Instructional elapsed-time visualization, not GPS, tracking or quality analysis. */
export function VideoOrbit({ progress }: { progress: number }) {
  const safe = Math.max(0, Math.min(100, progress));
  return <figure className="video-orbit" aria-label="راهنمای حرکت پیوسته دور خودرو">
    <svg viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="128" className="orbit-track" /><circle cx="150" cy="150" r="128" pathLength="100" strokeDasharray={`${safe} 100`} className="orbit-progress" /></svg>
    <Image src="/overlays/orbit/top-view-car.svg" width={100} height={180} alt="نمای بالای خودرو؛ به‌آرامی دور آن حرکت کنید" />
    <figcaption>{toPersianDigits(Math.round(safe))}٪<small>پیشرفت راهنمای زمانی</small></figcaption>
  </figure>;
}
