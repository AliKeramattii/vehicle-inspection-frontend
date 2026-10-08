import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { PhotographyOverview } from "@/features/photography/photography-overview";
import { photoRequirementEntry } from "@/features/photography/photography-model";
import { PhotoReview } from "@/features/photography/photo-review";
import type { LocalPhoto } from "@/lib/media/photo-store";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const photo = template.sections[2].photoRequirements[0];
const blob = new Blob(["accepted evidence"], { type: "image/jpeg" });
const accepted: LocalPhoto = { key: photo.id, namespace: "test", requirementId: photo.id, status: "captured", blob, capturedAt: "accepted" };
const draft = { blob: new Blob(["replacement"], { type: "image/jpeg" }), capturedAt: "draft" };
const scenarios = [
  { name: "pending", records: [], view: "guide", state: "pending", action: "عکاسی", completed: 0 },
  { name: "completed", records: [accepted], view: "review", state: "complete", action: "مشاهده عکس", completed: 1 },
  { name: "retake", records: [{ ...accepted, status: "retake-requested" as const, reviewerReason: "پلاک خوانا نیست." }], view: "guide", state: "attention", action: "عکاسی مجدد", completed: 0 },
  { name: "new draft", records: [{ ...accepted, status: "pending" as const, blob: undefined, draft }], view: "review", state: "attention", action: "ادامه بررسی عکس", completed: 0 },
  { name: "replacement draft", records: [{ ...accepted, draft }], view: "review", state: "attention", action: "ادامه بررسی عکس", completed: 1 },
  { name: "retake with draft", records: [{ ...accepted, status: "retake-requested" as const, reviewerReason: "پلاک خوانا نیست.", draft }], view: "review", state: "attention", action: "ادامه بررسی عکس", completed: 0 },
];
beforeEach(() => push.mockClear());
afterEach(() => vi.unstubAllGlobals());

describe("requirement-based vehicle marker entry", () => {
  it.each(scenarios)("opens $name in its exact context and synchronizes selection without changing evidence", async ({ records, view, state, action, completed }) => {
    const user = userEvent.setup();
    expect(photoRequirementEntry(photo, records)).toEqual({ view, action });
    render(<PhotographyOverview template={template} records={records} inspectionId="insp_demo" />);
    const marker = screen.getByRole("button", { name: new RegExp(`^${action} ${photo.title}،`) });
    expect(marker).toBeEnabled();
    expect(marker).toHaveAttribute("type", "button");
    expect(marker).toHaveAttribute("data-requirement", photo.id);
    expect(marker).toHaveAttribute("data-state", state);
    await user.click(marker);
    expect(push).toHaveBeenCalledExactlyOnceWith(`/inspection/insp_demo/capture/photo/${photo.id}/${view}`, { scroll: false });
    expect(document.querySelector('.vehicle-photo-marker[aria-pressed="true"]')).toHaveAttribute("data-requirement", photo.id);
    expect(document.querySelector('.vehicle-photo-marker[aria-pressed="true"]')).toHaveAttribute("data-state", state);
    expect(document.querySelector('.photography-shot-card[aria-pressed="true"]')).toHaveAttribute("data-requirement", photo.id);
    expect(screen.getByRole("link", { name: /عکاسی نمای بعدی:|مشاهده عکس:|ادامه بررسی:/ })).toHaveAttribute("href", `/inspection/insp_demo/capture/photo/${photo.id}/${view}`);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", String(completed));
    expect(accepted.blob).toBe(blob);
    if (records[0]?.draft) expect(records[0].draft.blob).toBe(draft.blob);
  });

  it.each(["{Enter}", " "])("activates a tab-focused selected marker with %s", async (key) => {
    const user = userEvent.setup();
    render(<PhotographyOverview template={template} records={[]} inspectionId="insp_demo" />);
    await user.tab();
    const marker = document.querySelector('.vehicle-photo-marker[aria-pressed="true"]');
    expect(marker).toHaveFocus();
    await user.keyboard(key);
    expect(push).toHaveBeenCalledExactlyOnceWith("/inspection/insp_demo/capture/photo/front-45-right/guide", { scroll: false });
  });

  it("keeps a selected completed marker enabled even when all twelve photos are done", async () => {
    const records = template.sections.flatMap((section) => section.photoRequirements.map((item) => ({ ...accepted, requirementId: item.id })));
    const user = userEvent.setup();
    render(<PhotographyOverview template={template} records={records} inspectionId="insp_demo" />);
    const marker = document.querySelector<HTMLButtonElement>('.vehicle-photo-marker[aria-pressed="true"]')!;
    expect(marker).toHaveAttribute("data-state", "complete");
    expect(marker).toBeEnabled();
    await user.click(marker);
    expect(push).toHaveBeenCalledExactlyOnceWith("/inspection/insp_demo/capture/photo/front-45-right/review", { scroll: false });
    expect(screen.getByRole("link", { name: "ثبت کیلومتر فعلی" })).toHaveAttribute("href", "/inspection/insp_demo/capture/photo/odometer-on/review");
  });

  it("keeps the reviewer reason visible when a retake draft reopens review", () => {
    vi.stubGlobal("URL", class extends URL { static createObjectURL() { return "blob:test"; } static revokeObjectURL = vi.fn(); });
    const record = { ...accepted, status: "retake-requested" as const, reviewerReason: "پلاک خوانا نیست.", draft };
    render(<PhotoReview photo={photo} section={template.sections[2]} record={record} inspectionId="insp_demo" onConfirm={vi.fn()} onRetake={vi.fn()} />);
    expect(screen.getByText("نیاز به عکاسی مجدد: پلاک خوانا نیست.")).toHaveAttribute("role", "status");
    expect(screen.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "عکاسی مجدد" })).toBeEnabled();
    expect(record.blob).toBe(blob);
  });
});
