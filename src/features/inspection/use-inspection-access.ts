"use client";

import { useAuthContext, useAuthWorkflow } from "@/features/auth/auth-workflow-provider";
export function useInspectionAccess(inspectionId: string) {
  const { inspection: repository } = useAuthContext();
  const workflow = useAuthWorkflow();
  return { repository, authorized: workflow.stage === "verified" && workflow.inspectionId === inspectionId };
}
