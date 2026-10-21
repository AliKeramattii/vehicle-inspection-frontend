"use client";
import { createMockStaffSession, permitsStaff } from "@/features/identity/staff-session";
import {useMemo} from "react";
import {useRuntimeSite} from "@/config/site-settings.provider";
import {tenantWorkspaceKey} from "@/features/identity/source-context";
import {IndexedDbReviewPersistence} from "./persistence";
import {lifecycleRepository} from "@/features/inspection-status/lifecycle-repository";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {ReviewRepository,synchronizeSubmittedCases} from "./repository";
import type {OperationsActor} from "./model";
export function useReviewWorkspace(actor:OperationsActor){
 const site=useRuntimeSite(),tenantId=site.bootstrap.tenantId;
 const repository=useMemo(()=>new ReviewRepository(new IndexedDbReviewPersistence(tenantWorkspaceKey(tenantId)),undefined,undefined,undefined,lifecycleRepository,tenantId),[tenantId]);
 const cache=useQueryClient(),key=["review-workspace",site.contextKey,actor.id,actor.role];
 const query=useQuery({queryKey:key,queryFn:async()=>{if(!permitsStaff(createMockStaffSession(actor,site.bootstrap.tenantId),site.bootstrap.tenantId,"inspections:read"))throw new Error("دسترسی مجاز نیست.");await synchronizeSubmittedCases(tenantId,repository);return repository.read(actor);},retry:false});
 return {query,refresh:()=>cache.invalidateQueries({queryKey:["review-workspace"]}),repository};
}
