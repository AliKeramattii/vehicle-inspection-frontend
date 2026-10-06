"use client";

import { useEffect, type ReactNode } from "react";

export function PhotographyRouteFocus({ children, routeKey }: { children: ReactNode; routeKey: string }) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(".photography-screen .photo-scroll").forEach((region) => { region.scrollTop = 0; });
      const heading = document.querySelector<HTMLElement>(".photo-route h2");
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    });
    return () => cancelAnimationFrame(frame);
  }, [routeKey]);
  return children;
}
