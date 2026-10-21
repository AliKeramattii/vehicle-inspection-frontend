import type { AdminWorkspace } from "./model";
import { initialAdminWorkspace } from "./fixtures";
export interface AdminPersistence {
  read(): Promise<AdminWorkspace>;
  transact<T>(change: (workspace: AdminWorkspace) => T): Promise<T>;
}
export class MemoryAdminPersistence implements AdminPersistence {
  private workspace = initialAdminWorkspace();
  private tail: Promise<unknown> = Promise.resolve();
  async read() { await this.tail; return structuredClone(this.workspace); }
  transact<T>(change: (workspace: AdminWorkspace) => T): Promise<T> {
    const task = this.tail.then(() => {
      const copy = structuredClone(this.workspace); const result = change(copy);
      this.workspace = copy; return structuredClone(result);
    });
    this.tail = task.catch(() => undefined); return task;
  }
}
export class IndexedDbAdminPersistence implements AdminPersistence {
  constructor(private key = "current") {}
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      let abandoned = false;
      const request = indexedDB.open("inspection-admin", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("workspace");
      request.onsuccess = () => { if (abandoned) { request.result.close(); return; } request.result.onversionchange = () => request.result.close(); resolve(request.result); };
      request.onerror = () => reject(new Error("Admin storage unavailable"));
      request.onblocked = () => { abandoned = true; reject(new Error("Admin storage blocked")); };
    });
  }
  async read(): Promise<AdminWorkspace> { return this.transact(w => structuredClone(w)); }
  async transact<T>(change: (workspace: AdminWorkspace) => T): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("workspace", "readwrite");
      const store = transaction.objectStore("workspace"); const request = store.get(this.key);
      let result: T; let failure: unknown;
      request.onsuccess = () => {
        try {
          const workspace: AdminWorkspace = request.result ?? initialAdminWorkspace();
          result = change(workspace); store.put(workspace, this.key);
        } catch (error) { failure = error; transaction.abort(); }
      };
      transaction.oncomplete = () => { db.close(); resolve(result); };
      transaction.onabort = transaction.onerror = () => { db.close(); reject(failure ?? new Error("Admin storage write failed")); };
    });
  }
}
