export function CaptureGuidance({ status, perspective }) {
  const messages = {
    'recording':'با سرعت کم حرکت کنید و فاصله را ثابت نگه دارید.',
    'paused':'ضبط متوقف است؛ برای ادامه، دکمه «ادامه ضبط» را بزنید.',
    'review':'ویدیوی ضبط‌شده را بازبینی و سپس تأیید کنید.',
    'completed':'ویدیو در دستگاه ذخیره شده است.',
    'error':'دسترسی یا ضبط ویدیو دچار مشکل شد.',
    'unsupported':'ضبط مستقیم در این مرورگر پشتیبانی نمی‌شود.'
  };
  const text = messages[status] || 'نور مناسب، دست ثابت و حرکت یکنواخت را رعایت کنید.';
  return `<div class="guidance-content"><div class="tip-head"><span class="tip-icon">✦</span><span>نکات تصویربرداری</span></div>
    <p>${text}</p><div class="quality-chips"><span>☀ نور مناسب</span><span>◎ تصویر ثابت</span><span>↝ حرکت آهسته</span><span>▯ گوشی عمودی</span></div></div>`;
}
