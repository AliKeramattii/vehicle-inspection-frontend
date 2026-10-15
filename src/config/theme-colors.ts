import { contrast } from "./site-settings.schema";
import type { SiteSettings } from "./site-settings.schema";
/** Browser sRGB serialization of the approved LAB primitives for existing HEX-only
 * settings forms/API. Default rendering resolves to the original LAB CSS variables. */
export const defaultThemeColors = {
 primary: "#007a55", secondary: "#45556c", background: "#f8fafc", neutral: "#e2e8f0", onPrimary: "#ffffff", onBackground: "#0f172b",
} as const;
export const operationsSurfaces = {light: ["#ffffff", "#f8fafc", "#f1f5f9", "#f0f9ff"], dark: ["#0f172b", "#1d293d", "#314158"]} as const;
/** Text accents may need a stronger/lighter tint than the configured button fill. */
export function readableBrandInk(primary:string,dark:boolean){
 const surfaces=dark?operationsSurfaces.dark:operationsSurfaces.light;
 if(surfaces.every(surface=>contrast(primary,surface)>=4.5))return primary;
 const rgb=[1,3,5].map(start=>parseInt(primary.slice(start,start+2),16)),target=dark?255:0;
 for(let step=1;step<=20;step++){
  const color="#"+rgb.map(value=>Math.round(value+(target-value)*step/20).toString(16).padStart(2,"0")).join("");
  if(surfaces.every(surface=>contrast(color,surface)>=4.5))return color;
 }return dark?"#ffffff":defaultThemeColors.onBackground;
}
const defaultCss = {primary:"var(--color-emerald-700)",secondary:"var(--color-slate-600)",background:"var(--color-slate-50)",neutral:"var(--color-slate-200)",onPrimary:"#ffffff",onBackground:"var(--color-slate-900)"} as const;
export const hasDefaultPrimary = (primary: string) => primary.toLowerCase() === defaultThemeColors.primary;
export function customPrimaryHover(theme: SiteSettings["theme"]) {
 const target = contrast(theme.onPrimary, "#ffffff") > contrast(theme.onPrimary, defaultThemeColors.onBackground) ? "#ffffff" : "var(--color-slate-900)";
 return "color-mix(in srgb, var(--color-primary) 88%, " + target + ")";
}
export function runtimeThemeVariables(theme: SiteSettings["theme"]): Record<string,string> {
 const value=(key:keyof typeof defaultThemeColors)=>theme[key].toLowerCase()===defaultThemeColors[key]?defaultCss[key]:theme[key];
 return {"--brand-primary":value("primary"),"--brand-secondary":value("secondary"),"--brand-background":value("background"),"--brand-neutral":value("neutral"),"--brand-on-primary":value("onPrimary"),"--brand-on-background":value("onBackground"),
 "--color-primary":value("primary"),"--color-primary-ink":hasDefaultPrimary(theme.primary)?"var(--color-emerald-700)":readableBrandInk(theme.primary,false),"--color-primary-hover":hasDefaultPrimary(theme.primary)?"var(--color-emerald-800)":customPrimaryHover(theme),
 "--color-primary-soft":hasDefaultPrimary(theme.primary)?"var(--color-emerald-50)":"color-mix(in srgb, var(--brand-primary) 8%, var(--color-surface))",
 "--color-on-primary":value("onPrimary"),"--color-background":value("background"),"--color-border":value("neutral"),"--color-ink":value("onBackground"),"--color-muted":value("secondary")};
}
/** Recognize only the previous untouched factory theme; never a custom publication. */
export const legacyFactoryTheme = {primary:"#2563eb",secondary:"#64748b",background:"#f8fafc",neutral:"#e2e8f0",onPrimary:"#ffffff",onBackground:"#111827"} as const;
export function isLegacyFactoryTheme(theme:SiteSettings["theme"]){return Object.entries(legacyFactoryTheme).every(([key,value])=>theme[key as keyof typeof legacyFactoryTheme].toLowerCase()===value);}
