"use client";
import type { ReactNode } from "react";
import { normalizeDigits } from "@/lib/utils/persian";
import { useOptionalRuntimeSite } from "./site-settings.provider";

export function RuntimeSupport({ children }: { children: ReactNode }) {
  const site = useOptionalRuntimeSite();
  if (site && !site.settings.application.features.supportLink) return null;
  const identity = site?.settings.identity;
  return (
    <details id="support" className="entry-support">
      {children}
      {!identity?.publicPhone && <p>شماره تماس پشتیبانی در تنظیمات این شرکت ثبت نشده است.</p>}
      {identity && (identity.publicPhone || identity.publicEmail) && (
        <p>
          {identity.publicPhone && <a className="support-phone" href={"tel:" + normalizeDigits(identity.publicPhone).replace(/[^+0-9]/g, "")}><bdi dir="ltr">{identity.publicPhone}</bdi></a>}
          {identity.publicPhone && identity.publicEmail && <br />}
          {identity.publicEmail && <bdi dir="ltr">{identity.publicEmail}</bdi>}
        </p>
      )}
    </details>
  );
}
