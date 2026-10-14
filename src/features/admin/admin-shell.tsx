"use client";
import Link from "next/link";
import { CoBranding } from "@/components/layout/co-branding";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppViewport } from "@/components/layout/app-viewport";
import { Icon } from "@/components/ui/icon";
import { AdminProvider, AdminLink, useAdmin } from "./admin-context";
import { AdminThemeScope, AdminThemeControl } from "./admin-theme";
import "./admin-theme.css";
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
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const { actor, identity, setIdentity } = useAdmin();
  const navigation = adminNavigation.filter(item => item.href !== "/admin/site-settings" || allowed(actor.role, "branding"));
  const current = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);
  return <AppViewport className="admin-root">
    <aside className="admin-sidebar"><AdminLink href="/admin" className="admin-brand"><Icon name="platformCar" size={32} /><span><strong>سامانه بازدید خودرو</strong><small>مدیریت چندمستأجری</small></span></AdminLink>
      <nav aria-label="مدیریت سامانه">{navigation.map(item => <AdminLink key={item.href} href={item.href}
        current={current(item.href)}><AdminIcon name={item.icon} />{item.label}</AdminLink>)}</nav>
      <div className="admin-sidebar-note"><Icon name="lock" size={18} /><span>محیط مدیریت آزمایشی<small>اطلاعات محلی؛ بدون اتصال به سرور</small></span></div>
    </aside>
    <div className="admin-workspace">
      <header className="admin-topbar"><CoBranding compact/><Link href="/reviewer" className="admin-text-action">صف بررسی</Link>
        <AdminThemeControl /><div className="admin-user"><span className="admin-avatar" aria-hidden="true">ع</span><div><strong>{actor.name}</strong><small>نقش آزمایشی: {roleLabels[actor.role]}</small></div>
          <label className="admin-role-picker">هویت نمونه<select aria-label="هویت آزمایشی" value={identity} onChange={e => setIdentity(e.target.value as AdminRole)}>{roles.map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label></div>
      </header>
      <nav className="admin-mobile-nav" aria-label="مدیریت سامانه در موبایل">{navigation.map(item => <AdminLink key={item.href} href={item.href} current={current(item.href)}><AdminIcon name={item.icon} size={18} />{item.label}</AdminLink>)}</nav>
      <main id="main-content" tabIndex={-1} className="admin-main">{children}</main>
    </div>
  </AppViewport>;
}
export function AdminShell({ children }: { children: ReactNode }) { return <AdminThemeScope><AdminProvider><Shell>{children}</Shell></AdminProvider></AdminThemeScope>; }
