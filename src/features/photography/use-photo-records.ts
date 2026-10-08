"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexedDBPhotoStore, photoNamespace, type PhotoDraft, type PhotoStore } from "@/lib/media/photo-store";
import type { PhotographyTemplate } from "@/schemas/photography";

export function usePhotoRecords(inspectionId: string, template: PhotographyTemplate, store: PhotoStore = indexedDBPhotoStore) {
  const namespace = photoNamespace(inspectionId, template.templateId, template.templateVersion);
  const key = ["local-photos", namespace], cache = useQueryClient();
  const query = useQuery({ queryKey: key, queryFn: () => store.list(namespace), retry: false, networkMode: "always" });
  const draft = useMutation({ mutationFn: ({ id, draft }: { id: string; draft: PhotoDraft }) => store.saveDraft(namespace, id, draft), onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  const confirm = useMutation({ mutationFn: (id: string) => store.confirm(namespace, id), onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  const discard = useMutation({ mutationFn: (id: string) => store.discardDraft(namespace, id), onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  return { query, records: query.data ?? [], draft, confirm, discard };
}
