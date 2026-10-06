import { afterEach, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ViewportResize } from "@/components/layout/viewport-resize";
const original = window.visualViewport;
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); Object.defineProperty(window, "visualViewport", { configurable: true, value: original }); document.documentElement.style.removeProperty("--app-viewport-height"); });
it("bounds the shell to a keyboard visual viewport and releases it on resize/unmount", () => {
  const viewport = Object.assign(new EventTarget(), { height: 500, scale: 1 });
  Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport }); vi.stubGlobal("innerHeight", 844);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { callback(0); return 1; });
  const { unmount } = render(<ViewportResize />);
  expect(document.documentElement.style.getPropertyValue("--app-viewport-height")).toBe("500px");
  viewport.height = 844; viewport.dispatchEvent(new Event("resize")); expect(document.documentElement.style.getPropertyValue("--app-viewport-height")).toBe("");
  viewport.height = 450; viewport.dispatchEvent(new Event("resize")); unmount(); expect(document.documentElement.style.getPropertyValue("--app-viewport-height")).toBe("");
});
it("does not constrain a pinched/zoomed viewport", () => {
  const viewport = Object.assign(new EventTarget(), { height: 350, scale: 2 });
  Object.defineProperty(window, "visualViewport", { configurable: true, value: viewport }); vi.stubGlobal("innerHeight", 844);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => { callback(0); return 1; });
  render(<ViewportResize />); expect(document.documentElement.style.getPropertyValue("--app-viewport-height")).toBe("");
});
