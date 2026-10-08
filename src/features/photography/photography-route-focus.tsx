"use client";

import { useEffect, type ReactNode } from "react";

export function PhotographyRouteFocus({ children, routeKey }: { children: ReactNode; routeKey: string }) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      // A user can focus a field before this deferred entry frame. Preserve that intent.
      if (active instanceof HTMLElement && active.matches("input, textarea, select, button") && active.closest(".photo-route")) { active.scrollIntoView({ block: "nearest" }); return; }
      document.querySelectorAll<HTMLElement>(".photography-screen .photo-scroll").forEach((region) => { region.scrollTop = 0; });
      const heading = document.querySelector<HTMLElement>(".photo-route h2");
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    });
    return () => cancelAnimationFrame(frame);
  }, [routeKey]);
  return children;
}
