export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
export function normalizeCode(value: string, length: number, numeric: boolean): string {
  const normalized = normalizeDigits(value).toUpperCase();
  return normalized.replace(numeric ? /[^0-9]/g : /[^A-Z0-9]/g, "").slice(0, length);
}
export function maskMobile(mobile: string): string { return `${mobile.slice(0, 4)}•••${mobile.slice(-4)}`; }
export function formatCountdown(seconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  return toPersianDigits(`${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`);
}
