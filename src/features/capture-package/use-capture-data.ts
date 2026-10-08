"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexedDBCaptureDataStore, type CaptureDataStore } from "@/lib/media/capture-data-store";
import type { OdometerReading, VideoDraft } from "./capture-package-model";
export function useCaptureData(namespace: string, store: CaptureDataStore = indexedDBCaptureDataStore) {
  const key = ["local-capture-data", namespace], cache = useQueryClient();
  const refresh = () => cache.invalidateQueries({ queryKey: key });
  const query = useQuery({ queryKey: key, queryFn: () => store.get(namespace), retry: false });
  const odometer = useMutation({ mutationFn: (value: OdometerReading) => store.saveOdometer(namespace, value), onSuccess: refresh });
  const draft = useMutation({ mutationFn: (value: VideoDraft) => store.saveVideoDraft(namespace, value), onSuccess: refresh });
  const confirm = useMutation({ mutationFn: () => store.confirmVideo(namespace), onSuccess: refresh });
  const discard = useMutation({ mutationFn: () => store.discardVideoDraft(namespace), onSuccess: refresh });
  return { query, data: query.data, odometer, draft, confirm, discard };
}
