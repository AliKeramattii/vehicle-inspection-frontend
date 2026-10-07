import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, renderHook, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inspectionPhotographyTemplate as template, templateCapturePlan } from "@/features/photography/inspection-template";
import { findRequirement, nextRequirement, nextSection, photographyProgress, sectionProgress, photographyVisualState } from "@/features/photography/photography-model";
import { PhotographyOverview } from "@/features/photography/photography-overview";
import { SectionDetail } from "@/features/photography/section-detail";
import { PhotoGuidance } from "@/features/photography/photo-guidance";
import { PhotoReview } from "@/features/photography/photo-review";
import { useCamera } from "@/features/photography/use-camera";
import { photographyTemplateSchema } from "@/schemas/photography";
import { browserCameraService, cameraError, type CameraService } from "@/lib/media/camera-service";
import { photoKey, photoNamespace, validatePhotoBlob, type LocalPhoto } from "@/lib/media/photo-store";
import { createMockInspectionRepository } from "@/mocks/inspection-repository";
import { capturePlanFixture } from "@/mocks/fixtures";

const all = template.sections.flatMap((section) => section.photoRequirements);
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
Element.prototype.scrollIntoView = vi.fn();
const blob = new Blob(["photo"], { type: "image/jpeg" });
const record = (id: string): LocalPhoto => ({ key: id, namespace: "test", requirementId: id, status: "captured", blob, capturedAt: "2026-10-06T00:00:00Z" });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("authoritative photography configuration", () => {
  it("defines exactly seven sections and twelve unique required photos with matching exact filenames", () => {
    expect(template.sections.map((section) => section.photoRequirements.length)).toEqual([2, 2, 1, 1, 2, 3, 1]);
    expect(all).toHaveLength(12); expect(new Set(all.map((photo) => photo.id)).size).toBe(12);
    for (const photo of all) {
      expect(photo.required).toBe(true); expect(photo.sampleImage).toBe(`/assets/inspection/photo-guides/${photo.id}.webp`);
      const source = readFileSync(`references/assets/vehicle-inspection-ui-assets/photo-guides/${photo.id}.webp`);
      const runtime = readFileSync(`public${photo.sampleImage}`);
      expect(createHash("sha256").update(runtime).digest("hex")).toBe(createHash("sha256").update(source).digest("hex"));
    }
  });
  it("validates unique section/requirement IDs without imposing a fixed twelve-photo platform limit", () => {
    expect(photographyTemplateSchema.safeParse({ ...template, sections: [template.sections[0]] }).success).toBe(true);
    expect(photographyTemplateSchema.safeParse({ ...template, sections: [template.sections[0], template.sections[0]] }).success).toBe(false);
    expect(photographyTemplateSchema.safeParse({ ...template, sections: [{ ...template.sections[0], photoRequirements: [all[0], all[0]] }] }).success).toBe(false);
  });
  it("adapts one template to the repository without shared mutable state or changing bootstrap samples", async () => {
    const repository = createMockInspectionRepository(), plan = await repository.getCapturePlan("insp_demo");
    expect(plan.totalRequired).toBe(12); expect(plan.shots.map((photo) => photo.code)).toEqual(all.map((photo) => photo.id));
    plan.sections![0].photoRequirements[0].title = "changed";
    expect((await repository.getCapturePlan("insp_demo")).sections![0].photoRequirements[0].title).toBe(all[0].title);
    expect(capturePlanFixture.shots).toHaveLength(2); expect(templateCapturePlan().totalRequired).toBe(12);
  });
  it("derives zero, partial, complete, retake and optional-photo progress", () => {
    expect(photographyProgress(template, [])).toMatchObject({ completed: 0, total: 12, remaining: 12, complete: false });
    expect(photographyProgress(template, all.slice(0, 4).map((photo) => record(photo.id)))).toMatchObject({ completed: 4, remaining: 8 });
    const records = all.map((photo) => record(photo.id));
    expect(photographyProgress(template, records).complete).toBe(true);
    records[0].status = "retake-requested";
    expect(photographyProgress(template, records)).toMatchObject({ completed: 11, complete: false });
    expect(sectionProgress(template.sections[0], records)).toMatchObject({ completed: 1, total: 2, retake: true });
    expect(photographyProgress({ ...template, sections: [{ ...template.sections[0], photoRequirements: [{ ...all[0], required: false }] }] }, records).total).toBe(0);
  });
  it("continues within a section, handles completed-section replacement and locates stable IDs", () => {
    expect(nextRequirement(template.sections[0], [], all[0].id)?.id).toBe(all[1].id);
    expect(nextRequirement(template.sections[0], [record(all[1].id)], all[0].id)).toBeUndefined();
    expect(nextSection(template, [record(all[0].id), record(all[1].id)])?.id).toBe("left");
    expect(findRequirement(template, "front-plate")?.section.id).toBe("front");
    expect(findRequirement(template, "CAP-14")).toBeUndefined();
  });
  it("isolates evidence by inspection/template version and validates captured blobs", () => {
    expect(photoNamespace("one", template.templateId, 1)).not.toBe(photoNamespace("two", template.templateId, 1));
    expect(photoKey(photoNamespace("one", template.templateId, 1), "front-plate")).not.toBe(photoKey(photoNamespace("one", template.templateId, 2), "front-plate"));
    expect(() => validatePhotoBlob(blob)).not.toThrow();
    expect(() => validatePhotoBlob(new Blob(["text"], { type: "text/plain" }))).toThrow();
    expect(() => validatePhotoBlob(new Blob([], { type: "image/jpeg" }))).toThrow();
  });
});
describe("image-guided presentation", () => {
  it("renders computed progress, image navigation and no WebGL controls", () => {
    render(<PhotographyOverview template={template} records={all.slice(0, 4).map((photo) => record(photo.id))} inspectionId="insp_demo" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "4");
    expect(screen.getByRole("button", { name: "نمای خودرو: راست" })).toBeVisible();
    expect(screen.getByRole("link", { name: /عکاسی نمای بعدی: نمای مستقیم جلو/ })).toBeVisible();
    expect(screen.queryByRole("button", { name: /سه‌بعدی|چرخش/ })).not.toBeInTheDocument();
  });
  it("exposes the final review only when all configured required photos are satisfied", () => {
    render(<PhotographyOverview template={template} records={all.map((photo) => record(photo.id))} inspectionId="insp_demo" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "12");
    expect(screen.getByRole("link", { name: "بررسی و ارسال" })).toHaveAttribute("href", "/inspection/insp_demo/capture/review");
  });
  it("shows large exact samples, captured-card view/replacement and reviewer reasons", () => {
    const retake = { ...record(all[0].id), status: "retake-requested" as const, reviewerReason: "پلاک خوانا نیست." };
    render(<SectionDetail template={template} section={template.sections[0]} records={[retake, record(all[1].id)]} inspectionId="insp_demo" />);
    expect(screen.getByText("پلاک خوانا نیست.")).toBeVisible(); expect(screen.getByRole("link", { name: "عکاسی مجدد" })).toHaveAttribute("href", expect.stringContaining(all[0].id));
    expect(screen.getByRole("link", { name: "تعویض عکس" })).toHaveAttribute("href", expect.stringContaining(all[1].id));
    expect(screen.getByRole("img", { name: /نمونه صحیح/ })).toHaveAttribute("src", expect.stringContaining("front-45-right.webp"));
  });
  it("renders correct physical left instructions without mirroring the image or opening a camera", () => {
    const section = template.sections[1]; render(<PhotoGuidance photo={section.photoRequirements[0]} section={section} records={[]} inspectionId="insp_demo" />);
    expect(screen.getByText("از زاویه ۴۵ درجه سمت چپ عکس بگیرید.")).toBeVisible();
    expect(screen.getByRole("link", { name: "باز کردن دوربین" })).toHaveAttribute("href", expect.stringContaining("front-45-left/camera"));
    expect(document.querySelector("video")).toBeNull();
  });
  it("confirms evidence without manual quality certification and preserves retake", async () => {
    vi.stubGlobal("URL", class extends URL { static createObjectURL() { return "blob:test"; } static revokeObjectURL = vi.fn(); });
    const onConfirm = vi.fn(), onRetake = vi.fn(), user = userEvent.setup(), photo = all[4];
    render(<PhotoReview photo={photo} section={template.sections[2]} record={{ ...record(photo.id), draft: { blob, capturedAt: "now" } }} inspectionId="insp_demo" onConfirm={onConfirm} onRetake={onRetake} />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByText("کیفیت عکس مناسب است")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "تأیید و ادامه" })); expect(onConfirm).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "عکاسی مجدد" })); expect(onRetake).toHaveBeenCalledOnce();
  });
  it("handles absent captured evidence without showing a fabricated quality success", () => {
    render(<PhotoReview photo={all[0]} section={template.sections[0]} inspectionId="insp_demo" onConfirm={vi.fn()} onRetake={vi.fn()} />);
    expect(screen.getByText("هنوز عکسی برای این نما ثبت نشده است.")).toBeVisible(); expect(screen.queryByText("کیفیت عکس مناسب است")).toBeNull();
  });
  it("exposes durable unconfirmed drafts for recovery without counting them complete", () => {
    vi.stubGlobal("URL", class extends URL { static createObjectURL() { return "blob:test"; } static revokeObjectURL = vi.fn(); });
    render(<SectionDetail template={template} section={template.sections[0]} records={[{ ...record(all[0].id), status: "pending", blob: undefined, draft: { blob, capturedAt: "now" } }]} inspectionId="insp_demo" />);
    expect(screen.getByRole("link", { name: "ادامه بررسی عکس" })).toHaveAttribute("href", expect.stringContaining("front-45-right/review"));
    expect(screen.getByText("در انتظار تأیید")).toBeVisible();
    expect(screen.getByText("۰ از ۲ تصویر")).toBeVisible();
  });
});
describe("vehicle image navigation and continuation", () => {
  it("represents pending, accepted and retake/draft evidence without color-only status", () => {
    expect(photographyVisualState(all[0], [])).toBe("pending");
    expect(photographyVisualState(all[0], [record(all[0].id)])).toBe("complete");
    expect(photographyVisualState(all[0], [{ ...record(all[0].id), status: "retake-requested" }])).toBe("attention");
    expect(photographyVisualState(all[0], [{ ...record(all[0].id), draft: { blob, capturedAt: "now" } }])).toBe("attention");
  });
  it("keeps marker, image, card, section and CTA selection in sync", async () => {
    const user = userEvent.setup();
    render(<PhotographyOverview template={template} records={[]} inspectionId="insp_demo" />);
    await user.click(screen.getByRole("button", { name: "عکاسی نمای مستقیم جلو با پلاک، ثبت نشده" }));
    expect(screen.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", expect.stringContaining("front-plate.webp"));
    expect(document.querySelector('.photography-shot-card[data-requirement="front-plate"]')).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector('.vehicle-photo-marker[data-requirement="front-plate"]')).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: /عکاسی نمای بعدی: نمای مستقیم جلو/ })).toHaveAttribute("href", expect.stringContaining("front-plate/guide"));
    await user.click(screen.getByRole("button", { name: /کابین/ }));
    expect(document.querySelectorAll('.photography-shot-card')).toHaveLength(2);
    expect(screen.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", expect.stringContaining("odometer-on.webp"));
    await user.click(screen.getByRole("button", { name: "نمای خودرو: چپ" }));
    expect(screen.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", expect.stringContaining("front-45-left.webp"));
    await user.click(screen.getByRole("button", { name: "بازنشانی به نمای بعدی" }));
    expect(screen.getByRole("img", { name: /نمای راهنمای خودرو/ })).toHaveAttribute("src", expect.stringContaining("front-45-right.webp"));
  });
  it("offers the actual next section after completing a section", () => {
    render(<SectionDetail template={template} section={template.sections[0]} records={[record(all[0].id), record(all[1].id)]} inspectionId="insp_demo" />);
    expect(screen.getByRole("link", { name: "ادامه به نمای چپ" })).toHaveAttribute("href", expect.stringContaining("front-45-left/guide"));
  });
  it("uses requirement-specific guidance and technical distances", () => {
    const odometer = findRequirement(template, "odometer-on")!.photo;
    const vin = findRequirement(template, "chassis-number")!.photo;
    const engine = findRequirement(template, "engine-bay")!.photo;
    expect(odometer.guidanceTopics).toContain("ignition"); expect(odometer.distance).toBe("نزدیک");
    expect(vin.guidanceTopics).toContain("text"); expect(vin.distance).toBe("۳۰ سانتی‌متر");
    expect(engine.guidanceTopics).toContain("hood"); expect(engine.distance).toBe("۱ متر");
    for (const photo of all) expect(photo.guidanceTopics).toHaveLength(photo.instructions.length);
  });
});
describe("camera service lifecycle", () => {
  it("requests only video with an environment preference and stops every track", async () => {
    const stops = [vi.fn(), vi.fn()], stream = { getTracks: () => stops.map((stop) => ({ stop })) } as unknown as MediaStream;
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia } });
    expect(await browserCameraService.open()).toBe(stream);
    expect(getUserMedia).toHaveBeenCalledWith(expect.objectContaining({ audio: false, video: expect.objectContaining({ facingMode: { ideal: "environment" } }) }));
    browserCameraService.stop(stream); expect(stops.every((stop) => stop.mock.calls.length === 1)).toBe(true);
  });
  it("reports denied/unavailable camera errors and rejects capture before video readiness", async () => {
    expect(cameraError(new DOMException("denied", "NotAllowedError"))).toContain("دسترسی دوربین");
    vi.stubGlobal("navigator", {}); await expect(browserCameraService.open()).rejects.toThrow("اتصال امن");
    await expect(browserCameraService.capture(document.createElement("video"))).rejects.toThrow("آماده نیست");
  });
  it("stops a late permission response after leaving the camera", async () => {
    let resolve!: (stream: MediaStream) => void;
    const stream = {} as MediaStream, stop = vi.fn(), service: CameraService = { open: () => new Promise((finish) => { resolve = finish; }), capture: vi.fn(), stop };
    const { unmount } = renderHook(() => useCamera(service));
    await waitFor(() => expect(resolve).toBeDefined()); unmount(); resolve(stream);
    await waitFor(() => expect(stop).toHaveBeenCalledWith(stream));
  });
});
