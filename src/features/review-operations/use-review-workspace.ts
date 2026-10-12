"use client";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {reviewRepository,synchronizeSubmittedCases} from "./repository";
import type {OperationsActor} from "./model";
export function useReviewWorkspace(actor:OperationsActor){
 const cache=useQueryClient(),key=["review-workspace",actor.id,actor.role];
 const query=useQuery({queryKey:key,queryFn:async()=>{await synchronizeSubmittedCases();return reviewRepository.read(actor);},retry:false});
 return {query,refresh:()=>cache.invalidateQueries({queryKey:["review-workspace"]}),repository:reviewRepository};
}
