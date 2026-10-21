import { emptyLifecycleWorkspace, type LifecycleWorkspace } from "./lifecycle-model";
export interface LifecyclePersistence { transact<T>(change: (state: LifecycleWorkspace) => T): Promise<T> }
export class MemoryLifecyclePersistence implements LifecyclePersistence {
 private state = emptyLifecycleWorkspace(); private tail: Promise<unknown> = Promise.resolve();
 transact<T>(change: (state: LifecycleWorkspace) => T) { const next = this.tail.then(() => { const copy = structuredClone(this.state); const value = change(copy); this.state = copy; return structuredClone(value); }); this.tail = next.catch(() => undefined); return next; }
}
export class IndexedDbLifecyclePersistence implements LifecyclePersistence {
 async transact<T>(change: (state: LifecycleWorkspace) => T): Promise<T> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
   const open = indexedDB.open("inspection-lifecycle", 1); let abandoned = false;
   open.onupgradeneeded = () => open.result.createObjectStore("state");
   open.onsuccess = () => { if (abandoned) { open.result.close(); return; } open.result.onversionchange = () => open.result.close(); resolve(open.result); };
   open.onerror = () => reject(new Error("خواندن وضعیت بازدید ممکن نشد."));
   open.onblocked = () => { abandoned = true; reject(new Error("صفحه‌های دیگر بازدید را ببندید و دوباره تلاش کنید.")); };
  });
  return new Promise((resolve, reject) => {
   const tx = db.transaction("state", "readwrite"), store = tx.objectStore("state"), read = store.get("current"); let result: T, cause: unknown;
   read.onsuccess = () => { try { const state: LifecycleWorkspace = read.result ?? emptyLifecycleWorkspace(); result = change(state); store.put(state, "current"); } catch (e) { cause = e; tx.abort(); } };
   tx.oncomplete = () => { db.close(); resolve(result); }; tx.onerror = tx.onabort = () => { db.close(); reject(cause ?? new Error("ذخیره وضعیت بازدید ممکن نشد. مدارک محفوظ هستند.")); };
  });
 }
}
