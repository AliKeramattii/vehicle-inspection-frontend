"use client";
import { customPrimaryHover, defaultThemeColors, hasDefaultPrimary, readableBrandInk } from "@/config/theme-colors";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useOptionalRuntimeSite } from "@/config/site-settings.provider";
export type AdminThemePreference = "light" | "dark" | "system";
const key = "inspection-admin-theme";
let transientPreference: AdminThemePreference | undefined;
let fallback: AdminThemePreference = "system";
export function readAdminTheme(): AdminThemePreference {
  if (transientPreference) return transientPreference;
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
  try { localStorage.setItem(key, value); transientPreference = undefined; } catch { persisted = false; transientPreference = value; }
  apply(); window.dispatchEvent(new Event("admin-theme-change")); return persisted;
}
/** Keep configured primary hue, lightening only operations text accents to achieve AA. */
export function readableAdminAccent(primary: string, dark: boolean) { return readableBrandInk(primary,dark); }

const Theme = createContext<{ preference: AdminThemePreference; dark: boolean }>({ preference: "system", dark: false });
export function AdminThemeScope({ children }: { children: ReactNode }) {
  const value = useSyncExternalStore(subscribe, snapshot, () => "system:light"), site = useOptionalRuntimeSite();
  const [preference, mode] = value.split(":");
  useEffect(apply, [value]);
  return <Theme.Provider value={{ preference: preference as AdminThemePreference, dark: mode === "dark" }}>
    <div className="admin-theme-scope" style={{
      "--admin-accent": hasDefaultPrimary(site?.settings.theme.primary ?? defaultThemeColors.primary) ? "var(--color-primary)" : readableAdminAccent(site?.settings.theme.primary ?? defaultThemeColors.primary, mode === "dark"),
      "--color-primary": hasDefaultPrimary(site?.settings.theme.primary ?? defaultThemeColors.primary) ? mode === "dark" ? "var(--color-emerald-400)" : "var(--color-emerald-700)" : site?.settings.theme.primary,
      "--color-primary-hover": hasDefaultPrimary(site?.settings.theme.primary ?? defaultThemeColors.primary) ? mode === "dark" ? "var(--color-emerald-300)" : "var(--color-emerald-800)" : customPrimaryHover(site?.settings.theme ?? defaultThemeColors),
      "--color-on-primary": mode === "dark" && hasDefaultPrimary(site?.settings.theme.primary ?? defaultThemeColors.primary) ? "var(--color-slate-900)" : site?.settings.theme.onPrimary ?? "#ffffff",
    } as React.CSSProperties}>{children}</div>
  </Theme.Provider>;
}
export function AdminThemeControl() {
  const { preference, dark } = useContext(Theme), [error, setError] = useState(false);
  const change = (value: AdminThemePreference) => setError(!setAdminTheme(value));
  return <div className="admin-theme-control">
    <div className="admin-theme-actions">
      <button type="button" role="switch" aria-label="پوسته تیره" aria-checked={dark} aria-describedby="admin-theme-mode" className="theme-toggle" data-dark={dark} onClick={() => change(dark ? "light" : "dark")}>
        <span className="theme-toggle-track" aria-hidden="true"><Sun size={18} className="theme-sun"/><Moon size={18} className="theme-moon"/><span className="theme-toggle-thumb"/></span>
      </button>
      <button type="button" className="theme-system" aria-label="استفاده از پوسته دستگاه" aria-pressed={preference === "system"} onClick={() => change("system")}><Monitor size={16} aria-hidden="true"/><span id="admin-theme-mode">{preference === "system" ? "مطابق دستگاه" : dark ? "تیره" : "روشن"}</span></button>
    </div>
    {error && <small role="status">ذخیره پوسته ممکن نشد؛ انتخاب فقط در این صفحه اعمال می‌شود.</small>}
  </div>;
}
