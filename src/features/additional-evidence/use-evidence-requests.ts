"use client";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { indexedDBRequestRepository, subscribeRequests } from "./request-repository";
import { requestService } from "./request-service";
export const requestQueryKey = ["evidence-requests"] as const;
export function useEvidenceRequests(inspectionId: string) {
  const cache = useQueryClient();
  useEffect(() => subscribeRequests(() => { void cache.invalidateQueries({ queryKey: requestQueryKey }); }), [cache]);
  return useQuery({ queryKey: [...requestQueryKey, inspectionId], queryFn: async () => { const requests = await indexedDBRequestRepository.list(inspectionId); return Promise.all(requests.map(async (request) => (await requestService.recover(request.id))!)); }, networkMode: "always", retry: false, staleTime: 0, refetchInterval: (query) => query.state.data?.some((request) => request.status === "resubmitting" || request.mutationOwner) ? 750 : false });
}
