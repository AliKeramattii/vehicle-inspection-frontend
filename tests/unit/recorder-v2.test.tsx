import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createVideoRecorderService, type VideoRecorderService } from "@/lib/media/video-recorder";
import { useVideoRecording } from "@/features/capture-package/use-video-recording";
import { recordingGuides, recordingProgress } from "@/features/capture-package/recording-guides";
class Recorder {
  static current: Recorder;
  static isTypeSupported = (mime: string) => mime === "video/mp4";
  state = "inactive"; mimeType = "video/mp4";
  onstart?: () => void; onpause?: () => void; onresume?: () => void; onstop?: () => void; onerror?: () => void; ondataavailable?: (event: { data: Blob }) => void;
  constructor() { Recorder.current = this; }
  start() { this.state = "recording"; this.onstart?.(); }
  pause() { this.state = "paused"; this.onpause?.(); }
  resume() { this.state = "recording"; this.onresume?.(); }
  stop() { this.state = "inactive"; this.ondataavailable?.({ data: new Blob(["video"], { type: this.mimeType }) }); this.onstop?.(); }
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe("recorder V2 adaptation", () => {
  it("uses exactly the eight supplied guides and a configurable time-only target", () => {
    expect(recordingGuides).toHaveLength(8); expect(new Set(recordingGuides.map(item => item.file)).size).toBe(8);
    expect(recordingProgress(39)).toBe(65); expect(recordingProgress(100)).toBe(100); expect(recordingProgress(15, 30)).toBe(50); expect(recordingProgress(0, 0)).toBe(0);
  });
  it("excludes all paused time from Blob duration and releases tracks once", async () => {
    vi.stubGlobal("MediaRecorder", Recorder); let now = 0; const stop = vi.fn(), failure = vi.fn();
    const session = await createVideoRecorderService({ open: async () => ({} as MediaStream), stop, capture: vi.fn() }, () => now).open(failure);
    await session.start(); now = 20000; await session.pause!(); now = 70000;
    expect(session.elapsedSeconds!()).toBe(20); await session.resume!(); now = 89000;
    expect(session.elapsedSeconds!()).toBe(39); const video = await session.stop(); expect(video.durationSeconds).toBe(39);
    expect(video.blob.type).toBe("video/mp4"); session.dispose(); expect(stop).toHaveBeenCalledOnce(); expect(failure).not.toHaveBeenCalled();
    expect(Recorder.current.onpause).toBeNull(); expect(Recorder.current.onresume).toBeNull();
  });
  it("can stop a paused recording and discards without false persistence", async () => {
    vi.stubGlobal("MediaRecorder", Recorder); let now = 0; const stop = vi.fn();
    const service = createVideoRecorderService({ open: async () => ({} as MediaStream), stop, capture: vi.fn() }, () => now);
    const session = await service.open(vi.fn()); await session.start(); now = 3000; await session.pause!(); now = 90000;
    expect((await session.stop()).durationSeconds).toBe(3);
    const discarded = await service.open(vi.fn()); await discarded.start(); discarded.dispose(); await expect(discarded.stop()).rejects.toThrow("لغو"); expect(stop).toHaveBeenCalledTimes(2);
  });
  it("cleans up pending pause and reports hardware interruption without saving", async () => {
    vi.stubGlobal("MediaRecorder", Recorder); const stop = vi.fn(), onFailure = vi.fn();
    const session = await createVideoRecorderService({ open: async () => ({} as MediaStream), stop, capture: vi.fn() }).open(onFailure);
    await session.start(); Recorder.current.pause = () => { Recorder.current.state = "paused"; };
    const pending = session.pause!(); session.dispose(); await expect(pending).rejects.toThrow("لغو"); expect(stop).toHaveBeenCalledOnce(); expect(onFailure).not.toHaveBeenCalled();
  });
  it("keeps the UI clock fixed while paused and cleans all timer resources", async () => {
    vi.useFakeTimers(); const dispose = vi.fn(), onRecorded = vi.fn();
    const service: VideoRecorderService = { open: async () => ({ stream: {} as MediaStream, mimeType: "video/mp4", start: async () => {}, pause: async () => {}, resume: async () => {}, stop: async () => ({ blob: new Blob(["video"]), durationSeconds: 39 }), dispose }) };
    const hook = renderHook(() => useVideoRecording(onRecorded, service));
    await act(async () => hook.result.current.start()); await act(async () => vi.advanceTimersByTime(20000));
    await act(async () => hook.result.current.pauseResume()); expect(hook.result.current.state).toBe("paused"); expect(vi.getTimerCount()).toBe(0);
    await act(async () => vi.advanceTimersByTime(90000)); expect(hook.result.current.elapsed).toBe(20);
    await act(async () => hook.result.current.pauseResume()); await act(async () => vi.advanceTimersByTime(19000)); expect(hook.result.current.elapsed).toBe(39);
    hook.unmount(); expect(dispose).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0); expect(onRecorded).not.toHaveBeenCalled();
  });
  it("waits for explicit camera activation and keeps unsupported pause hidden", async () => {
    const open = vi.fn(async () => ({ stream: {} as MediaStream, mimeType: "video/webm", start: vi.fn(), stop: vi.fn(), dispose: vi.fn() }));
    const hook = renderHook(() => useVideoRecording(vi.fn(), { open }));
    expect(open).not.toHaveBeenCalled(); await act(async () => hook.result.current.activate()); expect(hook.result.current.state).toBe("armed"); expect(hook.result.current.canPause).toBe(false); hook.unmount();
  });
});
