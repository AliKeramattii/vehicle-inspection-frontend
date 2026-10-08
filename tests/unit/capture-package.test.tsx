import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { capturePackageProgress, parseOdometer, formatOdometer, nextCaptureTask, type CapturePackageData, type VideoDraft } from "@/features/capture-package/capture-package-model";
import { OdometerField } from "@/features/capture-package/odometer-field";
import { useVideoRecording } from "@/features/capture-package/use-video-recording";
import { createVideoRecorderService, selectVideoMime, readVideoDuration, videoRecordingError, type VideoRecorderService } from "@/lib/media/video-recorder";
import { indexedDBCaptureDataStore as store, validateVideoDraft, videoBlobKey } from "@/lib/media/capture-data-store";
import type { LocalPhoto } from "@/lib/media/photo-store";
import { videoTimer } from "@/features/capture-package/video-capture";
import { VideoReview } from "@/features/capture-package/video-review";
import { photographyTemplateSchema } from "@/schemas/photography";
import { evidenceSchema } from "@/schemas/domain";

const blob = new Blob(["video"], { type: "video/webm" });
const draft: VideoDraft = { blob, durationSeconds: 28, metadata: { kind: "video-360", mimeType: blob.type, sizeBytes: blob.size, capturedAt: "now", localBlobKey: "video" } };
const photos: LocalPhoto[] = template.sections.flatMap((section) => section.photoRequirements).map((photo) => ({ key: photo.id, namespace: "test", requirementId: photo.id, status: "captured" }));
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("separate odometer data", () => {
  it("supports video in generic evidence without forcing a photo shot code", () => {
    expect(evidenceSchema.parse({ id: "video", mediaType: "video360", state: "local", mimeType: "video/mp4", sizeBytes: 20, durationSeconds: 28 }).kind).toBe("video-360");
    expect(evidenceSchema.safeParse({ id: "photo", mediaType: "image", state: "local" }).success).toBe(false);
    expect(evidenceSchema.parse({ id: "photo", shotCode: "odometer-on", mediaType: "image", state: "local" }).kind).toBe("photo");
    expect(evidenceSchema.safeParse({ id: "video", mediaType: "video360", kind: "photo", state: "local" }).success).toBe(false);
  });
  it("requires the numeric-reading link to refer to an existing photo without adding a photograph", () => {
    expect(photographyTemplateSchema.safeParse({ ...template, captureRequirements: { ...template.captureRequirements, odometerRequirementId: "missing" } }).success).toBe(false);
    expect(template.sections.flatMap((section) => section.photoRequirements)).toHaveLength(12);
  });
  it.each(["۴۸٬۳۲۰", "48,320", "٤٨٣٢٠", "48320", "48 320"])("normalizes %s to an integer", (value) => expect(parseOdometer(value)).toBe(48320));
  it.each(["48km", "abc", "-300", "", "48,32", "4٬8٬320", "48.32", "9007199254740992"])("rejects malformed/required/unsafe %s", (value) => expect(() => parseOdometer(value)).toThrow());
  it("accepts zero and formats a Persian value", () => { expect(parseOdometer("۰")).toBe(0); expect(formatOdometer(48320)).toBe("۴۸٬۳۲۰"); });
  it("keeps the twelve-photo counter complete while required numeric/video data is missing", () => {
    expect(capturePackageProgress(template, photos)).toMatchObject({ images: { completed: 12, total: 12, complete: true }, odometer: false, video: false, complete: false });
    expect(nextCaptureTask("id", template, photos).label).toBe("ثبت کیلومتر فعلی");
    const data = { namespace: "test", odometer: { kilometers: 0 } };
    expect(nextCaptureTask("id", template, photos, data).label).toBe("ادامه به ویدیوی ۳۶۰ درجه");
    expect(capturePackageProgress(template, photos, { ...data, video360: { state: "local", accepted: draft } }).complete).toBe(true);
    expect(capturePackageProgress(template, photos, { ...data, video360: { state: "retakeRequired", accepted: draft, reviewerReason: "دور کامل نیست" } }).complete).toBe(false);
    expect(capturePackageProgress(template, photos, { ...data, video360: { state: "local", accepted: draft, draft } }).complete).toBe(true);
  });
  it("validates required field accessibly and permits editing a saved value", async () => {
    const onSave = vi.fn(), user = userEvent.setup();
    const { rerender } = render(<OdometerField onSave={onSave} />);
    await act(async () => screen.getByLabelText("کیلومتر فعلی").closest("form")!.requestSubmit());
    expect(await screen.findByRole("alert")).toHaveTextContent("کیلومتر فعلی را وارد کنید");
    expect(screen.getByLabelText("کیلومتر فعلی")).toHaveAttribute("aria-invalid", "true");
    rerender(<OdometerField key="saved" value={{ kilometers: 48320 }} onSave={onSave} />);
    const input = screen.getByLabelText("کیلومتر فعلی"); expect(input).toHaveValue("۴۸٬۳۲۰"); expect(input).toHaveAttribute("inputmode", "numeric");
    await user.clear(input); await user.type(input, "۰");
    await act(async () => input.closest("form")!.requestSubmit()); expect(onSave).toHaveBeenCalledWith(0);
  });
});

