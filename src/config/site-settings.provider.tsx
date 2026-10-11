"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppViewport } from "@/components/layout/app-viewport";
import { PrimaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { loadBootstrap, loadSettings } from "./site-settings.loader";
import { SiteConfigurationError, configurationKey, type SiteBootstrap, type SiteSettings } from "./site-settings.schema";
import "./site-settings.css";
type RuntimeSite = { bootstrap:SiteBootstrap; settings:SiteSettings; origin:string; contextKey:string; refresh:()=>Promise<void> };
const Context=createContext<RuntimeSite|null>(null);
export function useRuntimeSite() { const context=useContext(Context);if(!context)throw new Error("Runtime Site Settings unavailable");return context; }
export function useOptionalRuntimeSite() { return useContext(Context); }
function AppliedSite({site,children}:{site:RuntimeSite;children:ReactNode}) {
  const pathname=usePathname();
  useEffect(()=> {
    const root=document.documentElement,theme=site.settings.theme;
    const names:Record<string,string>={"--brand-primary":theme.primary,"--brand-secondary":theme.secondary,"--brand-background":theme.background,"--brand-neutral":theme.neutral,"--brand-on-primary":theme.onPrimary,"--brand-on-background":theme.onBackground,
      "--color-primary":theme.primary,"--color-background":theme.background,"--color-border":theme.neutral,"--color-ink":theme.onBackground};
    const previous=Object.keys(names).map(name=>[name,root.style.getPropertyValue(name)]);
    for(const [name,value] of Object.entries(names))root.style.setProperty(name,value);
    const custom=site.settings.tenantId!=="demo"||site.settings.version>1;
    if(custom)root.dataset.runtimeBrand="custom";
    let favicon:HTMLLinkElement|null=null; let previousIcon:string|null=null;
    const previousTitle=document.title;
    // App Router metadata can arrive after navigation effects. Keep runtime identity consistent.
    const applyMetadata=()=>{
      if(custom&&document.title!==site.settings.identity.appTitle)document.title=site.settings.identity.appTitle;
      const icon=document.querySelector<HTMLLinkElement>('link[rel="icon"]'),asset=site.settings.identity.favicon;
      if(icon&&asset&&icon.href!==new URL(asset,site.origin).href)icon.href=asset;
    };
    if(site.settings.identity.favicon) {favicon=document.querySelector('link[rel="icon"]');if(favicon)previousIcon=favicon.href;}
    applyMetadata();
    const observer=custom?new MutationObserver(applyMetadata):null;
    observer?.observe(document.head,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["href"]});
    return ()=> {observer?.disconnect();if(custom&&document.title===site.settings.identity.appTitle)document.title=previousTitle;for(const [name,value]of previous){if(value)root.style.setProperty(name,value);else root.style.removeProperty(name);}delete root.dataset.runtimeBrand;if(favicon&&previousIcon)favicon.href=previousIcon;};
  },[site.settings,site.origin,pathname]);
  return <Context.Provider value={site}>{children}</Context.Provider>;
}
export function SiteSettingsProvider({children}:{children:ReactNode}) {
  const pendingFocus=useRef(false);
  const client=useQueryClient(),origin=typeof window==="undefined"?"":window.location.origin;
  const bootstrap=useQuery({queryKey:["site-bootstrap",origin],queryFn:({signal})=>loadBootstrap(origin,signal),enabled:Boolean(origin),staleTime:0,refetchOnWindowFocus:false,retry:false});
  const contextKey=bootstrap.data?configurationKey(bootstrap.data,origin):"";
  const settings=useQuery({queryKey:["site-settings",contextKey],queryFn:({signal})=>loadSettings(bootstrap.data!,origin,signal),enabled:Boolean(contextKey),staleTime:0,refetchOnWindowFocus:true,retry:false});
  useLayoutEffect(()=>{if(bootstrap.data&&settings.data&&pendingFocus.current){document.getElementById("main-content")?.focus();pendingFocus.current=false;}},[bootstrap.data,settings.data]);
  if(bootstrap.error||settings.error) return <AppViewport><main id="main-content" tabIndex={-1} onFocus={()=>{pendingFocus.current=true;}} onBlur={()=>{pendingFocus.current=false;}} className="site-config-state"><h1>تنظیمات سایت بارگذاری نشد</h1><InlineAlert tone="destructive">{settings.error instanceof SiteConfigurationError?settings.error.message:"پیکربندی نصب معتبر یا در دسترس نیست."}</InlineAlert><PrimaryButton onClick={()=>{void bootstrap.refetch();if(contextKey)void settings.refetch();}}>تلاش مجدد</PrimaryButton><p>فایل‌های محلی حذف نشده‌اند.</p></main></AppViewport>;
  if(!bootstrap.data||!settings.data)return <AppViewport><main id="main-content" tabIndex={-1} onFocus={()=>{pendingFocus.current=true;}} onBlur={()=>{pendingFocus.current=false;}} className="site-config-state" aria-busy="true"><h1>در حال آماده‌سازی سایت</h1><div className="site-config-placeholder" aria-hidden="true"/><p role="status">بارگذاری تنظیمات نصب</p></main></AppViewport>;
  return <AppliedSite site={{bootstrap:bootstrap.data,settings:settings.data,origin,contextKey,refresh:async()=>{await client.invalidateQueries({queryKey:["site-settings",contextKey]});}}}>{children}</AppliedSite>;
}
