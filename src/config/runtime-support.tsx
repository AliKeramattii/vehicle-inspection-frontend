"use client";
import type { ReactNode } from "react";
import { useOptionalRuntimeSite } from "./site-settings.provider";

export function RuntimeSupport({ children }: { children: ReactNode }) {
  const site = useOptionalRuntimeSite();
  if (site && !site.settings.application.features.supportLink) return null;
  const identity = site?.settings.identity;
  return (
    <details id="support" className="entry-support">
      {children}
      {identity && (identity.publicPhone || identity.publicEmail) && (
        <p>
          {identity.publicPhone && <bdi dir="ltr">{identity.publicPhone}</bdi>}
          {identity.publicPhone && identity.publicEmail && <br />}
          {identity.publicEmail && <bdi dir="ltr">{identity.publicEmail}</bdi>}
        </p>
      )}
    </details>
  );
}
