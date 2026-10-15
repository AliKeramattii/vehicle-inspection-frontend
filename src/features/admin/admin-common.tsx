"use client";
import { resolveVehicleGuide } from "@/config/vehicle-assets";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import { InlineAlert, StatusBadge } from "@/components/ui/status";
import { SecondaryButton } from "@/components/ui/button";
import { useAdmin } from "./admin-context";
import { stateLabels, type PublicationState } from "./model";
export const persian = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
export const adminDate = (value: string) => new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(value));
export function PublicationBadge({ state }: { state: PublicationState }) { return <StatusBadge tone={state === "published" ? "success" : state === "draft" ? "warning" : "neutral"}>{stateLabels[state]}</StatusBadge>; }
export function GuideImage({ src, title, className = "", sizes = "(max-width: 1100px) 340px, 420px" }: { src: string; title: string; className?: string; sizes?: string }) {
  const [failed, setFailed] = useState(false); const [attempt, setAttempt] = useState(0);
  if (failed) return <div className={"admin-image-error " + className} role="status"><p>تصویر مرجع بارگذاری نشد.</p><button type="button" onClick={() => { setAttempt(attempt+1); setFailed(false); }}>تلاش مجدد تصویر</button></div>;
  return <Image key={src + attempt} src={resolveVehicleGuide(src)} alt={title} width={760} height={440} sizes={sizes} onError={() => setFailed(true)} className={"admin-guide-image " + className} />;
}
export function AdminPageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="admin-page-heading"><div><p className="admin-breadcrumb">مدیریت سامانه / {title}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
export function WorkspaceState({ children }: { children: ReactNode }) {
  const { loading, error, refresh, workspace } = useAdmin();
  if (error && !workspace) return <div className="admin-recovery"><InlineAlert tone="destructive">اطلاعات مدیریت بارگذاری نشد. داده‌های محلی پاک نشده‌اند.</InlineAlert><SecondaryButton onClick={() => void refresh()}>تلاش مجدد</SecondaryButton></div>;
  if (loading) return <div className="admin-loading" role="status" aria-label="بارگذاری مدیریت"><div /><div /><div /><p>در حال بارگذاری اطلاعات مدیریت</p></div>;
  return <>{error && <InlineAlert tone="warning">بروزرسانی اطلاعات انجام نشد. فرم فعلی و تغییرات شما حفظ شده‌اند.<button type="button" className="admin-text-action" onClick={() => void refresh()}>تلاش مجدد</button></InlineAlert>}{children}</>;
}
