"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import type { AuthRepository, InspectionRepository } from "@/lib/api/repositories";
import { createRepositories } from "@/lib/api/client";
import { createAuthWorkflowStore, type AuthWorkflowStore } from "@/stores/auth-workflow";

type Context = { repository: AuthRepository; inspection: InspectionRepository; store: AuthWorkflowStore };
const AuthContext = createContext<Context | null>(null);
export function AuthWorkflowProvider({ children }: { children: ReactNode }) {
  const [context] = useState<Context>(() => {
    const repositories = createRepositories({ mockAuthResendAfterSeconds: 120 });
    return { repository: repositories.auth, inspection: repositories.inspection, store: createAuthWorkflowStore() };
  });
  return <AuthContext.Provider value={context}>{children}</AuthContext.Provider>;
}
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Auth workflow requires its customer provider.");
  return context;
}
export function useAuthWorkflow() {
  return useStore(useAuthContext().store, (state) => state.workflow);
}
