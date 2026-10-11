"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NativeDialog } from "@/components/ui/native-dialog";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { actors, type AdminActor, type AdminRole, type AdminWorkspace } from "./model";
import { MockAdminRepository, type AdminRepository } from "./repository";
import { IndexedDbAdminPersistence } from "./persistence";
type AdminContextValue = {
  actor: AdminActor; identity: AdminRole; setIdentity: (role: AdminRole) => void;
  repository: AdminRepository; workspace?: AdminWorkspace; loading: boolean; error: boolean;
  refresh: () => Promise<void>; setDirty: (value: boolean) => void;
  confirmAction: (action: () => void) => void; navigate: (href: string) => void;
};
const Context = createContext<AdminContextValue | null>(null);
export function AdminProvider({ children }: { children: ReactNode }) {
  const [repository] = useState(() => new MockAdminRepository(new IndexedDbAdminPersistence()));
  const [identity, setIdentity] = useState<AdminRole>("platform-admin");
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const router = useRouter(); const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin-workspace"], queryFn: () => repository.read(actors[identity]), refetchOnWindowFocus: true });
  const actor = { ...actors[identity], role: query.data?.users.find(u => u.id === actors[identity].id)?.role ?? identity };
  useEffect(() => {
    if (!dirty) return;
    const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);
  function confirmAction(action: () => void) { if (dirty) setPending(() => action); else action(); }
  const value: AdminContextValue = {
    actor, identity, setIdentity: role => confirmAction(() => setIdentity(role)), repository, workspace: query.data,
    loading: query.isPending, error: query.isError,
    refresh: async () => { await client.invalidateQueries({ queryKey: ["admin-workspace"] }); },
    setDirty, confirmAction, navigate: href => confirmAction(() => router.push(href)),
  };
  return <Context.Provider value={value}>{children}{pending && <NativeDialog title="تغییرات ذخیره نشده" onDismiss={() => setPending(null)}>
    <p>تغییرات این پیش‌نویس هنوز ذخیره نشده‌اند. بدون ذخیره ادامه می‌دهید؟</p>
    <div className="admin-dialog-actions"><SecondaryButton onClick={() => setPending(null)}>ماندن در صفحه</SecondaryButton>
      <PrimaryButton onClick={() => { setDirty(false); pending(); setPending(null); }}>ادامه بدون ذخیره</PrimaryButton></div>
  </NativeDialog>}</Context.Provider>;
}
export function useAdmin() { const context = useContext(Context); if (!context) throw new Error("AdminProvider missing"); return context; }
export function AdminLink({ href, children, className, current }: { href: string; children: ReactNode; className?: string; current?: boolean }) {
  const { navigate } = useAdmin();
  return <Link href={href} className={className} aria-current={current ? "page" : undefined} onClick={e => {
    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigate(href); }
  }}>{children}</Link>;
}
