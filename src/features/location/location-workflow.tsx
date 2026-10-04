"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { useInspectionAccess } from "@/features/inspection/use-inspection-access";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { developmentLocationAdapter } from "@/lib/map/location-adapter";
import { LocationForm } from "./location-form";
import type { InspectionLocation } from "@/types/domain";

export function LocationWorkflow({ inspectionId }: { inspectionId: string }) {
  const { repository, authorized } = useInspectionAccess(inspectionId);
  const router = useRouter();
  const cache = useQueryClient();
  const inspection = useQuery({ queryKey: ["inspection", inspectionId], queryFn: () => repository.getInspection(inspectionId), retry: false });
  const save = useMutation({ mutationFn: (location: InspectionLocation) => repository.saveLocation(inspectionId, location), onSuccess: async () => {
    await cache.invalidateQueries({ queryKey: ["inspection", inspectionId] });
    router.push(inspectionRoutes.vehicle(inspectionId));
  } });
  if (inspection.isPending) return <div className="location-loading" role="status" aria-busy="true">در حال آماده‌سازی موقعیت…</div>;
  if (inspection.isError) return <div className="identity-load-error"><InlineAlert tone="destructive">{inspection.error.message}</InlineAlert><SecondaryButton onClick={() => void inspection.refetch()}>تلاش دوباره</SecondaryButton></div>;
  return <LocationForm initialLocation={inspection.data.location ?? developmentLocationAdapter.initialLocation} onConfirm={(location) => save.mutate(location)} pending={save.isPending} error={save.error?.message} canConfirm={authorized} />;
}
