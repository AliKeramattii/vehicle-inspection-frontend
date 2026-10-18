import { SvgIcon } from './SvgIcon';
export function GuideDialog({ close }: { close: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="guide-dialog" role="dialog" aria-modal="true" aria-labelledby="guide-title" dir="rtl">
      <button type="button" className="modal-close" onClick={close} aria-label="بستن راهنما"><SvgIcon name="close" /></button>
      <h2 id="guide-title">راهنمای فیلم‌برداری ۳۶۰ درجه</h2>
      <img src="/images/inspection-360/orbit-360-illustration.webp" alt="نمای بالای خودرو با مسیر چرخش دور آن" className="guide-illustration" />
      <ol>
        <li>با فاصله‌ای مناسب از خودرو شروع کنید تا خودرو کاملاً داخل کادر باشد.</li>
        <li>به‌آرامی و با سرعت تقریباً یکنواخت دور خودرو حرکت کنید.</li>
        <li>گوشی را تا حد ممکن ثابت نگه دارید و از حرکت ناگهانی بپرهیزید.</li>
        <li>خودرو را در تمام مسیر داخل کادر نگه دارید و نور کافی داشته باشید.</li>
      </ol>
      <p className="guide-note">حلقه درصد پیشرفت تنها در صورت اتصال به سامانه معتبر تشخیص پوشش مسیر، پیشرفت واقعی را نشان می‌دهد.</p>
      <button type="button" className="primary-button" onClick={close}>متوجه شدم</button>
    </section>
  </div>;
}
