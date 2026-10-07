import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { inspectionPhotographyTemplate as template } from "@/features/photography/inspection-template";
import { photographyProgress, photographyVisualState, sectionProgress } from "@/features/photography/photography-model";
import { PhotographyOverview } from "@/features/photography/photography-overview";
import { SectionRow } from "@/features/photography/section-row";
import { PhotoImage } from "@/features/photography/photo-image";
import { PhotographyLoading } from "@/features/photography/photography-loading";
import type { LocalPhoto } from "@/lib/media/photo-store";

const section = template.sections[0], photo = section.photoRequirements[0];
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
const blob = new Blob(["evidence"], { type: "image/jpeg" });
const accepted: LocalPhoto = { key: photo.id, namespace: "test", requirementId: photo.id, status: "captured", blob, capturedAt: "now" };
const draft = { blob, capturedAt: "replacement" };

describe("completion credit and attention are independent", () => {
  it.each([
    { label: "uncaptured", records: [], completed: 0, attention: false, state: "pending" },
    { label: "new draft", records: [{ ...accepted, status: "pending" as const, blob: undefined, draft }], completed: 0, attention: true, state: "attention" },
    { label: "accepted", records: [accepted], completed: 1, attention: false, state: "complete" },
    { label: "accepted plus replacement", records: [{ ...accepted, draft }], completed: 1, attention: true, state: "attention" },
    { label: "explicit retake", records: [{ ...accepted, status: "retake-requested" as const }], completed: 0, attention: true, state: "attention" },
  ])("derives $label consistently without mutating evidence", ({ records, completed, attention, state }) => {
    expect(photographyVisualState(photo, records)).toBe(state);
    expect(sectionProgress(section, records)).toMatchObject({ completed, attention, state: completed === 1 && !attention ? "attention" : state });
    expect(photographyProgress(template, records)).toMatchObject({ completed, attention, total: 12 });
    expect(accepted.blob).toBe(blob);
  });
  it("keeps a completed section blue unless a draft needs attention, while retaining both credits", () => {
    const records = section.photoRequirements.map((item) => ({ ...accepted, requirementId: item.id }));
    expect(sectionProgress(section, records)).toMatchObject({ completed: 2, remaining: 0, state: "complete", attention: false });
    records[0] = { ...records[0], draft };
    expect(sectionProgress(section, records)).toMatchObject({ completed: 2, remaining: 0, state: "attention", attention: true });
    render(<SectionRow section={section} records={records} inspectionId="insp_demo" />);
    expect(screen.getByRole("link")).toHaveAttribute("data-state", "attention");
    expect(screen.getByRole("link")).toHaveAccessibleName(/در انتظار تأیید/);
  });
  it("selection is independent of pending evidence and controls are outside the image scene", () => {
    render(<PhotographyOverview template={template} records={[]} inspectionId="insp_demo" />);
    const selected = document.querySelector('.vehicle-photo-marker[aria-pressed="true"]');
    expect(selected).toHaveAttribute("data-state", "pending");
    const controls = screen.getByRole("navigation", { name: "نماهای خودرو" });
    expect(controls.closest(".vehicle-photo-scene")).toBeNull();
    expect(document.querySelector('.photography-shot-card[aria-pressed="true"]')).toHaveAttribute("data-state", "pending");
  });
});

describe("composition-preserving image and loading states", () => {
  it("retries an image failure inside the same frame", () => {
    render(<PhotoImage src="/test.webp" alt="نمونه" frame="technical-closeup" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("alert")).toHaveTextContent("تصویر قابل نمایش نیست.");
    expect(document.querySelector('.photography-image')).toHaveAttribute("data-frame", "technical-closeup");
    fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    expect(screen.getByRole("img", { name: "نمونه" })).toBeInTheDocument();
  });
  it("keeps progress, vehicle, control and card geometry while loading", () => {
    render(<PhotographyLoading message="در حال آماده‌سازی بازدید…" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector('.skeleton-image')).toBeInTheDocument();
    expect(document.querySelector('.skeleton-controls')).toBeInTheDocument();
    expect(document.querySelectorAll('.skeleton-cards > span')).toHaveLength(3);
  });
});
