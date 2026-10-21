"use client";
import { useRuntimeSite } from "@/config/site-settings.provider";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext, useAuthWorkflow } from "@/features/auth/auth-workflow-provider";
import { mockInspectionStatusAdapter } from "./status-service";
export function useCustomerStatus(id: string) {
 const site = useRuntimeSite();
 const { source, restoring } = useAuthContext(), workflow = useAuthWorkflow();
 return useQuery({ queryKey: ["customer-status", site.contextKey, id], queryFn: async () => (await mockInspectionStatusAdapter.read(await source.resolve(), id)) ?? null, enabled: !restoring && workflow.stage === "verified" && workflow.inspectionId === id, retry: false, staleTime: 0, networkMode: "always", refetchOnWindowFocus: true });
}
