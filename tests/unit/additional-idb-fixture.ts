import { vi } from "vitest";

/** Serialized transaction fixture, including rollback; browser scenarios verify real IndexedDB durability. */
export function additionalDatabaseFixture() {
  const databases = new Map<string, Map<string, Map<string, unknown>>>(); let tail = Promise.resolve(); const close = vi.fn();
  vi.stubGlobal("BroadcastChannel", undefined);
  vi.stubGlobal("indexedDB", { open(name: string) {
    const stores = databases.get(name) ?? new Map<string, Map<string, unknown>>(); databases.set(name, stores);
    const db = { close, transaction(storeName: string, mode = "readonly") {
      let release!: () => void; const previous = tail; tail = new Promise<void>((resolve) => { release = resolve; }); let aborted = false;
      const rows = stores.get(storeName) ?? new Map<string, unknown>(); stores.set(storeName, rows); let working: Map<string, unknown>;
      const tx = { oncomplete: undefined as (() => void) | undefined, onabort: undefined as (() => void) | undefined, onerror: undefined as (() => void) | undefined,
        abort() { aborted = true; }, objectStore() {
          const read = (key?: string) => { const request = { result: undefined as unknown, onsuccess: undefined as (() => void) | undefined }; void previous.then(() => {
            working = new Map(rows); request.result = key === undefined ? [...working.values()] : working.get(key);
            request.onsuccess?.(); if (aborted) tx.onabort?.(); else { if (mode === "readwrite") { rows.clear(); for (const [key, value] of working) rows.set(key, value); } tx.oncomplete?.(); } release();
          }); return request; };
          const put = (value: unknown, key?: string) => { const row = value as { key?: string; id?: string; namespace?: string; inspectionId?: string }; working.set(key ?? row.key ?? row.id ?? row.namespace ?? row.inspectionId!, value); };
          return { getAll: () => read(), get: (key: string) => read(key), put, add: put };
        } };
      return tx;
    } };
    const request = { result: db, onsuccess: undefined as (() => void) | undefined }; queueMicrotask(() => request.onsuccess?.()); return request;
  } });
  return { databases, close };
}
