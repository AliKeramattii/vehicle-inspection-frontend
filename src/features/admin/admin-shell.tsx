"use client";
import Link from "next/link";
import { CoBranding } from "@/components/layout/co-branding";
import { usePathname } from "next/navigation";
import type { ReactNode, CSSProperties } from "react";
import { AppViewport } from "@/components/layout/app-viewport";
import { Icon } from "@/components/ui/icon";
import { AdminProvider, AdminLink, useAdmin } from "./admin-context";
import { roles, roleLabels, type AdminRole } from "./model";
export const adminNavigation = [
  { href: "/admin", label: "داشبورد", icon: "analytics" },
  { href: "/admin/branding", label: "برندینگ", icon: "branding" },
  { href: "/admin/policies", label: "سیاست‌ها", icon: "policies" },
  { href: "/admin/templates", label: "قالب بازدید", icon: "inspection-template" },
  { href: "/admin/webhooks", label: "وب‌هوک‌ها", icon: "webhook" },
  { href: "/admin/assignments", label: "تنظیمات ارجاع", icon: "roles" },
  { href: "/admin/users", label: "کاربران", icon: "roles" },
  { href: "/admin/permissions", label: "دسترسی‌ها", icon: "permissions" },
] as const;
export function AdminIcon({ name, size = 20 }: { name: typeof adminNavigation[number]["icon"]; size?: number }) {
  const style: CSSProperties = { width: size, height: size, maskImage: 'url("/icons/admin/' + name + '.svg")', maskSize: "contain", maskPosition: "center", maskRepeat: "no-repeat" };
  return <span aria-hidden="true" className="admin-icon" style={style} />;
}
function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const { actor, identity, setIdentity } = useAdmin();
  return <AppViewport className="admin-root">
    <aside className="admin-sidebar"><AdminLink href="/admin" className="admin-brand"><Icon name="platformCar" size={32} /><span><strong>سامانه بازدید خودرو</strong><small>مدیریت چندمستأجری</small></span></AdminLink>
      <nav aria-label="مدیریت سامانه">{adminNavigation.map(item => <AdminLink key={item.href} href={item.href}
        current={item.href === "/admin" ? pathname === item.href : (pathname.startsWith(item.href) || (item.href === "/admin/branding" && pathname === "/admin/site-settings"))}><AdminIcon name={item.icon} />{item.label}</AdminLink>)}</nav>
      <div className="admin-sidebar-note"><Icon name="lock" size={18} /><span>محیط مدیریت آزمایشی<small>اطلاعات محلی؛ بدون اتصال به سرور</small></span></div>
    </aside>
    <div className="admin-workspace">
      <header className="admin-topbar"><CoBranding compact/><Link href="/reviewer" className="admin-text-action">صف بررسی</Link>
        <div className="admin-user"><span className="admin-avatar" aria-hidden="true">ع</span><div><strong>{actor.name}</strong><small>نقش آزمایشی: {roleLabels[actor.role]}</small></div>
          <label className="admin-role-picker">هویت نمونه<select aria-label="هویت آزمایشی" value={identity} onChange={e => setIdentity(e.target.value as AdminRole)}>{roles.filter(role=>role!=="reviewer").map(role => <option key={role} value={role}>{roleLabels[role]}</option>)}</select></label></div>
      </header>
      <main id="main-content" tabIndex={-1} className="admin-main">{children}</main>
    </div>
  </AppViewport>;
}
export function AdminShell({ children }: { children: ReactNode }) { return <AdminProvider><Shell>{children}</Shell></AdminProvider>; }
