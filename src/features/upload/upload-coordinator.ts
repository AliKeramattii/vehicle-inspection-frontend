import type { UploadQueueRepository } from "./queue-repository";
import type { UploadMediaSource } from "./media-source";
import type { UploadTransport } from "./upload-transport";
import type { UploadJob } from "./upload-model";
import { automaticRetry, retryDelay, UploadFailure, uploadConcurrency, uploadLeaseMs } from "./retry-policy";

/** Owns transient requests only. Every resumable state transition is committed to the queue. */
export class UploadCoordinator {
  private active = new Map<string, AbortController>();
  private timer?: ReturnType<typeof setTimeout>;
  private pumping = false;
  private stopped = true;
  private online = true;
  private generation = 0;
  private owner: string;
  constructor(private readonly queue: UploadQueueRepository, private readonly media: UploadMediaSource, private readonly transport: UploadTransport,
    private readonly baseOwner: string, private readonly now: () => number = Date.now, private readonly onError: (message: string) => void = () => {}) { this.owner = baseOwner; }
  start(online: boolean) { if (!this.stopped) return; this.owner = `${this.baseOwner}:${++this.generation}`; this.stopped = false; this.online = online; this.wake(); }
  setOnline(online: boolean) {
    this.online = online;
    if (!online) { clearTimeout(this.timer); for (const controller of this.active.values()) controller.abort(); }
    else this.wake();
  }
  wake() { if (!this.stopped && this.online) { clearTimeout(this.timer); void this.pump(); } }
  async stop() {
    const owner = this.owner;
    this.stopped = true; clearTimeout(this.timer);
    for (const controller of this.active.values()) controller.abort();
    await this.queue.release(owner).catch((error: Error) => this.onError(error.message));
  }
  async retry(ids: readonly string[]) { await this.queue.retry(ids); this.wake(); }
  private async pump() {
    if (this.pumping || this.stopped || !this.online) return;
    this.pumping = true;
    try {
      while (!this.stopped && this.online && this.active.size < uploadConcurrency) {
        const job = await this.queue.claim(this.owner, this.now());
        if (!job) break;
        if (this.stopped || !this.online || job.owner !== this.owner) { await this.queue.release(job.owner!); break; }
        const controller = new AbortController(); this.active.set(job.id, controller);
        void this.run(job, controller).catch((error: Error) => this.onError(error.message));
      }
      const jobs = await this.queue.list();
      if (!this.stopped && this.online && jobs.some((job) => job.current && (["local", "queued", "uploading"].includes(job.upload) || job.verification === "processing"))) this.timer = setTimeout(() => this.wake(), 1000);
    } catch (error) { this.onError(error instanceof Error ? error.message : "خواندن صف ارسال ممکن نشد."); }
    finally { this.pumping = false; }
  }
  private async run(job: UploadJob, controller: AbortController) {
    const signal = controller.signal;
    const owner = job.owner!;
    // A lease heartbeat prevents a second tab from claiming a slow upload/processing poll.
    const heartbeat = setInterval(() => { void this.queue.update(job.id, owner, { leaseUntil: this.now() + uploadLeaseMs }).then((valid) => { if (!valid) controller.abort(); }).catch(() => controller.abort()); }, uploadLeaseMs / 3);
    try {
      const blob = job.upload === "uploaded" ? undefined : await this.media.read(job);
      const result = blob ? await this.transport.upload(job, blob, async (bytes) => {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (!await this.media.isCurrent(job)) {
          await this.queue.update(job.id, owner, { current: false, upload: "cancelled", owner: undefined, leaseUntil: undefined });
          controller.abort(); throw new DOMException("Aborted", "AbortError");
        }
        const valid = await this.queue.update(job.id, owner, { bytesUploaded: Math.max(0, Math.min(job.byteSize, bytes)), leaseUntil: this.now() + uploadLeaseMs });
        if (!valid) { controller.abort(); throw new DOMException("Aborted", "AbortError"); }
      }, signal) : await this.transport.check(job, signal);
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      // The accepted revision can change in another tab during transfer. Never publish it as current.
      if (!await this.media.isCurrent(job)) {
        await this.queue.update(job.id, owner, { current: false, upload: "cancelled", owner: undefined, leaseUntil: undefined }); return;
      }
      await this.queue.update(job.id, owner, { upload: "uploaded", verification: result.verification,
        remoteEvidenceId: "evidenceId" in result ? result.evidenceId : job.remoteEvidenceId,
        reviewerReason: "reviewerReason" in result ? result.reviewerReason : undefined,
        bytesUploaded: job.byteSize, lastError: undefined, nextRetryAt: undefined, nextCheckAt: this.now() + 1000, owner: undefined, leaseUntil: undefined });
    } catch (error) {
      if (signal.aborted) await this.queue.update(job.id, owner, { upload: job.upload === "uploaded" ? "uploaded" : "queued", bytesUploaded: job.upload === "uploaded" ? job.byteSize : 0, owner: undefined, leaseUntil: undefined });
      else if (job.upload === "uploaded") await this.queue.update(job.id, owner, { lastError: "دریافت وضعیت پردازش ممکن نشد. فایل ارسال‌شده محفوظ است.", nextCheckAt: this.now() + 30_000, owner: undefined, leaseUntil: undefined });
      else {
        const failure = error instanceof UploadFailure ? error : new UploadFailure("ارسال فایل ممکن نشد. فایل روی دستگاه محفوظ است.");
        const retry = automaticRetry(job.attemptCount, failure.retryable);
        await this.queue.update(job.id, owner, { upload: retry ? "queued" : "failed", retryable: failure.retryable, lastError: failure.message,
          nextRetryAt: retry ? this.now() + retryDelay(job.attemptCount) : undefined, bytesUploaded: 0, owner: undefined, leaseUntil: undefined });
      }
    } finally { clearInterval(heartbeat); if (this.active.get(job.id) === controller) this.active.delete(job.id); this.wake(); }
  }
}
