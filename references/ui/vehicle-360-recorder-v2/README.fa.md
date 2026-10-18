# ماژول مستقل ضبط ویدیوی ۳۶۰ درجه خودرو

## اجرا

این پکیج **بدون npm و بدون کتابخانه خارجی** کار می‌کند. با Python، VS Code Live Server یا هر static web server روی localhost اجرا کنید:

```bash
cd vehicle-360-recorder-v2
python -m http.server 5500
```

سپس نشانی `http://localhost:5500` را روی همان دستگاه باز کنید. برای تست روی گوشی واقعی، یک دامنه `HTTPS` معتبر لازم است (به‌جز localhost همان دستگاه). باز کردن `index.html` با `file://` کافی نیست.

## راهنما و رفتار واقعی

- فقط `getUserMedia` و `MediaRecorder`: **هیچ** `<input type=file>`, `capture` fallback یا انتخاب ویدیوی گالری وجود ندارد.
- Ghost Guide از تصاویر شفاف WebP و کاملاً جدا از فریم ضبط‌شده تشکیل می‌شود و در فایل خروجی ضبط نمی‌شود.
- تغییر بین هشت زاویه **دستی** است و به‌هیچ‌وجه به معنی تشخیص زاویه/تأیید پوشش نیست.
- حلقه پیشرفت = `min(زمان ضبط فعال / زمان هدف, ۱۰۰٪)`؛ در مکث ثابت می‌ماند و رسیدن به ۱۰۰٪ ضبط را متوقف نمی‌کند.
- هدف زمانی پیش‌فرض ۶۰ ثانیه است و در برنامه میزبان تنظیم می‌شود.
- بازبینی ویدیو، ضبط مجدد و تأیید پس از ضبط پشتیبانی می‌شوند.
- بعد از تأیید، Blob و اطلاعات در IndexedDB ذخیره می‌شوند. بدون پیاده‌سازی صف آپلود میزبان، نباید ادعا شود که فایل به سرور ارسال شده است.
- مرورگر ناسازگار خطا نشان می‌دهد و گزینه آپلود دستی ارائه نمی‌کند.
- خروج از صفحه هنگام ضبط تأیید جداگانه می‌خواهد. خاموش شدن ناگهانی دستگاه در میانه ضبط لزوماً داده ناقص را حفظ نمی‌کند.

## تنظیمات

قبل از بارگذاری `src/main.js` می‌توان تنظیم کرد:

```html
<script>
window.Vehicle360Config = {targetDurationMs: 60000,readOnly:false};
</script>
```

`readOnly` به‌تنهایی جایگزین قفل نهایی گردش‌کار اصلی نیست؛ برای اتصال محصول واقعی باید از وضعیت قفل شدن بازرسی دریافت شود.

## اتصال به صف آپلود موجود فاز ۶

در فایل `src/integration/upload-adapter.js` رابط زیر تعریف شده است:

```javascript
window.VehicleInspectionUploadBridge = {
  async enqueueRecordedWalkaround({ recordingId, blob, mimeType, durationMs, evidenceType }) {
    // با سرویس queue موجود خودتان، یک job از نوع walkaround-360 ایجاد کنید.
    // کلید job باید revision-based و idempotent باشد و از تکرار آپلود جلوگیری کند.
    // بازپخش queued jobs، retry/backoff، lease و persistence همان صف قبلی را حفظ کنید.
    return {jobId: 'your-real-queue-job-id'};
  }
};
```

قبل از اجرای برنامه، bridge را نصب کنید. این بسته **به صف آپلود پروژه شما دسترسی ندارد** و endpoint جدیدی را حدس نمی‌زند. فایل بعد از ضبط/تأیید در IndexedDB نگهداری می‌شود، اما بدون bridge در صف واقعی قرار نمی‌گیرد. برای integration قوی‌تر، بهتر است Blob و صف در تراکنش مناسب/مدیریت بازپخش ادغام شوند. از درج مستقیم آدرس فایل در پایگاه داده یا ارسال مستقیم باینری به MSSQL خودداری کنید؛ API سرور مسئول ذخیره فایل و تولید مسیر نهایی است.

## تصاویر جدید Ghost Guide (دقیقاً ۸ زاویه)

همهٔ تصاویر دارای پس‌زمینه شفاف هستند و مستقیماً روی پیش‌نمایش زنده قرار می‌گیرند:

1. **جلو** — `assets/360-recording/ghost-guides/ghost-front.webp`
2. **جلو ۴۵ درجه راست** — `assets/360-recording/ghost-guides/ghost-front-45-right.webp`
3. **راست** — `assets/360-recording/ghost-guides/ghost-right.webp`
4. **عقب ۴۵ درجه چپ** — `assets/360-recording/ghost-guides/ghost-rear-45-left.webp`
5. **عقب** — `assets/360-recording/ghost-guides/ghost-rear.webp`
6. **عقب ۴۵ درجه راست** — `assets/360-recording/ghost-guides/ghost-rear-45-right.webp`
7. **چپ** — `assets/360-recording/ghost-guides/ghost-left.webp`
8. **جلو ۴۵ درجه چپ** — `assets/360-recording/ghost-guides/ghost-front-45-left.webp`

