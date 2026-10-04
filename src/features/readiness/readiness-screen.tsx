import { getImageProps } from "next/image";
import { Icon } from "@/components/ui/icon";
import { PreparationBack } from "@/features/preparation/preparation-header";
import { ReadinessRequirements } from "./readiness-requirements";
import { DeviceReadiness } from "./device-readiness";
import "@/features/preparation/preparation.css";

export function ReadinessScreen() {
  const { props: { srcSet = "" } } = getImageProps({
    src: "/images/preparation/vehicle-inspection.webp", alt: "", width: 480, height: 237,
  });
  const backgroundImage = `image-set(${srcSet.split(", ").map((source) => {
    const [url, density] = source.split(" ");
    return `url("${url}") ${density}`;
  }).join(", ")})`;

  return <main id="main-content" tabIndex={-1} className="preparation-screen readiness-screen">
    <PreparationBack href="/" />
    <div className="readiness-intro"><h1>قبل از شروع، آماده‌اید؟</h1>
      <p>با انجام چند بررسی ساده، فرآیند بازدید به‌خوبی<br />و با موفقیت انجام خواهد شد.</p>
      <div className="readiness-estimate"><Icon name="clock" size={20} /><span>زمان تقریبی: ۱۲ دقیقه</span></div>
    </div>
    <section className="readiness-hero" aria-label="آماده‌سازی خودرو" style={{ backgroundImage }}>
      <div className="readiness-hero-copy"><h2>خودروی شما <span>آماده<br />بازدید است</span>؟</h2><p>با رعایت موارد زیر، می‌توانید بازدید را سریع‌تر و بدون مشکل انجام دهید.</p></div>
    </section>
    <ReadinessRequirements />
    <DeviceReadiness />
  </main>;
}
