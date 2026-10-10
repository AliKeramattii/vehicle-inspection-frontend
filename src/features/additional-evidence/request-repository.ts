import { requestDatabase, requestActive, requestInputSchema, type EvidenceRequest, type SupplementalReceipt } from "./request-model";

const events = new EventTarget();
export function subscribeRequests(listener: () => void) {
  events.addEventListener("change", listener);
  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("inspection-evidence-requests") : undefined;
  if (channel) channel.onmessage = listener;
  return () => { events.removeEventListener("change", listener); channel?.close(); };
}
function notify() { events.dispatchEvent(new Event("change")); if (typeof BroadcastChannel !== "undefined") { const channel = new BroadcastChannel("inspection-evidence-requests"); channel.postMessage("change"); channel.close(); } }
export function openRequestDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("ذخیره‌سازی درخواست‌ها در دسترس نیست.")); return; }
    const request = indexedDB.open(requestDatabase.name, requestDatabase.version); let blocked = false;
    request.onupgradeneeded = () => { request.result.createObjectStore(requestDatabase.records, { keyPath: "id" }); request.result.createObjectStore(requestDatabase.receipts); request.result.createObjectStore(requestDatabase.settings); };
    request.onsuccess = () => { if (blocked) request.result.close(); else resolve(request.result); };
    request.onerror = () => reject(new Error("خواندن درخواست کارشناس ممکن نشد. دوباره تلاش کنید."));
    request.onblocked = () => { blocked = true; reject(new Error("صفحه‌های دیگر بازدید را ببندید و دوباره تلاش کنید.")); };
  });
}
async function transact<T>(storeName: string, write: boolean, change: (store: IDBObjectStore, values: unknown[]) => T): Promise<T> {
  const db = await openRequestDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, write ? "readwrite" : "readonly"), store = tx.objectStore(storeName), read = store.getAll(); let result: T, cause: unknown;
    read.onsuccess = () => { try { result = change(store, read.result); } catch (error) { cause = error; tx.abort(); } };
    tx.oncomplete = () => { db.close(); if (write) notify(); resolve(result); };
    tx.onabort = tx.onerror = () => { db.close(); reject(cause instanceof Error ? cause : new Error("ذخیره درخواست ممکن نشد. مدارک قبلی محفوظ هستند.")); };
  });
}
export interface RequestRepository {
  list(inspectionId: string): Promise<EvidenceRequest[]>;
  get(id: string): Promise<EvidenceRequest | undefined>;
  create(request: EvidenceRequest): Promise<void>;
  change(id: string, update: (request: EvidenceRequest) => EvidenceRequest): Promise<EvidenceRequest>;
  acknowledgement(key: string): Promise<SupplementalReceipt | undefined>;
  acknowledge(key: string, receipt: SupplementalReceipt): Promise<SupplementalReceipt>;
}
const immutableIdentity = (value: EvidenceRequest) => JSON.stringify([value.id, value.inspectionId, value.version, value.round, value.originalNamespace, value.template, value.items, value.requestedAt]);
export const indexedDBRequestRepository: RequestRepository = {
  list: (inspectionId) => transact(requestDatabase.records, false, (_, values) => (values as EvidenceRequest[]).filter((request) => request.inspectionId === inspectionId).sort((a, b) => b.round - a.round)),
  get: (id) => transact(requestDatabase.records, false, (_, values) => (values as EvidenceRequest[]).find((request) => request.id === id)),
  create: (request) => transact(requestDatabase.records, true, (store, values) => {
    requestInputSchema.parse(request);
    const requests = values as EvidenceRequest[];
    if (requests.some((previous) => previous.id === request.id || previous.inspectionId === request.inspectionId && (requestActive(previous) || previous.round >= request.round))) throw new Error("درخواست دیگری فعال است یا این نسخه قدیمی است.");
    store.add(request);
  }),
  change: (id, update) => transact(requestDatabase.records, true, (store, values) => { const request = (values as EvidenceRequest[]).find((request) => request.id === id); if (!request) throw new Error("درخواست پیدا نشد."); const identity = immutableIdentity(request), next = update(request); if (immutableIdentity(next) !== identity) throw new Error("شناسه و موارد این نسخه درخواست قابل تغییر نیستند."); store.put(next); return next; }),
  acknowledgement: (key) => transact(requestDatabase.receipts, false, (_, values) => (values as { key: string; receipt: SupplementalReceipt }[]).find((value) => value.key === key)?.receipt),
  acknowledge: (key, receipt) => transact(requestDatabase.receipts, true, (store, values) => { const previous = (values as { key: string; receipt: SupplementalReceipt }[]).find((value) => value.key === key); if (previous) return previous.receipt; store.put({ key, receipt }, key); return receipt; }),
};
export type RequestMockSettings = { delayMs?: number; failure?: "once" | "always" | "uncertain-once"; submittedAt?: string };
export const readRequestSettings = () => transact(requestDatabase.settings, false, (_, values) => (values[0] ?? {}) as RequestMockSettings);