پیش‌نمایش کنار هم: `mockups/eight-ghost-guides-contact-sheet.png`. زاویه‌ها به صورت دستی توسط کاربر عوض می‌شوند و توسط دوربین تشخیص داده نمی‌شوند. در UI، ترتیب همان فهرست درخواستی است؛ اگر مسیر راه‌رفتن ساعت‌گرد لازم باشد، چیدمان مناسب از لحاظ جغرافیای خودرو در `assets/360-recording/ghost-guides/README.fa.md` توضیح داده شده است.

## ساختار

- `src/components/CircularRecordingProgress.js` — حلقه پیشرفت زمان با SVG سبک و CSS
- `src/components/GhostVehicleOverlay.js` — نقشه هشت زاویه و راهنمای شفاف
- `src/components/GhostVisibilityToggle.js` — روشن/خاموش کردن راهنما
- `src/components/LiveCameraPreview.js` — عنصر `<video>` واقعی دوربین
- `src/components/RecordingTimer.js` — تبدیل زمان به دقیقه و ثانیه فارسی
- `src/components/RecordingControls.js` — دکمه‌های حساس به وضعیت ضبط
- `src/components/CaptureGuidance.js` — نکات تصویربرداری
- `src/recorder-controller.js` — state machine ضبط، مکث، توقف، بازبینی، ذخیره
- `src/storage/recordings-db.js` — ذخیره مقاوم Blob در IndexedDB
- `src/integration/upload-adapter.js` — نقطه اتصال به صف آپلود پروژه اصلی
- `assets/360-recording/ghost-guides` — هشت نمای WebP
- `assets/360-recording/icons` — آیکن‌های اصلی SVG
- `mockups` — خروجی‌های تصویری و اسکرین‌شات مرورگر

## کارهای الزامی هنگام ادغام

1. ادغام کامپوننت‌ها در صفحه بازدید خودرو؛ حفظ 100dvh و RTL کل برنامه.
2. اتصال به IndexedDB و upload queue موجود و بررسی سازگاری revision/cancellation.
3. همگام‌سازی مدل evidence با نام واقعی backend، قوانین submit و قفل پس از ثبت نهایی.
4. کنترل مجوز دوربین، سیاست امنیتی HTTPS، Safari iOS و گوشی‌های Android واقعی.
5. بررسی تجربه ۳۶۰ درجه با فیلم پیوسته، کیفیت تصویر، حجم، bit rate و محدودیت فضای ذخیره‌سازی.
6. مقایسه اسکرین‌شات مرورگر **پروژه اصلی** با ماکاپ پس از ادغام؛ این کار بدون سورس پروژه اصلی ممکن نیست.

## محدودیت مهم

هیچ الگوریتم تشخیص خودکار زاویه، تشخیص پوشش ۳۶۰ درجه، بررسی واقعی کیفیت تصویر یا آپلود عملی به سرور در این دموی مستقل موجود نیست. تصاویر WebP فقط راهنمای قاب‌بندی هستند.

## آزمایش‌ها

```bash
npm test
```

تست smoke واقعی نیاز به Playwright Python، مرورگر Chromium نصب‌شده، و سرور در حال اجرا روی پورت ۵۵۰۰ دارد:

```bash
pip install playwright
python -m playwright install chromium
python tests/smoke_test.py
```

خروجی تصویری تست مرورگر در `tests/browser-screenshots` ذخیره می‌شود و فایل‌های ماکاپ اصلی را بازنویسی نمی‌کند. **در محیط تولید این بسته، اجرای مرورگر به علت مسدودیت محیط امکان‌پذیر نبود**؛ لازم است شما این تست را روی سیستم یا دستگاه خود اجرا کنید.

برای جلوگیری از گم‌شدن تحویل فایل بین «ذخیره» و «ثبت در صف»، رکوردهای `pending-handoff` در IndexedDB باقی می‌مانند و با بازشدن مجدد صفحه (در صورت آماده بودن bridge) دوباره به queue اصلی سپرده می‌شوند. **queue میزبان باید enqueue را بر اساس `recordingId` کاملاً idempotent پیاده‌سازی کند.** این مکانیزم فقط handoff را بازیابی می‌کند و جایگزین retry/backoff اصلی صف نیست.

## راهنمای جدید ادغام کامل

- راهنمای جامع نصب، عملکرد هر فایل، ادغام اپ، صف آپلود و تست‌های Production: [`IMPLEMENTATION_GUIDE_FA.md`](./IMPLEMENTATION_GUIDE_FA.md)
- پرامپت آماده برای انتقال این پکیج به Codex با حفظ معماری فعلی پروژه: [`CODEX_INTEGRATION_PROMPT_FA.md`](./CODEX_INTEGRATION_PROMPT_FA.md)

