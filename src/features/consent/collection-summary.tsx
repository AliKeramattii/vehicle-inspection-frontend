import { Icon, type IconName } from "@/components/ui/icon";

const collected: { title: string; description: string; icon: IconName }[] = [
  { title: "عکس‌ها و ویدیوهای خودرو", description: "برای بررسی وضعیت بدنه، شیشه‌ها، داخل خودرو و سایر بخش‌ها.", icon: "camera" },
  { title: "موقعیت تقریبی بازدید", description: "برای اطمینان از محل انجام بازدید و اعتبارسنجی اطلاعات.", icon: "location" },
  { title: "زمان ثبت و اطلاعات فنی", description: "مانند زمان عکسبرداری، نوع دستگاه و مشخصات فایل‌ها.", icon: "document" },
];
export function CollectionSummary() {
  return <section className="collection-summary" aria-labelledby="collection-title"><h2 id="collection-title">چه اطلاعاتی جمع‌آوری می‌شود؟</h2>
    <ul>{collected.map(({ title, description, icon }) => <li key={title}><span className="collection-icon"><Icon name={icon} size={27} /></span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ul>
    <aside className="collection-purpose"><h3><Icon name="info" size={22} />چرا این اطلاعات لازم است؟</h3><p>این اطلاعات برای احراز هویت، بررسی دقیق خودرو، جلوگیری از تقلب و ارائه گزارش معتبر به شرکت بیمه جمع‌آوری می‌شود.<br />اطلاعات شما فقط در چارچوب این خدمت استفاده خواهد شد.</p></aside>
  </section>;
}
