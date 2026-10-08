import { uploadDatabase, uploadJobId, type MediaReference, type UploadJob } from "./upload-model";
import { uploadConcurrency, uploadLeaseMs } from "./retry-policy";

export interface UploadQueueRepository {
  list(): Promise<UploadJob[]>;
  reconcile(namespace: string, media: readonly MediaReference[]): Promise<void>;
  claim(owner: string, now: number): Promise<UploadJob | undefined>;
  update(id: string, owner: string, changes: Partial<UploadJob>): Promise<boolean>;
  retry(ids: readonly string[]): Promise<void>;
  release(owner: string): Promise<void>;
}
export async function openUploadDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("ذخیره‌سازی صف ارسال در دسترس نیست.")); return; }
    const request = indexedDB.open(uploadDatabase.name, uploadDatabase.version); let blocked = false;
    request.onupgradeneeded = () => { request.result.createObjectStore(uploadDatabase.store, { keyPath: "id" }); request.result.createObjectStore(uploadDatabase.settings); };
    request.onsuccess = () => { if (blocked) request.result.close(); else resolve(request.result); };
    request.onerror = () => reject(new Error("خواندن صف ارسال ممکن نشد. فایل‌های دستگاه را پاک نکنید و دوباره تلاش کنید."));
    request.onblocked = () => { blocked = true; reject(new Error("صفحه‌های دیگر بازدید را ببندید و دوباره تلاش کنید.")); };
  });
}
const events = new EventTarget();
export function subscribeQueue(listener: () => void) { events.addEventListener("change", listener); return () => events.removeEventListener("change", listener); }
async function transaction<T>(write: boolean, change: (jobs: UploadJob[]) => T): Promise<T> {
  const database = await openUploadDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(uploadDatabase.store, write ? "readwrite" : "readonly"), store = tx.objectStore(uploadDatabase.store), read = store.getAll();
    let result: T, cause: unknown;
    read.onsuccess = () => { try { const jobs = read.result as UploadJob[]; result = change(jobs); if (write) for (const job of jobs) store.put(job); } catch (error) { cause = error; tx.abort(); } };
    tx.oncomplete = () => { database.close(); if (write) events.dispatchEvent(new Event("change")); resolve(result); };
    tx.onabort = tx.onerror = () => { database.close(); reject(cause instanceof Error && !(cause instanceof DOMException) ? cause : new Error("ذخیره صف ارسال ممکن نشد. فایل‌ها محفوظ هستند؛ فضا را بررسی و دوباره تلاش کنید.")); };
  });
}
export const indexedDBUploadQueue: UploadQueueRepository = {
  list: () => transaction(false, (jobs) => jobs),
  reconcile: (namespace, media) => transaction(true, (jobs) => {
    const ids = new Set(media.map(uploadJobId));
    for (const job of jobs) if (job.namespace === namespace && job.current && !ids.has(job.id)) {
      job.current = false; job.owner = undefined; job.leaseUntil = undefined;
      // Retain successful server history. An obsolete queued/in-flight revision must never resume.
      if (job.upload !== "uploaded") job.upload = "cancelled";
    }
    for (const item of media) {
      const id = uploadJobId(item);
      const previous = jobs.find((job) => job.id === id);
      if (!previous) jobs.push({ ...item, id, current: true, upload: "queued", verification: "not-started", bytesUploaded: 0, attemptCount: 0 });
      else if (!previous.current) Object.assign(previous, { current: true, upload: previous.upload === "uploaded" ? "uploaded" : "queued", nextRetryAt: undefined, lastError: undefined });
    }
  }),
  claim: (owner, now) => transaction(true, (jobs) => {
    for (const job of jobs) if (job.owner && (job.leaseUntil ?? 0) <= now) {
      job.owner = undefined; job.leaseUntil = undefined;
      if (job.upload === "uploading") { job.upload = "queued"; job.bytesUploaded = 0; }
    }
    if (jobs.filter((job) => job.owner && (job.leaseUntil ?? 0) > now).length >= uploadConcurrency) return;
    const job = jobs.find((item) => item.current && !item.owner && ((["queued", "local"].includes(item.upload) && (item.nextRetryAt ?? 0) <= now) || (item.upload === "uploaded" && item.verification === "processing" && (item.nextCheckAt ?? 0) <= now)));
    if (!job) return;
    job.owner = owner; job.leaseUntil = now + uploadLeaseMs;
    if (job.upload !== "uploaded") { job.upload = "uploading"; job.attemptCount++; job.bytesUploaded = 0; }
    return { ...job };
  }),
  update: (id, owner, changes) => transaction(true, (jobs) => {
    const job = jobs.find((item) => item.id === id && item.current && item.owner === owner);
    if (!job) return false;
    Object.assign(job, changes); return true;
  }),
  retry: (ids) => transaction(true, (jobs) => {
    for (const job of jobs) if (ids.includes(job.id) && job.current && job.upload === "failed" && job.retryable) Object.assign(job, { upload: "queued", lastError: undefined, nextRetryAt: undefined, attemptCount: 0, bytesUploaded: 0, owner: undefined, leaseUntil: undefined });
  }),
  release: (owner) => transaction(true, (jobs) => {
    for (const job of jobs) if (job.owner === owner) { job.owner = undefined; job.leaseUntil = undefined; if (job.upload === "uploading") { job.upload = "queued"; job.bytesUploaded = 0; } }
  }),
};
