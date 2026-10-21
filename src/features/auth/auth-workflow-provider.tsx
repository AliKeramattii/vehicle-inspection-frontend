"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useStore } from "zustand";
import type { AuthRepository, InspectionRepository } from "@/lib/api/repositories";
import { createRepositories } from "@/lib/api/client";
import { createAuthWorkflowStore, type AuthWorkflowStore } from "@/stores/auth-workflow";

import { usePathname } from "next/navigation";
import { useRuntimeSite } from "@/config/site-settings.provider";
import { createMockCustomerSource, readMockVerifiedSession, type CustomerSourceAdapter } from "@/features/identity/source-context";
import { lifecycleRepository } from "@/features/inspection-status/lifecycle-repository";

type Context = { repository: AuthRepository; inspection: InspectionRepository; store: AuthWorkflowStore; source: CustomerSourceAdapter; restoring: boolean };
const AuthContext = createContext<Context | null>(null);
export function AuthWorkflowProvider({ children }: { children: ReactNode }) {
  const site = useRuntimeSite();
  return <ScopedAuthWorkflow key={site.contextKey} tenantId={site.bootstrap.tenantId}>{children}</ScopedAuthWorkflow>;
}
function ScopedAuthWorkflow({children, tenantId}: {children: ReactNode; tenantId: string}) {
  const pathname = usePathname();
  const [restoring, setRestoring] = useState(true);
  const [context] = useState<Omit<Context, "restoring">>(() => {
    const repositories = createRepositories({ mockAuthResendAfterSeconds: 120, tenantId });
    return { repository: repositories.auth, inspection: repositories.inspection, store: createAuthWorkflowStore(), source: createMockCustomerSource(tenantId) };
  });
  useEffect(() => { let active = true;
    void context.source.resolve().then(async scope => {
      const session = readMockVerifiedSession(scope); if (!session) return;
      const record = await lifecycleRepository.read(scope, session.inspectionId);
      if (active && record) context.store.getState().setWorkflow({stage: "verified", mobile: scope.mobile, inspectionId: record.inspectionId});
    }).catch(() => undefined).finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, [context]);
  useEffect(() => { const current = context.store.getState().workflow; if (current.stage === "verified") void context.source.resolve().then(scope => lifecycleRepository.progress(scope, current.inspectionId, pathname)).catch(() => undefined); }, [context, pathname]);
  return <AuthContext.Provider value={{...context, restoring}}>{children}</AuthContext.Provider>;
}
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Auth workflow requires its customer provider.");
  return context;
}
export function useAuthWorkflow() {
  return useStore(useAuthContext().store, (state) => state.workflow);
}
