import { Icon, type IconName } from "@/components/ui/icon";

const benefits: { title: string; description: string; icon: IconName }[] = [
  { title: "بدون مراجعه حضوری", description: "صرفه‌جویی در زمان\nو هزینه", icon: "noVisit" },
  { title: "ذخیره خودکار", description: "ادامه بازدید\nدر هر زمان", icon: "cloud" },
  { title: "امن و رمزنگاری‌شده", description: "حفاظت از اطلاعات\nشخصی شما", icon: "lock" },
];
export function LandingBenefits() {
  return <section className="landing-benefits" aria-label="مزایای بازدید آنلاین">
    {benefits.map((benefit) => <div key={benefit.title} className="landing-benefit">
      <span className="benefit-icon"><Icon name={benefit.icon} size={26} /></span>
      <h2>{benefit.title}</h2><p>{benefit.description}</p>
    </div>)}
  </section>;
}
