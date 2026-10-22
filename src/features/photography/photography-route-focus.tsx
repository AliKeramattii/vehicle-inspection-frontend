"use client";

import { useEffect, type ReactNode } from "react";

export function PhotographyRouteFocus({ children, routeKey }: { children: ReactNode; routeKey: string }) {
  useEffect(() => {
    let observer: MutationObserver | undefined;
    const focusHeading = () => {
      const active = document.activeElement;
      // A user can focus a field before this deferred entry frame. Preserve that intent.
      if (active instanceof HTMLElement && active.matches("input, textarea, select, button") && active.closest(".photo-route")) { observer?.disconnect(); active.scrollIntoView({ block: "nearest" }); return; }
      const heading = document.querySelector<HTMLElement>(".photo-route h2");
      if (!heading) return;
      observer?.disconnect();
      document.querySelectorAll<HTMLElement>(".photography-screen .photo-scroll").forEach((region) => { region.scrollTop = 0; });
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    };
    const frame = requestAnimationFrame(() => {
      // Dynamic view chunks may still show a skeleton on the entry frame.
      const route = document.querySelector(".photo-route") ?? document.querySelector(".photography-screen");
      if (route && !route.querySelector("h2")) {
        observer = new MutationObserver(focusHeading);
        observer.observe(route, { childList: true, subtree: true });
      }
      focusHeading();
    });
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [routeKey]);
  return children;
}
