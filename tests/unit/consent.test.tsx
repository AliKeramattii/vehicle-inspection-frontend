import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConsentForm } from "@/features/consent/consent-form";
import { consentInputSchema, consentTermsVersion, type ConsentReceipt } from "@/features/consent/consent-model";
import { createMockInspectionRepository } from "@/mocks/inspection-repository";
import { mockInspectionId } from "@/mocks/fixtures";
import { endpoints } from "@/lib/api/endpoints";
import type { InspectionRepository } from "@/lib/api/repositories";

function fixture(repository: InspectionRepository = createMockInspectionRepository(), inspectionId: string | null = mockInspectionId) {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}><ConsentForm repository={repository} inspectionId={inspectionId} /></QueryClientProvider>);
}
const acceptance = { accepted: true, termsVersion: consentTermsVersion } as const;
describe("consent interaction", () => {
  it("starts unchecked/disabled, supports keyboard acceptance, and collapses terms with ARIA", async () => {
    const user = userEvent.setup();
    fixture();
    const checkbox = screen.getByRole("checkbox");
    const button = screen.getByRole("button", { name: "تأیید و ادامه" });
    expect(checkbox).not.toBeChecked();
    expect(button).toBeDisabled();
    const terms = screen.getByRole("button", { name: "مشاهده متن کامل شرایط" });
    const region = document.getElementById(terms.getAttribute("aria-controls")!);
    expect(terms).toHaveAttribute("aria-expanded", "false");
    expect(region).not.toBeVisible();
    await user.click(terms);
    expect(terms).toHaveAttribute("aria-expanded", "true");
    expect(region).toBeVisible();
    await user.click(terms);
    expect(region).not.toBeVisible();
    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    expect(button).toBeEnabled();
    await user.keyboard(" ");
    expect(button).toBeDisabled();
  });
  it("records consent once and ends at the Phase-02 confirmation", async () => {
    const repository = createMockInspectionRepository();
    const record = vi.spyOn(repository, "recordConsent");
    fixture(repository);
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "تأیید و ادامه" }));
    expect(await screen.findByRole("status")).toHaveTextContent("رضایت شما ثبت شد.");
    expect(record).toHaveBeenCalledExactlyOnceWith(mockInspectionId, acceptance);
    expect(screen.getByRole("link", { name: "بازگشت به آمادگی" })).toHaveAttribute("href", "/readiness");
    expect(screen.queryByRole("button", { name: "تأیید و ادامه" })).not.toBeInTheDocument();
  });
  it("blocks repeated submission while saving and displays a recoverable repository error", async () => {
    let reject!: (error: Error) => void;
    const recordConsent = vi.fn<InspectionRepository["recordConsent"]>().mockImplementationOnce(() => new Promise<ConsentReceipt>((_, fail) => { reject = fail; })).mockResolvedValue({ inspectionId: mockInspectionId, ...acceptance, acceptedAt: "2026-10-04T00:00:00Z" });
    fixture({ ...createMockInspectionRepository(), recordConsent });
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "تأیید و ادامه" }));
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /تأیید و ادامه/ })).toBeDisabled();
    await act(async () => reject(new Error("ثبت انجام نشد؛ دوباره تلاش کنید.")));
    expect(await screen.findByRole("alert")).toHaveTextContent("ثبت انجام نشد");
    await waitFor(() => expect(screen.getByRole("button", { name: "تأیید و ادامه" })).toBeEnabled());
    await userEvent.click(screen.getByRole("button", { name: "تأیید و ادامه" }));
    expect(await screen.findByRole("status")).toHaveTextContent("رضایت شما ثبت شد.");
    expect(recordConsent).toHaveBeenCalledTimes(2);
  });
  it("does not submit an unverified direct visitor", async () => {
    const repository = createMockInspectionRepository();
    const record = vi.spyOn(repository, "recordConsent");
    fixture(repository, null);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(screen.getByRole("button", { name: "تأیید و ادامه" })).toBeDisabled();
    expect(screen.getByRole("link", { name: /ابتدا شماره موبایل/ })).toHaveAttribute("href", "/");
    expect(record).not.toHaveBeenCalled();
  });
});
describe("mock consent contract", () => {
  it("validates explicit acceptance/version and encodes the planned endpoint", async () => {
    expect(consentInputSchema.safeParse({ ...acceptance, accepted: false }).success).toBe(false);
    expect(consentInputSchema.safeParse({ ...acceptance, termsVersion: "unknown" }).success).toBe(false);
    const repository = createMockInspectionRepository();
    await expect(repository.recordConsent("missing", acceptance)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(endpoints.inspections.consent("a/b?c")).toBe("/api/inspections/a%2Fb%3Fc/consent");
  });
  it("is idempotent for the same terms and never shares mutable receipts", async () => {
    const repository = createMockInspectionRepository();
    const first = await repository.recordConsent(mockInspectionId, acceptance);
    const second = await repository.recordConsent(mockInspectionId, acceptance);
    expect(second).toEqual(first);
    first.acceptedAt = "changed";
    expect(await repository.recordConsent(mockInspectionId, acceptance)).toEqual(second);
    expect((await createMockInspectionRepository().recordConsent(mockInspectionId, acceptance)).acceptedAt).not.toBe("changed");
  });
});
