"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { indexedDBPhotoStore, photoNamespace, type PhotoDraft, type PhotoStore } from "@/lib/media/photo-store";
import type { PhotographyTemplate } from "@/schemas/photography";
import { assertInspectionEditable } from "@/features/submission/edit-policy";

export function usePhotoRecords(inspectionId: string, template: PhotographyTemplate, store: PhotoStore = indexedDBPhotoStore) {
  const namespace = photoNamespace(inspectionId, template.templateId, template.templateVersion);
  const key = ["local-photos", namespace], cache = useQueryClient();
  const query = useQuery({ queryKey: key, queryFn: () => store.list(namespace), retry: false, networkMode: "always" });
  const draft = useMutation({ mutationFn: async ({ id, draft }: { id: string; draft: PhotoDraft }) => { await assertInspectionEditable(inspectionId); return store.saveDraft(namespace, id, draft); }, onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  const confirm = useMutation({ mutationFn: async (id: string) => { await assertInspectionEditable(inspectionId); return store.confirm(namespace, id); }, onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  const discard = useMutation({ mutationFn: async (id: string) => { await assertInspectionEditable(inspectionId); return store.discardDraft(namespace, id); }, onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  return { query, records: query.data ?? [], draft, confirm, discard };
}
