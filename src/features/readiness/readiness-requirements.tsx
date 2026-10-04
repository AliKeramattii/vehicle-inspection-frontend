import Image from "next/image";
import { toPersianDigits } from "@/lib/utils/persian";

export const readinessRequirements = [
  { title: "خودرو تمیز باشد و پلاک‌ها خوانا باشند", description: "بدنه خودرو تمیز و پلاک‌ها به‌صورت واضح قابل مشاهده باشند.", asset: "readiness-clean-vehicle" },
  { title: "خودرو را در فضای باز و روشن قرار دهید", description: "خودرو در فضای باز و روشن، با حدود ۲ متر فاصله اطراف قرار دهید.", asset: "readiness-open-space" },
  { title: "برای عکس کیلومتر، خودرو روشن باشد", description: "در زمان ثبت عکس کیلومتر، موتور خودرو روشن باشد.", asset: "readiness-engine-on" },
  { title: "شارژ گوشی بالای ۲۰٪ و فضای کافی باشد", description: "شارژ گوشی بیش از ۲۰٪ و فضای ذخیره‌سازی کافی برای ثبت تصاویر داشته باشید.", asset: "readiness-phone-ready" },
] as const;
export function ReadinessRequirements() {
  return <ol className="readiness-requirements" aria-label="شرایط آمادگی بازدید">
    {readinessRequirements.map((item, index) => <li key={item.asset}>
      <span className="requirement-number" aria-hidden="true">{toPersianDigits(index + 1)}</span>
      <Image src={`/illustrations/readiness/${item.asset}.webp`} alt="" width={65} height={52} sizes="(max-width: 359px) 47px, 65px" loading="eager" className="requirement-art" />
      <div><h2>{item.title}</h2><p>{item.description}</p></div>
    </li>)}
  </ol>;
}
