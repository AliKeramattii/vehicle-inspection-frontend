"use client";

import { useEffect } from "react";

/** Visual keyboards can resize only the visual viewport. Never constrain pinch zoom. */
export function ViewportResize() {
  useEffect(() => {
    // A needless scroll layer changes Chromium text rasterization even when everything fits.
    // Enable the deliberate main scroll region only when its content needs it.
    if (typeof ResizeObserver === "undefined") return;
    const observed = new Set<Element>();
    const update = () => {
      const main = document.querySelector<HTMLElement>(".customer-viewport > main:not(.photography-screen)");
      const nodes = new Set<Element>(main ? [main, ...main.children] : []);
      observed.forEach((node) => { if (!nodes.has(node)) { resize.unobserve(node); observed.delete(node); } });
      nodes.forEach((node) => { if (!observed.has(node)) { resize.observe(node); observed.add(node); } });
      if (main) main.dataset.overflow = String(main.scrollHeight > main.clientHeight + 1);
    };
    const resize = new ResizeObserver(update);
    const mutations = new MutationObserver(update);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "aria-expanded"] });
    update();
    return () => { resize.disconnect(); mutations.disconnect(); document.querySelectorAll(".customer-viewport > main[data-overflow]").forEach((node) => node.removeAttribute("data-overflow")); };
  }, []);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const root = document.documentElement;
        if (viewport.scale === 1 && viewport.height < window.innerHeight - 1) {
          root.style.setProperty("--app-viewport-height", `${viewport.height}px`);
          const focused = document.activeElement;
          if (focused instanceof HTMLElement && focused.matches("input, textarea, select")) focused.scrollIntoView({ block: "nearest" });
        } else root.style.removeProperty("--app-viewport-height");
      });
    };
    viewport.addEventListener("resize", update);
    update();
    return () => { cancelAnimationFrame(frame); viewport.removeEventListener("resize", update); document.documentElement.style.removeProperty("--app-viewport-height"); };
  }, []);
  return null;
}
