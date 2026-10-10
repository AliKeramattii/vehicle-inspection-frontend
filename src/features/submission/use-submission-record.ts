"use client";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeSubmission } from "./submission-repository";
import { submissionService } from "./submission-service";
export const submissionQueryKey = (id: string) => ["submission", id] as const;
export function useSubmissionRecord(id: string) {
  const cache = useQueryClient();
  useEffect(() => subscribeSubmission(() => { void cache.invalidateQueries({ queryKey: submissionQueryKey(id) }); }), [cache, id]);
  return useQuery({ queryKey: submissionQueryKey(id), queryFn: async () => (await submissionService.recover(id)) ?? null, retry: false, staleTime: 0, networkMode: "always", refetchOnWindowFocus: true,
    refetchInterval: (query) => query.state.data?.status === "submitting" ? 1000 : false });
}
