import type { ImagePolicy, ImageOptimizationMetadata, ImageOptimizationResult } from "./image-policy";
import type { PhotoRequirementStatus } from "@/schemas/photography";

export type PhotoDraft = { blob: Blob; capturedAt: string; revisionId?: string; optimization?: ImageOptimizationMetadata; optimizedBlob?: Blob; selectedVariant?: "source" | "optimized" };
export type LocalPhoto = { key: string; namespace: string; requirementId: string; status: PhotoRequirementStatus;
  blob?: Blob; sourceBlob?: Blob; imageOptimization?: ImageOptimizationMetadata; capturedAt?: string; revisionId?: string; draft?: PhotoDraft; reviewerReason?: string };
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
      // Existing keys encode [namespace, requirementId]; a prefix range needs no database migration.
      const prefix = JSON.stringify([namespace]).slice(0, -1) + ",";
      const request = transaction.objectStore(photoDatabase.store).getAll(IDBKeyRange.bound(prefix, prefix + "\uffff"));
      transaction.oncomplete = () => { database.close(); resolve((request.result as LocalPhoto[]).filter((photo) => photo.namespace === namespace)); };
      transaction.onabort = transaction.onerror = () => { database.close(); reject(new Error("خواندن عکس‌های ذخیره‌شده ممکن نشد.")); };
    });
  },
  async saveDraft(namespace, requirementId, draft) {
    validatePhotoBlob(draft.blob);
    await change(namespace, requirementId, (photo) => ({ ...photo, draft: { ...draft, revisionId: secureRevision() } }));
  },
  async confirm(namespace, requirementId) {
    await change(namespace, requirementId, (photo) => {
      if (!photo.draft) throw new Error("ابتدا یک عکس بگیرید.");
      const draft = photo.draft, blob = photoDraftBlob(draft);
      return { ...photo, blob, sourceBlob: blob !== draft.blob ? draft.blob : undefined, imageOptimization: draft.optimization ? {...draft.optimization,selectedVariant:blob !== draft.blob ? "optimized" : "source",...(draft.optimization.status === "processing" ? {status:"kept-original",reason:"source-confirmed"} as const : {})} : undefined,
        capturedAt: draft.capturedAt, revisionId: draft.revisionId ?? secureRevision(), status: "captured", draft: undefined, reviewerReason: undefined };
    });
  },
  async discardDraft(namespace, requirementId) { await change(namespace, requirementId, (photo) => ({ ...photo, draft: undefined })); },
};

/** Read one durable media record without loading all full-resolution images. */
export async function readPhoto(key: string): Promise<LocalPhoto | undefined> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(photoDatabase.store), request = transaction.objectStore(photoDatabase.store).get(key);
    transaction.oncomplete = () => { database.close(); resolve(request.result as LocalPhoto | undefined); };
    transaction.onabort = transaction.onerror = () => { database.close(); reject(new Error("خواندن عکس ذخیره‌شده ممکن نشد.")); };
  });
}

const secureRevision = () => crypto.getRandomValues(new Uint32Array(4)).join("-");
/** Source remains the default, including interrupted/failed optimization and legacy records. */
export function photoDraftBlob(draft: PhotoDraft) {
 return draft.selectedVariant === "optimized" && draft.optimization?.status === "ready" && draft.optimizedBlob ? draft.optimizedBlob : draft.blob;
}
export type PhotoOptimizationWork = { blob: Blob; revisionId: string; attemptId: string; policy: ImagePolicy };
export async function beginPhotoOptimization(namespace: string, requirementId: string, policy: ImagePolicy): Promise<PhotoOptimizationWork> {
 let work!: PhotoOptimizationWork;
 await change(namespace, requirementId, photo => {
  if (!photo.draft) throw new Error("برای کاهش حجم، ابتدا عکس جدیدی ثبت کنید.");
  const draft = photo.draft, revisionId = draft.revisionId ?? secureRevision(), attemptId = secureRevision();
  work = {blob:draft.blob,revisionId,attemptId,policy};
  return {...photo,draft:{...draft,revisionId,selectedVariant:"source",optimizedBlob:undefined,optimization:{status:"processing",attemptId,draftRevision:revisionId,policy:policy.name,source:{byteSize:draft.blob.size,mimeType:draft.blob.type}}}};
 });
 return work;
}
export async function finishPhotoOptimization(namespace: string, requirementId: string, work: PhotoOptimizationWork, result: ImageOptimizationResult & {method?: "worker" | "canvas"}) {
 let applied = false;
 await change(namespace, requirementId, photo => {
  const draft = photo.draft;
  if (!draft || draft.revisionId !== work.revisionId || draft.optimization?.attemptId !== work.attemptId) return photo;
  if (result.status === "ready" && (!result.blob.size || result.blob.size >= draft.blob.size || result.blob.type !== result.optimized.mimeType || result.blob.size !== result.optimized.byteSize)) throw new Error("نسخه کم‌حجم معتبر نیست؛ اصل عکس محفوظ است.");
  applied = true;
  const {attemptId,draftRevision,policy} = draft.optimization;
  const optimization:ImageOptimizationMetadata = {attemptId,draftRevision,policy,status:result.status,source:result.source,elapsedMs:result.elapsedMs,method:result.method,...(result.status === "ready" ? {optimized:result.optimized} : {reason:result.reason})};
  return {...photo,draft:{...draft,optimization,optimizedBlob:result.status === "ready" ? result.blob : undefined,selectedVariant:"source"}};
 });
 return applied;
}
export async function choosePhotoVariant(namespace:string,requirementId:string,revisionId:string,variant:"source"|"optimized") {
 await change(namespace,requirementId,photo=>{
  if (!photo.draft || photo.draft.revisionId !== revisionId) throw new Error("نسخه عکس تغییر کرده است؛ صفحه را دوباره بررسی کنید.");
  if (variant === "optimized" && (photo.draft.optimization?.status !== "ready" || !photo.draft.optimizedBlob)) throw new Error("نسخه کم‌حجم هنوز آماده نیست؛ اصل عکس محفوظ است.");
  return {...photo,draft:{...photo.draft,selectedVariant:variant}};
 });
}
