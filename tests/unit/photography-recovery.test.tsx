import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PhotographyWorkflow } from "@/features/photography/photography-workflow";

const mock = vi.hoisted(() => ({ inspection: vi.fn(), plan: vi.fn() }));
vi.mock("@/features/inspection/use-inspection-access", () => ({ useInspectionAccess: () => ({ authorized: true, repository: { getInspection: mock.inspection, getCapturePlan: mock.plan } }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
beforeEach(() => { mock.inspection.mockReset().mockResolvedValue({ location: {}, vehicle: {} }); mock.plan.mockReset().mockResolvedValue({ sections: [] }); });

describe("invalid photography template recovery", () => {
  it("offers retry and existing safe vehicle return without an empty dead end", async () => {
    const query = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    render(<QueryClientProvider client={query}><PhotographyWorkflow inspectionId="insp_demo" view={{ kind: "overview" }} /></QueryClientProvider>);
    expect(await screen.findByText("قالب عکاسی در دسترس نیست.")).toBeVisible();
    expect(screen.getByRole("link", { name: "بازگشت به مشخصات خودرو" })).toHaveAttribute("href", "/inspection/insp_demo/vehicle");
    await userEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    await waitFor(() => expect(mock.plan).toHaveBeenCalledTimes(2));
    query.clear();
  });
});
