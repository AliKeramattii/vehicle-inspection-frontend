"use client";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { contrast } from "@/config/site-settings.schema";
import { useOptionalRuntimeSite } from "@/config/site-settings.provider";
export type AdminThemePreference = "light" | "dark" | "system";
const key = "inspection-admin-theme";
let fallback: AdminThemePreference = "system";
export function readAdminTheme(): AdminThemePreference {
  try { const value = localStorage.getItem(key); return value === "dark" || value === "light" ? value : "system"; }
  catch { return fallback; }
}
function snapshot() { const value = readAdminTheme(); return value + ":" + (value === "dark" || value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); }
function apply() { document.documentElement.dataset.adminTheme = snapshot().split(":")[1]; }
function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const changed = () => { apply(); callback(); };
  window.addEventListener("storage", changed); window.addEventListener("admin-theme-change", changed); media.addEventListener("change", changed);
  return () => { window.removeEventListener("storage", changed); window.removeEventListener("admin-theme-change", changed); media.removeEventListener("change", changed); };
}
export function setAdminTheme(value: AdminThemePreference) {
  fallback = value; let persisted = true;
  try { localStorage.setItem(key, value); } catch { persisted = false; }
  apply(); window.dispatchEvent(new Event("admin-theme-change")); return persisted;
}
/** Keep configured primary hue, lightening only operations text accents to achieve AA. */
export function readableAdminAccent(primary: string, dark: boolean) {
  const surface = dark ? "#172234" : "#FFFFFF";
  if (contrast(primary, surface) >= 4.5) return primary;
  const rgb = [1, 3, 5].map(start => parseInt(primary.slice(start, start + 2), 16)), target = dark ? 255 : 0;
  for (let step = 1; step <= 20; step++) {
    const color = "#" + rgb.map(value => Math.round(value + (target - value) * step / 20).toString(16).padStart(2, "0")).join("");
    if (contrast(color, surface) >= 4.5) return color;
  }
  return dark ? "#FFFFFF" : "#111827";
}
const Theme = createContext<{ preference: AdminThemePreference; dark: boolean }>({ preference: "system", dark: false });
export function AdminThemeScope({ children }: { children: ReactNode }) {
  const value = useSyncExternalStore(subscribe, snapshot, () => "system:light"), site = useOptionalRuntimeSite();
  const [preference, mode] = value.split(":");
  useEffect(apply, [value]);
  return <Theme.Provider value={{ preference: preference as AdminThemePreference, dark: mode === "dark" }}>
    <div className="admin-theme-scope" style={{ "--admin-accent": readableAdminAccent(site?.settings.theme.primary ?? "#2563EB", mode === "dark") } as React.CSSProperties}>{children}</div>
  </Theme.Provider>;
}
export function AdminThemeControl() {
  const { preference, dark } = useContext(Theme), [error, setError] = useState(false);
  const Glyph = preference === "system" ? Monitor : dark ? Moon : Sun;
  return <div className="admin-theme-control"><label><Glyph size={19} aria-hidden="true" /><span>پوسته مدیریت</span>
    <select aria-label="پوسته مدیریت" value={preference} onChange={e => setError(!setAdminTheme(e.target.value as AdminThemePreference))}>
      <option value="light">روشن</option><option value="dark">تیره</option><option value="system">مطابق دستگاه</option>
    </select></label>{error && <small role="status">ذخیره پوسته ممکن نشد؛ انتخاب فقط در این صفحه اعمال می‌شود.</small>}</div>;
}
