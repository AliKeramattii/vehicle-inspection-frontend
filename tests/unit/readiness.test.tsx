import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeviceReadiness } from "@/features/readiness/device-readiness";
import { ReadinessRequirements, readinessRequirements } from "@/features/readiness/readiness-requirements";
import { canContinueReadiness, capabilityIds, createMockCapabilityService, initialCapabilities, normalizeCapabilities, type CapabilityResult, type CapabilityService, type CapabilityStatus } from "@/features/readiness/capabilities";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("readiness requirements", () => {
  it("renders four distinct automotive requirements with decorative supplied artwork", () => {
    render(<ReadinessRequirements />);
    const list = screen.getByRole("list", { name: "شرایط آمادگی بازدید" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    for (const requirement of readinessRequirements) expect(screen.getByRole("heading", { name: requirement.title })).toBeVisible();
    expect(list.querySelectorAll('img[alt=""]')).toHaveLength(4);
  });
});
describe("capability boundary", () => {
  it.each<CapabilityStatus>(["checking", "ready", "unavailable", "permission-required", "unsupported"])("handles %s without losing required diagnostic rows", async (status) => {
    const service = createMockCapabilityService({ camera: status });
    const results = await service.check(new AbortController().signal);
    expect(normalizeCapabilities(results)).toHaveLength(4);
    expect(canContinueReadiness(results)).toBe(status === "ready" || status === "permission-required");
  });
  it("blocks missing core results and permits the planned WebGL fallback", async () => {
    expect(canContinueReadiness(initialCapabilities())).toBe(false);
    expect(normalizeCapabilities([]).every(({ status }) => status === "unavailable")).toBe(true);
    expect(canContinueReadiness(await createMockCapabilityService({ webgl: "unsupported" }).check(new AbortController().signal))).toBe(true);
    const controller = new AbortController();
    controller.abort();
    await expect(createMockCapabilityService().check(controller.signal)).rejects.toThrow();
  });
  it("keeps all diagnostic rows while resolving and enables navigation only afterwards", async () => {
    let resolve!: (results: CapabilityResult[]) => void;
    const service: CapabilityService = { mode: "mock", check: () => new Promise((done) => { resolve = done; }) };
    const { container } = render(<DeviceReadiness service={service} />);
    const button = screen.getByRole("button", { name: "همه چیز آماده است" });
    expect(button).toBeDisabled();
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true");
    expect(container.querySelectorAll('.device-diagnostics li[data-status="checking"]')).toHaveLength(3);
    await act(async () => resolve(capabilityIds.map((id) => ({ id, status: "ready" }))));
    await waitFor(() => expect(button).toBeEnabled());
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "false");
    expect(container.querySelectorAll('.device-diagnostics li[data-status="ready"]')).toHaveLength(3);
    await userEvent.click(button);
    expect(push).toHaveBeenCalledWith("/consent");
  });
  it("communicates permission/unsupported states with words and offers retry after failure", async () => {
    const service = createMockCapabilityService({ camera: "unavailable", location: "permission-required", webgl: "unsupported" });
    render(<DeviceReadiness service={service} />);
    expect(await screen.findByText("در دسترس نیست")).toBeVisible();
    expect(screen.getByText("نیاز به اجازه")).toBeVisible();
    expect(screen.queryByText("نمایش سه‌بعدی")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "همه چیز آماده است" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "بررسی دوباره" })).toBeEnabled();
  });
  it("recovers from a rejected check through the same adapter", async () => {
    const check = vi.fn<CapabilityService["check"]>().mockRejectedValueOnce(new Error("device failed")).mockResolvedValue(capabilityIds.map((id) => ({ id, status: "ready" })));
    render(<DeviceReadiness service={{ mode: "mock", check }} />);
    await userEvent.click(await screen.findByRole("button", { name: "بررسی دوباره" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled());
    expect(check).toHaveBeenCalledTimes(2);
  });
  it("does not expose or wait for optional WebGL in the production 2D journey", async () => {
    render(<DeviceReadiness service={createMockCapabilityService({ webgl: "checking" })} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "همه چیز آماده است" })).toBeEnabled());
    expect(screen.queryByText("نمایش سه‌بعدی")).not.toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "false");
  });
});
