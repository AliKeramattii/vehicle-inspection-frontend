"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexedDBCaptureDataStore, type CaptureDataStore } from "@/lib/media/capture-data-store";
import type { OdometerReading, VideoDraft } from "./capture-package-model";
import { assertCaptureEditable } from "@/features/submission/edit-policy";
export function useCaptureData(namespace: string, store: CaptureDataStore = indexedDBCaptureDataStore) {
  const key = ["local-capture-data", namespace], cache = useQueryClient();
  const refresh = () => cache.invalidateQueries({ queryKey: key });
  const query = useQuery({ queryKey: key, queryFn: () => store.get(namespace), retry: false, networkMode: "always" });
  const odometer = useMutation({ mutationFn: async (value: OdometerReading) => { await assertCaptureEditable(namespace); return store.saveOdometer(namespace, value); }, onSuccess: refresh, networkMode: "always" });
  const draft = useMutation({ mutationFn: async (value: VideoDraft) => { await assertCaptureEditable(namespace); return store.saveVideoDraft(namespace, value); }, onSuccess: refresh, networkMode: "always" });
  const confirm = useMutation({ mutationFn: async () => { await assertCaptureEditable(namespace); return store.confirmVideo(namespace); }, onSuccess: refresh, networkMode: "always" });
  const discard = useMutation({ mutationFn: async () => { await assertCaptureEditable(namespace); return store.discardVideoDraft(namespace); }, onSuccess: refresh, networkMode: "always" });
  return { query, data: query.data, odometer, draft, confirm, discard };
}