/** Minimal transactional IDB fixture exercises our repository, with rollback and close checks. */
function databaseFixture() {
  const rows = new Map<string, CapturePackageData>(), close = vi.fn(); let failPut = false;
  const database = { close, transaction() {
    const working = new Map(rows);
    const transaction = { oncomplete: undefined as (() => void) | undefined, onabort: undefined as (() => void) | undefined, onerror: undefined, abort() { queueMicrotask(() => transaction.onabort?.()); }, objectStore() { return {
      get(namespace: string) { const request = { result: working.get(namespace), onsuccess: undefined as (() => void) | undefined }; queueMicrotask(() => { request.onsuccess?.(); queueMicrotask(() => { if (!aborted) { rows.clear(); working.forEach((row, key) => rows.set(key, row)); transaction.oncomplete?.(); } }); }); return request; },
      put(row: CapturePackageData) { if (failPut) { aborted = true; throw new DOMException("quota", "QuotaExceededError"); } working.set(row.namespace, row); },
    }; } }; let aborted = false;
    const abort = transaction.abort; transaction.abort = () => { aborted = true; abort(); }; return transaction;
  } };
  vi.stubGlobal("indexedDB", { open() { const request = { result: database, onsuccess: undefined as (() => void) | undefined }; queueMicrotask(() => request.onsuccess?.()); return request; } });
  return { rows, close, fail: (value: boolean) => { failPut = value; } };
}
describe("durable supplemental repository and atomic replacement", () => {
  it("creates unique video keys without secure-context-only randomUUID", () => {
    let next = 0;
    vi.stubGlobal("crypto", { getRandomValues: (values: Uint32Array) => { values.fill(++next); return values; } });
    const first = videoBlobKey("one");
    expect(first).toMatch(/^one:video-360:/);
    expect(videoBlobKey("one")).not.toBe(first);
  });
  it("persists integer edits independently of video drafts", async () => {
    const db = databaseFixture(); await store.saveOdometer("one", { kilometers: 48320, evidenceId: "cluster" });
    await store.saveVideoDraft("one", draft); await store.saveOdometer("one", { kilometers: 0 });
    expect(await store.get("one")).toMatchObject({ odometer: { kilometers: 0 }, video360: { draft } });
    expect(await store.get("two")).toEqual({ namespace: "two" }); expect(db.close).toHaveBeenCalledTimes(5);
  });
  it("preserves accepted video during draft/re-record/discard and failed confirmation", async () => {
    const db = databaseFixture(); await store.saveVideoDraft("one", draft); await store.confirmVideo("one");
    const replacement = { ...draft, durationSeconds: 36 }; await store.saveVideoDraft("one", replacement);
    expect((await store.get("one")).video360).toMatchObject({ accepted: draft, draft: replacement });
    db.fail(true); await expect(store.confirmVideo("one")).rejects.toThrow(); db.fail(false);
    expect((await store.get("one")).video360).toMatchObject({ accepted: draft, draft: replacement });
    await store.discardVideoDraft("one"); expect((await store.get("one")).video360).toEqual({ state: "local", accepted: draft, draft: undefined });
    await store.saveVideoDraft("one", replacement); await store.confirmVideo("one");
    expect((await store.get("one")).video360).toEqual({ state: "local", accepted: replacement });
  });
  it("supports reviewer retake without removing durable good evidence or odometer", async () => {
    databaseFixture(); await store.saveVideoDraft("one", draft); await store.confirmVideo("one"); await store.saveOdometer("one", { kilometers: 10 });
    await store.requestVideoRetake("one", "خودرو کامل دیده نمی‌شود.");
    expect(await store.get("one")).toMatchObject({ odometer: { kilometers: 10 }, video360: { accepted: draft, state: "retakeRequired", reviewerReason: "خودرو کامل دیده نمی‌شود." } });
  });
  it("rejects invalid files/metadata/duration and unsupported storage", async () => {
    expect(() => validateVideoDraft({ ...draft, durationSeconds: 0 })).toThrow();
    expect(() => validateVideoDraft({ ...draft, blob: new Blob(["bad"], { type: "image/jpeg" }) })).toThrow();
    expect(() => validateVideoDraft({ ...draft, metadata: { ...draft.metadata, sizeBytes: 0 } })).toThrow();
    vi.stubGlobal("indexedDB", undefined); await expect(store.get("one")).rejects.toThrow("ذخیره‌سازی");
  });
  it("closes a late database connection after a blocked open was rejected", async () => {
    const close = vi.fn();
    const request = { result: { close }, onblocked: undefined as (() => void) | undefined, onsuccess: undefined as (() => void) | undefined };
    vi.stubGlobal("indexedDB", { open: () => request });
    const result = store.get("one"); request.onblocked?.(); await expect(result).rejects.toThrow("صفحه‌های دیگر");
    request.onsuccess?.(); expect(close).toHaveBeenCalledOnce();
  });
});

