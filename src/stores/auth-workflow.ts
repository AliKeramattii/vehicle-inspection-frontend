import { createStore } from "zustand/vanilla";

export type AuthWorkflow = { stage: "idle" } | {
  stage: "challenge"; mobile: string; referralCode: string; resendAt: number; expiresAt: number; remainingAttempts: number;
} | { stage: "verified"; mobile: string };
type State = { workflow: AuthWorkflow; setWorkflow: (workflow: AuthWorkflow) => void };
export function createAuthWorkflowStore() {
  return createStore<State>((set) => ({ workflow: { stage: "idle" }, setWorkflow: (workflow) => set({ workflow }) }));
}
export type AuthWorkflowStore = ReturnType<typeof createAuthWorkflowStore>;
