import { submissionDatabase, submissionLeaseMs, isSubmitted, type InspectionSummary, type SubmissionReceipt, type SubmissionRecord } from "./submission-model";

const changes = new EventTarget();
export function subscribeSubmission(listener: () => void) {
  changes.addEventListener("change", listener);
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("inspection-submission") : undefined;
  if (channel) channel.onmessage = listener;
  return () => { changes.removeEventListener("change", listener); channel?.close(); };
}
function notify() {
  changes.dispatchEvent(new Event("change"));
  if (typeof BroadcastChannel !== "undefined") { const channel = new BroadcastChannel("inspection-submission"); channel.postMessage("change"); channel.close(); }
}
export function openSubmissionDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("ذخیره‌سازی بازدید در دسترس نیست.")); return; }
    const request = indexedDB.open(submissionDatabase.name, submissionDatabase.version); let blocked = false;
    request.onupgradeneeded = () => { request.result.createObjectStore(submissionDatabase.records, { keyPath: "inspectionId" }); request.result.createObjectStore(submissionDatabase.receipts); request.result.createObjectStore(submissionDatabase.settings); };
    request.onsuccess = () => { if (blocked) request.result.close(); else resolve(request.result); };
    request.onerror = () => reject(new Error("خواندن وضعیت بازدید ممکن نشد. دوباره تلاش کنید."));
    request.onblocked = () => { blocked = true; reject(new Error("صفحه‌های دیگر بازدید را ببندید و دوباره تلاش کنید.")); };
  });
}
async function transaction<T>(storeName: string, key: string, write: boolean, update: (value: unknown) => { result: T; value?: unknown }): Promise<T> {
  const db = await openSubmissionDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, write ? "readwrite" : "readonly"), store = tx.objectStore(storeName), request = store.get(key); let result: T, cause: unknown;
    request.onsuccess = () => { try { const next = update(request.result); result = next.result; if (write && next.value !== undefined) { if (storeName === submissionDatabase.records) store.put(next.value); else store.put(next.value, key); } } catch (error) { cause = error; tx.abort(); } };
    tx.oncomplete = () => { db.close(); if (write) notify(); resolve(result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(cause instanceof Error ? cause : new Error("ذخیره وضعیت ارسال ممکن نشد. فایل‌ها محفوظ هستند؛ دوباره تلاش کنید.")); };
  });
}
export interface SubmissionRepository {
  get(id: string): Promise<SubmissionRecord | undefined>;
  claim(id: string, summary: InspectionSummary, owner: string, now: number): Promise<{ claimed: boolean; record: SubmissionRecord }>;
  finish(id: string, owner: string, receipt: SubmissionReceipt): Promise<SubmissionRecord>;
  fail(id: string, owner: string, message: string): Promise<void>;
  acknowledgement(key: string): Promise<SubmissionReceipt | undefined>;
  acknowledge(key: string, receipt: SubmissionReceipt): Promise<SubmissionReceipt>;
}
const newKey = () => `submission:${Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) => value.toString(16)).join("-")}`;
export const indexedDBSubmissionRepository: SubmissionRepository = {
  get: (id) => transaction(submissionDatabase.records, id, false, (value) => ({ result: value as SubmissionRecord | undefined })),
  claim: (id, summary, owner, now) => transaction<{ claimed: boolean; record: SubmissionRecord }>(submissionDatabase.records, id, true, (value) => {
    const record = value as SubmissionRecord | undefined;
    if (record && (isSubmitted(record) || record.status === "submitting" && (record.leaseUntil ?? 0) > now)) return { result: { claimed: false, record } };
    const next: SubmissionRecord = { ...record, inspectionId: id, idempotencyKey: record?.idempotencyKey ?? newKey(), status: "submitting", attemptCount: (record?.attemptCount ?? 0) + 1, summary, owner, leaseUntil: now + submissionLeaseMs, lastError: undefined };
    return { result: { claimed: true, record: next }, value: next };
  }),
  finish: (id, owner, receipt) => transaction(submissionDatabase.records, id, true, (value) => {
    const record = value as SubmissionRecord;
    if (!record || record.owner !== owner && !isSubmitted(record)) throw new Error("ارسال دیگری در حال انجام است.");
    const next: SubmissionRecord = { ...record, receipt, status: receipt.status, owner: undefined, leaseUntil: undefined, lastError: undefined };
    return { result: next, value: next };
  }),
  fail: (id, owner, message) => transaction(submissionDatabase.records, id, true, (value) => {
    const record = value as SubmissionRecord | undefined;
    return { result: undefined, value: record?.owner === owner && !isSubmitted(record) ? { ...record, status: "submit-failed", owner: undefined, leaseUntil: undefined, lastError: message } : undefined };
  }),
  acknowledgement: (key) => transaction(submissionDatabase.receipts, key, false, (value) => ({ result: value as SubmissionReceipt | undefined })),
  acknowledge: (key, receipt) => transaction(submissionDatabase.receipts, key, true, (value) => ({ result: (value as SubmissionReceipt | undefined) ?? receipt, value: value ?? receipt })),
};
export type SubmissionMockSettings = { delayMs?: number; failure?: "once" | "always" | "uncertain-once"; submittedAt?: string };
export const readSubmissionSettings = () => transaction(submissionDatabase.settings, "settings", false, (value) => ({ result: (value ?? {}) as SubmissionMockSettings }));
