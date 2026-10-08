import { odometerReadingSchema, type CapturePackageData, type OdometerReading, type VideoDraft } from "@/features/capture-package/capture-package-model";

/** Durable local repository. A future API adapter synchronizes metadata through the generic evidence boundary. */
export interface CaptureDataStore {
  get(namespace: string): Promise<CapturePackageData>;
  saveOdometer(namespace: string, reading: OdometerReading): Promise<void>;
  saveVideoDraft(namespace: string, draft: VideoDraft): Promise<void>;
  confirmVideo(namespace: string): Promise<void>;
  discardVideoDraft(namespace: string): Promise<void>;
  requestVideoRetake(namespace: string, reason?: string): Promise<void>;
}
export const captureDatabase = { name: "inspection-capture-data", version: 1, store: "packages" } as const;
// getRandomValues also works on LAN HTTP, where randomUUID/getUserMedia may be unavailable.
export function videoBlobKey(namespace: string) { return `${namespace}:video-360:${crypto.getRandomValues(new Uint32Array(4)).join("-")}`; }
export function validateVideoDraft(draft: VideoDraft) {
  if (!draft.blob.type.startsWith("video/") || !draft.blob.size || draft.blob.size > 250 * 1024 * 1024) throw new Error("یک ویدیوی معتبر با حجم کمتر از ۲۵۰ مگابایت انتخاب کنید.");
  if (!Number.isFinite(draft.durationSeconds) || draft.durationSeconds <= 0) throw new Error("مدت ویدیو قابل تشخیص نیست. دوباره ضبط کنید.");
  if (draft.metadata.kind !== "video-360" || draft.metadata.mimeType !== draft.blob.type || draft.metadata.sizeBytes !== draft.blob.size) throw new Error("اطلاعات ویدیو معتبر نیست.");
}
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("ذخیره‌سازی محلی در دسترس نیست.")); return; }
    const request = indexedDB.open(captureDatabase.name, captureDatabase.version);
    let blocked = false;
    request.onupgradeneeded = () => request.result.createObjectStore(captureDatabase.store, { keyPath: "namespace" });
    request.onsuccess = () => { if (blocked) request.result.close(); else resolve(request.result); };
    request.onerror = () => reject(new Error("باز کردن ذخیره‌سازی بازدید ممکن نشد."));
    request.onblocked = () => { blocked = true; reject(new Error("صفحه‌های دیگر بازدید را ببندید و دوباره تلاش کنید.")); };
  });
}
async function change(namespace: string, update: (current: CapturePackageData) => CapturePackageData) {
  const database = await open();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(captureDatabase.store, "readwrite"), store = transaction.objectStore(captureDatabase.store);
    const request = store.get(namespace); let cause: unknown;
    request.onsuccess = () => { try { store.put(update(request.result ?? { namespace })); } catch (error) { cause = error; transaction.abort(); } };
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onabort = transaction.onerror = () => { database.close(); reject(cause instanceof Error && !(cause instanceof DOMException) ? cause : new Error("ذخیره اطلاعات ممکن نشد. اطلاعات و ویدیوی قبلی محفوظ است؛ فضا را بررسی و دوباره تلاش کنید.")); };
  });
}
export const indexedDBCaptureDataStore: CaptureDataStore = {
  async get(namespace) {
    const database = await open();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(captureDatabase.store), request = transaction.objectStore(captureDatabase.store).get(namespace);
      transaction.oncomplete = () => { database.close(); resolve(request.result ?? { namespace }); };
      transaction.onabort = transaction.onerror = () => { database.close(); reject(new Error("خواندن اطلاعات بازدید ممکن نشد.")); };
    });
  },
  async saveOdometer(namespace, reading) { const valid = odometerReadingSchema.parse(reading); await change(namespace, (current) => ({ ...current, odometer: { ...valid, updatedAt: new Date().toISOString() } })); },
  async saveVideoDraft(namespace, draft) { validateVideoDraft(draft); await change(namespace, (current) => ({ ...current, video360: { state: "local", ...current.video360, draft } })); },
  async confirmVideo(namespace) {
    await change(namespace, (current) => {
      if (!current.video360?.draft) throw new Error("ابتدا یک ویدیو ضبط کنید.");
      validateVideoDraft(current.video360.draft);
      return { ...current, video360: { accepted: current.video360.draft, state: "local" } };
    });
  },
  async discardVideoDraft(namespace) { await change(namespace, (current) => ({ ...current, video360: current.video360 ? { ...current.video360, draft: undefined } : undefined })); },
  async requestVideoRetake(namespace, reason) { await change(namespace, (current) => ({ ...current, video360: { ...current.video360, state: "retakeRequired", reviewerReason: reason } })); },
};
