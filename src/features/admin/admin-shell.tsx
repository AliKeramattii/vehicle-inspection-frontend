"use client";
import Link from "next/link";
import { CoBranding } from "@/components/layout/co-branding";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AppViewport } from "@/components/layout/app-viewport";
import { ApplicationLogo } from "@/components/layout/application-logo";
import { NativeDialog } from "@/components/ui/native-dialog";
import "./premium-operations.css";
import { Menu, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { AdminProvider, AdminLink, useAdmin } from "./admin-context";
import { AdminThemeScope, AdminThemeControl } from "./admin-theme";
import "./admin-theme.css";
import "./admin-brand.css";
import { LayoutDashboard, Palette, FileCheck, ListChecks, Webhook, Users, ShieldCheck, Settings } from "lucide-react";
import { allowed, roles, roleLabels, type AdminRole } from "./model";
export const adminNavigation = [
  { href: "/admin", label: "داشبورد", icon: "analytics" },
  { href: "/admin/site-settings", label: "تنظیمات سایت", icon: "site-settings" },
  { href: "/admin/branding", label: "برندینگ", icon: "branding" },
  { href: "/admin/policies", label: "سیاست‌ها", icon: "policies" },
  { href: "/admin/templates", label: "قالب بازدید", icon: "inspection-template" },
  { href: "/admin/webhooks", label: "وب‌هوک‌ها", icon: "webhook" },
  { href: "/admin/assignments", label: "تنظیمات ارجاع", icon: "roles" },
  { href: "/admin/users", label: "کاربران", icon: "roles" },
  { href: "/admin/permissions", label: "دسترسی‌ها", icon: "permissions" },
] as const;
export function AdminIcon({ name, size = 20 }: { name: typeof adminNavigation[number]["icon"]; size?: number }) {
  const icons = { analytics: LayoutDashboard, branding: Palette, policies: FileCheck, "inspection-template": ListChecks, webhook: Webhook, roles: Users, permissions: ShieldCheck, "site-settings": Settings };
  const Glyph = name === "roles" ? Users : icons[name];
  return <Glyph aria-hidden="true" className="admin-icon" size={size} strokeWidth={1.8} />;
}
const navigationGroups = [
  { title: "مدیریت بازدید", paths: ["/admin", "/admin/assignments", "/admin/templates"] },
  { title: "پیکربندی سامانه", paths: ["/admin/site-settings", "/admin/branding", "/admin/policies", "/admin/webhooks"] },
  { title: "کاربران و دسترسی", paths: ["/admin/users", "/admin/permissions"] },
];
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname(), { actor, identity, setIdentity } = useAdmin();
  const [collapsed, setCollapsed] = useState(false), [drawer, setDrawer] = useState(false);
  const navigation = adminNavigation.filter(item => item.href !== "/admin/site-settings" || allowed(actor.role, "branding"));
  const current = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);
  const page = navigation.find(item => current(item.href));
  const links = <nav aria-label="مدیریت سامانه">{navigationGroups.map(group => <section key={group.title} className="admin-nav-group"><h2>{group.title}</h2>{group.paths.map(path => navigation.find(item => item.href === path)).filter(item => !!item).map(item => <AdminLink key={item.href} href={item.href} title={item.label} current={current(item.href)}><AdminIcon name={item.icon}/><span>{item.label}</span></AdminLink>)}</section>)}</nav>;
  return <AppViewport className="admin-root" data-collapsed={collapsed}>
    <aside className="admin-sidebar"><AdminLink href="/admin" className="admin-brand" title="سامانه بازدید خودرو"><ApplicationLogo width={40} decorative/><span><strong>سامانه بازدید خودرو</strong><small>مدیریت عملیات بازدید</small></span></AdminLink>
      {links}<div className="admin-sidebar-note"><Icon name="lock" size={18}/><span>محیط مدیریت آزمایشی<small>اطلاعات محلی؛ بدون اتصال به سرور</small></span></div>
    </aside>
    <div className="admin-workspace">
      <header className="admin-topbar">
        <button type="button" className="admin-nav-toggle admin-desktop-toggle" aria-label={collapsed ? "گسترش منوی مدیریت" : "جمع کردن منوی مدیریت"} aria-expanded={!collapsed} onClick={() => setCollapsed(value => !value)}>{collapsed ? <PanelRightOpen size={20}/> : <PanelRightClose size={20}/>}</button>
        <button type="button" className="admin-nav-toggle admin-drawer-toggle" aria-label="باز کردن منوی مدیریت" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu size={22}/></button>
        <div className="admin-current-page"><small>مدیریت سامانه</small><strong>{page?.label ?? "قالب بازدید"}</strong></div>
        <CoBranding compact/><Link href="/reviewer" className="admin-text-action">صف بررسی</Link><AdminThemeControl/>
        <div className="admin-user"><span className="admin-avatar" aria-hidden="true">ع</span><div><strong>{actor.name}</strong><small>{roleLabels[actor.role]}</small></div>
          <label className="admin-role-picker">هویت نمونه<select aria-label="هویت آزمایشی" value={identity} onChange={e => setIdentity(e.target.value as AdminRole)}>{roles.map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label></div>
      </header>
      <main id="main-content" tabIndex={-1} className="admin-main">{children}</main>
    </div>
    {drawer && <NativeDialog title="منوی مدیریت" className="admin-navigation-dialog" onDismiss={() => setDrawer(false)}><div onClick={event => { if ((event.target as HTMLElement).closest("a")) setDrawer(false); }}>{links}</div></NativeDialog>}
  </AppViewport>;
}
export function AdminShell({ children }: { children: ReactNode }) { return <AdminThemeScope><AdminProvider><Shell>{children}</Shell></AdminProvider></AdminThemeScope>; }
