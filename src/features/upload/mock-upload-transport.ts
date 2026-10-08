import { openUploadDatabase } from "./queue-repository";
import { uploadDatabase, type UploadJob } from "./upload-model";
import { UploadFailure } from "./retry-policy";
import type { UploadTransport } from "./upload-transport";

export type MockUploadSettings = { stepMs?: number; processingMs?: number; failures?: Record<string, "once" | "always" | "terminal"> };
export async function readMockUploadSettings(): Promise<MockUploadSettings> {
  const database = await openUploadDatabase();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(uploadDatabase.settings), request = tx.objectStore(uploadDatabase.settings).get("settings");
    tx.oncomplete = () => { database.close(); resolve(request.result ?? {}); };
    tx.onabort = tx.onerror = () => { database.close(); reject(new Error("خواندن تنظیمات ارسال ممکن نشد.")); };
  });
}
export function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const abort = () => { clearTimeout(timer); signal.removeEventListener("abort", abort); reject(new DOMException("Aborted", "AbortError")); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}
export function createMockUploadTransport(settings: () => Promise<MockUploadSettings> = readMockUploadSettings): UploadTransport {
  return {
    async upload(job, blob, onProgress, signal) {
      const config = await settings();
      for (const part of [0.15, 0.45, 0.75, 1]) {
        await abortableDelay(config.stepMs ?? 250, signal);
        await onProgress(Math.floor(blob.size * part));
        const failure = config.failures?.[job.requirementId ?? job.evidenceKind];
        if (part === 0.45 && (failure === "always" || failure === "terminal" || (failure === "once" && job.attemptCount === 1))) throw new UploadFailure(failure === "terminal" ? "این فایل قابل ارسال نیست. آن را دوباره ثبت کنید." : "ارسال فایل قطع شد. دوباره تلاش می‌کنیم.", failure !== "terminal");
      }
      // Stable registration identity across retries/restarts. This mock performs no HTTP request.
      return { evidenceId: `mock:${job.id}`, verification: "processing" };
    },
    async check(_job: UploadJob, signal) { const config = await settings(); await abortableDelay(config.processingMs ?? 1500, signal); return { verification: "verified" }; },
  };
}
