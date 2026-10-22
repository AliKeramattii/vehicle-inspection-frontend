"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assertPhotoChoice } from "./photo-choice";
import { readPhoto, photoKey, selectPhotoAlternative, indexedDBPhotoStore, photoNamespace, type PhotoDraft, type PhotoStore } from "@/lib/media/photo-store";
import type { PhotographyTemplate } from "@/schemas/photography";
import { createPhotoOptimization } from "@/lib/media/photo-optimization";
import type { ImagePolicy } from "@/lib/media/image-policy";
import { assertInspectionEditable } from "@/features/submission/edit-policy";

export function usePhotoRecords(inspectionId: string, template: PhotographyTemplate, store: PhotoStore = indexedDBPhotoStore) {
  const namespace = photoNamespace(inspectionId, template.templateId, template.templateVersion);
  const key = ["local-photos", namespace], cache = useQueryClient();
  const query = useQuery({ queryKey: key, queryFn: () => store.list(namespace), retry: false, networkMode: "always" });
  const draft = useMutation({ mutationFn: async ({ id, draft }: { id: string; draft: PhotoDraft }) => { await assertInspectionEditable(inspectionId); const photo = template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===id); if (!photo) throw new Error("عکس در قالب وجود ندارد."); assertPhotoChoice(photo, draft.alternativeId); return store.saveDraft(namespace, id, draft); }, onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  const choice = useMutation({mutationFn:async ({id,alternativeId}:{id:string;alternativeId?:string})=>{
    await assertInspectionEditable(inspectionId);
    const photo = template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===id);
    if (!photo) throw new Error("عکس در قالب وجود ندارد.");
    if (alternativeId !== undefined) assertPhotoChoice(photo, alternativeId);
    await selectPhotoAlternative(namespace,id,alternativeId);
  },onSuccess:()=>cache.invalidateQueries({queryKey:key}),networkMode:"always"});
  const confirm = useMutation({ mutationFn: async (id: string) => { await assertInspectionEditable(inspectionId); const photo = template.sections.flatMap(s=>s.photoRequirements).find(p=>p.id===id); if (!photo) throw new Error("عکس در قالب وجود ندارد."); const record = store === indexedDBPhotoStore ? await readPhoto(photoKey(namespace,id)) : (await store.list(namespace)).find(p=>p.requirementId===id); assertPhotoChoice(photo, record?.draft?.alternativeId); return store.confirm(namespace, id, record?.draft?.revisionId); }, onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  const discard = useMutation({ mutationFn: async (id: string) => { await assertInspectionEditable(inspectionId); return store.discardDraft(namespace, id); }, onSuccess: () => cache.invalidateQueries({ queryKey: key }), networkMode: "always" });
  const optimizer = createPhotoOptimization(async operation => { await assertInspectionEditable(inspectionId); return operation(namespace); });
  const optimized = useMutation({mutationFn:({id,policy,signal}:{id:string;policy:ImagePolicy;signal?:AbortSignal})=>optimizer.prepare(id,policy,signal),onSettled:()=>cache.invalidateQueries({queryKey:key}),networkMode:"always"});
  const variant = useMutation({mutationFn:({id,revision,choice}:{id:string;revision:string;choice:"source"|"optimized"})=>optimizer.choose(id,revision,choice),onSettled:()=>cache.invalidateQueries({queryKey:key}),networkMode:"always"});
  return { query, records: query.data ?? [], draft, confirm, discard, choice, optimization: store === indexedDBPhotoStore ? {
    prepare:(id:string,policy:ImagePolicy,signal?:AbortSignal)=>optimized.mutateAsync({id,policy,signal}),
    choose:(id:string,revision:string,choice:"source"|"optimized")=>variant.mutateAsync({id,revision,choice}),
  } : undefined };
}
