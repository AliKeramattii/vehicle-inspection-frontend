import type { PhotoRequirementStatus } from "@/schemas/photography";

export type PhotoDraft = { blob: Blob; capturedAt: string };
export type LocalPhoto = { key: string; namespace: string; requirementId: string; status: PhotoRequirementStatus;
  blob?: Blob; capturedAt?: string; draft?: PhotoDraft; reviewerReason?: string };
export interface PhotoStore {
  list(namespace: string): Promise<LocalPhoto[]>;
  saveDraft(namespace: string, requirementId: string, draft: PhotoDraft): Promise<void>;
  confirm(namespace: string, requirementId: string): Promise<void>;
  discardDraft(namespace: string, requirementId: string): Promise<void>;
}
export const photoDatabase = { name: "inspection-photos", version: 1, store: "photos" } as const;
export const photoNamespace = (id: string, templateId: string, version: number) => JSON.stringify([id, templateId, version]);
export const photoKey = (namespace: string, requirementId: string) => JSON.stringify([namespace, requirementId]);
export function validatePhotoBlob(blob: Blob) {
  if (!blob.type.startsWith("image/") || !blob.size || blob.size > 20 * 1024 * 1024) throw new Error("یک عکس معتبر با حجم کمتر از ۲۰ مگابایت انتخاب کنید.");
}
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("ذخیره‌سازی محلی در این مرورگر در دسترس نیست.")); return; }
    const request = indexedDB.open(photoDatabase.name, photoDatabase.version);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(photoDatabase.store)) request.result.createObjectStore(photoDatabase.store, { keyPath: "key" }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("ذخیره عکس ممکن نشد؛ فضای ذخیره‌سازی مرورگر را بررسی کنید."));
    request.onblocked = () => reject(new Error("صفحه‌های دیگر بازدید را ببندید و دوباره تلاش کنید."));
  });
}
async function change(namespace: string, requirementId: string, update: (photo: LocalPhoto) => LocalPhoto) {
  const database = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(photoDatabase.store, "readwrite");
    const store = transaction.objectStore(photoDatabase.store), key = photoKey(namespace, requirementId);
    const read = store.get(key);
    let error: unknown;
    read.onsuccess = () => {
      try { store.put(update((read.result as LocalPhoto | undefined) ?? { key, namespace, requirementId, status: "pending" })); }
      catch (cause) { error = cause; transaction.abort(); }
    };
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onabort = transaction.onerror = () => {
      database.close();
      const quota = (typeof error === "object" && error !== null && "name" in error && error.name === "QuotaExceededError") || transaction.error?.name === "QuotaExceededError";
      reject(quota ? new Error("فضای ذخیره‌سازی کافی نیست. عکس قبلی محفوظ است؛ پس از آزاد کردن فضا دوباره تلاش کنید.") : error ?? new Error("عکس ذخیره نشد. عکس قبلی محفوظ است؛ دوباره تلاش کنید."));
    };
  });
}
export const indexedDBPhotoStore: PhotoStore = {
  async list(namespace) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(photoDatabase.store, "readonly");
      const request = transaction.objectStore(photoDatabase.store).getAll();
      transaction.oncomplete = () => { database.close(); resolve((request.result as LocalPhoto[]).filter((photo) => photo.namespace === namespace)); };
      transaction.onabort = transaction.onerror = () => { database.close(); reject(new Error("خواندن عکس‌های ذخیره‌شده ممکن نشد.")); };
    });
  },
  async saveDraft(namespace, requirementId, draft) {
    validatePhotoBlob(draft.blob);
    await change(namespace, requirementId, (photo) => ({ ...photo, draft }));
  },
  async confirm(namespace, requirementId) {
    await change(namespace, requirementId, (photo) => {
      if (!photo.draft) throw new Error("ابتدا یک عکس بگیرید.");
      return { ...photo, ...photo.draft, status: "captured", draft: undefined, reviewerReason: undefined };
    });
  },
  async discardDraft(namespace, requirementId) { await change(namespace, requirementId, (photo) => ({ ...photo, draft: undefined })); },
};