class FakeRecorder {
  static isTypeSupported = (mime: string) => mime === "video/mp4";
  static current: FakeRecorder;
  state = "inactive"; mimeType = "video/mp4";
  onstart?: () => void; onstop?: () => void; onerror?: () => void; ondataavailable?: (event: { data: Blob }) => void;
  constructor() { FakeRecorder.current = this; }
  start = vi.fn(() => { this.state = "recording"; this.onstart?.(); });
  stop = vi.fn(() => { this.state = "inactive"; this.ondataavailable?.({ data: new Blob(["chunk"], { type: this.mimeType }) }); this.onstop?.(); });
}
describe("recorder capabilities and lifecycle", () => {
  it("offers video-specific permission recovery instead of photo selection", () => {
    expect(videoRecordingError(new DOMException("denied", "NotAllowedError"))).toContain("ضبط ویدیو");
    expect(videoRecordingError(new DOMException("denied", "NotAllowedError"))).not.toContain("عکس");
  });
  it("detects unsupported recording and chooses browser-supported MIME rather than assuming WebM", async () => {
    expect(selectVideoMime(undefined)).toBeUndefined(); expect(selectVideoMime(FakeRecorder)).toBe("video/mp4");
    expect(selectVideoMime({ isTypeSupported: undefined } as unknown as Pick<typeof MediaRecorder, "isTypeSupported">)).toBeUndefined();
    vi.stubGlobal("MediaRecorder", undefined); const open = vi.fn();
    await expect(createVideoRecorderService({ open, capture: vi.fn(), stop: vi.fn() }).open(vi.fn())).rejects.toThrow("پشتیبانی"); expect(open).not.toHaveBeenCalled();
  });
  it("starts on recorder event, gathers final data and releases every stream once", async () => {
    vi.stubGlobal("MediaRecorder", FakeRecorder); let now = 0; const stop = vi.fn(), stream = {} as MediaStream;
    const session = await createVideoRecorderService({ open: async () => stream, capture: vi.fn(), stop }, () => now).open(vi.fn());
    await session.start(); now = 28000; const result = await session.stop();
    expect(result).toMatchObject({ durationSeconds: 28 }); expect(result.blob.type).toBe("video/mp4"); expect(result.blob.size).toBeGreaterThan(0);
    session.dispose(); expect(stop).toHaveBeenCalledTimes(1); expect(FakeRecorder.current.ondataavailable).toBeNull();
  });
  it("reports record-time failure and disposes recorder/stream without leaked listeners", async () => {
    vi.stubGlobal("MediaRecorder", FakeRecorder); const stop = vi.fn(), fail = vi.fn();
    const session = await createVideoRecorderService({ open: async () => ({} as MediaStream), capture: vi.fn(), stop }).open(fail);
    await session.start(); FakeRecorder.current.onerror?.(); await expect(session.stop()).rejects.toThrow("متوقف");
    expect(fail).toHaveBeenCalledOnce(); expect(stop).toHaveBeenCalledOnce(); expect(FakeRecorder.current.state).toBe("inactive");
  });
  it("releases the opened stream if recorder construction fails", async () => {
    vi.stubGlobal("MediaRecorder", class extends FakeRecorder { constructor() { super(); throw new Error("unsupported device"); } });
    const stop = vi.fn();
    await expect(createVideoRecorderService({ open: async () => ({} as MediaStream), capture: vi.fn(), stop }).open(vi.fn())).rejects.toThrow("unsupported device");
    expect(stop).toHaveBeenCalledOnce();
  });
  it("still releases tracks if recorder cancellation throws", async () => {
    vi.stubGlobal("MediaRecorder", FakeRecorder); const stop = vi.fn();
    const session = await createVideoRecorderService({ open: async () => ({} as MediaStream), capture: vi.fn(), stop }).open(vi.fn());
    await session.start(); FakeRecorder.current.stop.mockImplementation(() => { throw new DOMException("stopped already", "InvalidStateError"); });
    expect(() => session.dispose()).not.toThrow(); expect(stop).toHaveBeenCalledOnce();
  });
  it("waits for actual recorder start before starting the timer", async () => {
    vi.useFakeTimers(); let started!: () => void; const dispose = vi.fn();
    const service: VideoRecorderService = { open: async () => ({ stream: {} as MediaStream, mimeType: blob.type, start: () => new Promise<void>((resolve) => { started = resolve; }), stop: vi.fn(), dispose }) };
    const hook = renderHook(() => useVideoRecording(vi.fn(), service));
    let pending!: Promise<void>; await act(async () => { pending = hook.result.current.start(); });
    expect(hook.result.current.state).toBe("opening"); expect(vi.getTimerCount()).toBe(0);
    await act(async () => { started(); await pending; });
    expect(hook.result.current.state).toBe("recording"); expect(vi.getTimerCount()).toBe(1);
    hook.unmount(); expect(dispose).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
  });
  it("does not open duplicate streams while permission is pending", async () => {
    let finish!: (session: Awaited<ReturnType<VideoRecorderService["open"]>>) => void;
    const open = vi.fn(() => new Promise<Awaited<ReturnType<VideoRecorderService["open"]>>>((resolve) => { finish = resolve; }));
    const hook = renderHook(() => useVideoRecording(vi.fn(), { open }));
    let pending!: Promise<void>; act(() => { pending = hook.result.current.start(); });
    await act(async () => hook.result.current.start()); expect(open).toHaveBeenCalledOnce();
    const dispose = vi.fn(); hook.unmount();
    await act(async () => { finish({ stream: {} as MediaStream, mimeType: blob.type, start: vi.fn(), stop: vi.fn(), dispose }); await pending; });
    expect(dispose).toHaveBeenCalledOnce();
  });
  it("stops recorder/timer on unmount and stops a late permission response", async () => {
    vi.useFakeTimers(); const dispose = vi.fn(), onRecorded = vi.fn();
    const service: VideoRecorderService = { open: async () => ({ stream: {} as MediaStream, mimeType: blob.type, start: async () => {}, stop: async () => ({ blob, durationSeconds: 28 }), dispose }) };
    const hook = renderHook(() => useVideoRecording(onRecorded, service));
    await act(async () => hook.result.current.start()); expect(hook.result.current.state).toBe("recording");
    await act(async () => vi.advanceTimersByTime(28000)); expect(hook.result.current.elapsed).toBe(28); expect(videoTimer(28)).toBe("۰۰:۲۸");
    hook.unmount(); expect(dispose).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0); expect(onRecorded).not.toHaveBeenCalled();
    let finish!: (session: Awaited<ReturnType<VideoRecorderService["open"]>>) => void;
    const late = renderHook(() => useVideoRecording(onRecorded, { open: () => new Promise((resolve) => { finish = resolve; }) }));
    let pending!: Promise<void>; act(() => { pending = late.result.current.start(); }); late.unmount();
    await act(async () => { finish(await service.open(vi.fn())); await pending; }); expect(dispose).toHaveBeenCalledTimes(2);
  });
  it("keeps a failed local save retryable and clears timer before persistence", async () => {
    vi.useFakeTimers(); const onRecorded = vi.fn().mockRejectedValueOnce(new Error("save failed")).mockResolvedValue(undefined);
    const service: VideoRecorderService = { open: async () => ({ stream: {} as MediaStream, mimeType: blob.type, start: async () => {}, stop: async () => ({ blob, durationSeconds: 28 }), dispose: vi.fn() }) };
    const hook = renderHook(() => useVideoRecording(onRecorded, service));
    await act(async () => hook.result.current.start()); await act(async () => hook.result.current.stop());
    expect(hook.result.current.state).toBe("error"); expect(hook.result.current.canRetrySave).toBe(true); expect(vi.getTimerCount()).toBe(0);
    await act(async () => hook.result.current.retrySave()); expect(onRecorded).toHaveBeenCalledTimes(2); hook.unmount();
  });
  it("cancels native metadata timers and releases object URL", async () => {
    vi.useFakeTimers(); const revoke = vi.fn(); vi.stubGlobal("URL", class extends URL { static createObjectURL() { return "blob:test"; } static revokeObjectURL = revoke; }); vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    const controller = new AbortController(), result = readVideoDuration(blob, controller.signal); controller.abort();
    await expect(result).rejects.toHaveProperty("name", "AbortError"); expect(vi.getTimerCount()).toBe(0); expect(revoke).toHaveBeenCalledWith("blob:test");
  });
  it("reviews playable video with native controls and replacement actions, without checklists", async () => {
    vi.stubGlobal("URL", class extends URL { static createObjectURL() { return "blob:test"; } static revokeObjectURL = vi.fn(); }); const onConfirm = vi.fn(), onRetake = vi.fn();
    render(<VideoReview inspectionId="one" video={{ state: "local", accepted: draft, draft }} onConfirm={onConfirm} onRetake={onRetake} />);
    expect(document.querySelector("video")).toHaveAttribute("controls"); expect(screen.getByText("۰۰:۲۸")).toBeVisible(); expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText(/ویدیوی قبلی تا تأیید/)).toBeVisible(); await userEvent.click(screen.getByRole("button", { name: "تأیید و ذخیره" })); expect(onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "ضبط مجدد" })); expect(onRetake).toHaveBeenCalledOnce();
  });
});
