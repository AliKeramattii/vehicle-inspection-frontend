export type BrandingAssetFormat = "png" | "jpg" | "webp" | "ico";
export type ImageMetadata = { format: BrandingAssetFormat; mimeType: string; width: number; height: number };
const fail = () => { throw new Error("محتوای تصویر معتبر نیست. فایل PNG، JPEG، WebP یا آیکن معتبر انتخاب کنید."); };
export function inspectImageBytes(data: Uint8Array): ImageMetadata {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (data.length < 24) return fail();
  const text = (start: number, length: number) => String.fromCharCode(...data.subarray(start, start + length));
  if (data[0] === 137 && text(1, 3) === "PNG" && data[4] === 13 && data[5] === 10 && data[6] === 26 && data[7] === 10 && text(12, 4) === "IHDR")
    return { format: "png", mimeType: "image/png", width: view.getUint32(16), height: view.getUint32(20) };
  if (text(0, 4) === "RIFF" && text(8, 4) === "WEBP") {
    const type = text(12, 4); let width = 0, height = 0;
    if (type === "VP8X" && data.length >= 30) { width = 1 + data[24] + data[25] * 256 + data[26] * 65536; height = 1 + data[27] + data[28] * 256 + data[29] * 65536; }
    else if (type === "VP8 " && data.length >= 30 && data[23] === 157 && data[24] === 1 && data[25] === 42) { width = view.getUint16(26, true) & 16383; height = view.getUint16(28, true) & 16383; }
    else if (type === "VP8L" && data.length >= 25 && data[20] === 47) { const bits = view.getUint32(21, true); width = 1 + (bits & 16383); height = 1 + ((bits >>> 14) & 16383); }
    if (!width || !height) return fail();
    return { format: "webp", mimeType: "image/webp", width, height };
  }
  if (data[0] === 255 && data[1] === 216) {
    let offset = 2;
    while (offset + 9 < data.length) {
      if (data[offset++] !== 255) return fail();
      while (data[offset] === 255) offset++;
      if (offset + 2 >= data.length) return fail();
      const marker = data[offset++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || marker >= 208 && marker <= 215) continue;
      if (offset + 2 > data.length) return fail();
      const size = view.getUint16(offset);
      if (size < 2 || offset + size > data.length) return fail();
      if (size >= 7 && [192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker))
        return { format: "jpg", mimeType: "image/jpeg", height: view.getUint16(offset + 3), width: view.getUint16(offset + 5) };
      offset += size;
    }
  }
  if (view.getUint16(0, true) === 0 && view.getUint16(2, true) === 1) {
    const count = view.getUint16(4, true); if (count < 1 || count > 32 || data.length < 6 + count * 16) return fail();
    let width = 0, height = 0;
    for (let index = 0; index < count; index++) {
      const offset = 6 + index * 16, bytes = view.getUint32(offset + 8, true), start = view.getUint32(offset + 12, true);
      if (!bytes || start < 6 + count * 16 || start + bytes > data.length) return fail();
      width = Math.max(width, data[offset] || 256); height = Math.max(height, data[offset + 1] || 256);
    }
    return { format: "ico", mimeType: "image/vnd.microsoft.icon", width, height };
  }
  return fail();
}
export type ImageFilePolicy = { favicon: boolean; maxBytes: number };
export function validateImageMetadata(file: { name: string; type: string; size: number }, data: Uint8Array, policy: ImageFilePolicy) {
  if (!file.size || file.size > policy.maxBytes) throw new Error("حجم تصویر بیش از حد مجاز است.");
  const info = inspectImageBytes(data), extension = file.name.split(".").pop()?.toLowerCase();
  if (!["png", "jpg", "jpeg", "webp", "ico"].includes(extension ?? "") || extension === "ico" && !policy.favicon || info.format === "ico" && !policy.favicon)
    throw new Error("این فرمت برای این جایگاه مجاز نیست. SVG بارگذاری‌شده پشتیبانی نمی‌شود.");
  const expected = extension === "jpeg" ? "jpg" : extension;
  if (expected !== info.format || file.type && ![info.mimeType, ...(info.format === "ico" ? ["image/x-icon"] : [])].includes(file.type))
    throw new Error("پسوند یا نوع فایل با محتوای تصویر مطابقت ندارد.");
  const max = policy.favicon ? 512 : 8192;
  if (!info.width || !info.height || info.width > max || info.height > max || info.width * info.height > 20_000_000)
    throw new Error(policy.favicon ? "آیکن باید حداکثر ۵۱۲ × ۵۱۲ پیکسل باشد." : "ابعاد تصویر بیش از حد مجاز است.");
  return info;
}
export async function validateBrandingFile(file: File, policy: ImageFilePolicy, signal?: AbortSignal) {
  signal?.throwIfAborted();
  if (file.size > policy.maxBytes) throw new Error("حجم تصویر بیش از حد مجاز است.");
  const info = validateImageMetadata(file, new Uint8Array(await file.arrayBuffer()), policy);
  signal?.throwIfAborted();
  // Verify decoding only after bounded byte/dimension checks. Never inline untrusted SVG.
  await new Promise<void>((resolve, reject) => {
    const image = new Image(), url = URL.createObjectURL(new Blob([file], { type: info.mimeType }));
    const cleanup = () => { clearTimeout(timer); signal?.removeEventListener("abort", abort); image.onload = null; image.onerror = null; image.removeAttribute("src"); URL.revokeObjectURL(url); };
    const abort = () => { cleanup(); reject(new DOMException("Cancelled", "AbortError")); };
    const timer = setTimeout(() => { cleanup(); reject(new Error("خواندن تصویر ممکن نشد؛ فایل دیگری انتخاب کنید.")); }, 8000);
    image.onload = () => { const valid = image.naturalWidth > 0 && image.naturalHeight > 0; cleanup(); if (valid) resolve(); else reject(new Error("تصویر قابل نمایش نیست.")); };
    image.onerror = () => { cleanup(); reject(new Error("تصویر قابل نمایش نیست.")); };
    signal?.addEventListener("abort", abort, { once: true }); if (signal?.aborted) { abort(); return; }
    image.src = url;
  });
  signal?.throwIfAborted(); return info;
}
