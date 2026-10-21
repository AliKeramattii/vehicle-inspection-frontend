"use client";
import { useRuntimeSite } from "@/config/site-settings.provider";
import { InlineAlert } from "@/components/ui/status";
import { SecondaryButton } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext, useAuthWorkflow } from "@/features/auth/auth-workflow-provider";
import { customerEntryDestination } from "./status-service";
export function CustomerEntryResolver() {
 const site = useRuntimeSite();
 const { source, restoring } = useAuthContext(), workflow = useAuthWorkflow(), router = useRouter();
 const query = useQuery({ queryKey: ["customer-return", site.contextKey, workflow.stage === "verified" ? workflow.inspectionId : null], enabled: !restoring && workflow.stage === "verified", queryFn: async () => workflow.stage === "verified" ? customerEntryDestination(await source.resolve(), workflow.inspectionId) : "/", retry: false, networkMode: "always", staleTime: 0 });
 useEffect(() => { if (query.data && query.data !== "/") router.replace(query.data); }, [query.data, router]);
 if(query.error)return <InlineAlert tone="warning">بازیابی بازدید قبلی ممکن نشد. مدارک شما حذف نشده‌اند.<SecondaryButton onClick={()=>void query.refetch()}>تلاش دوباره برای بازیابی بازدید</SecondaryButton></InlineAlert>;
 return restoring || query.isFetching ? <p className="customer-return-status" role="status">در حال بازیابی بازدید قبلی…</p> : null;
}
