"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { VehicleCard } from "@/components/vehicle/vehicle-card";
import { SecondaryButton } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/status";
import { useInspectionAccess } from "@/features/inspection/use-inspection-access";
import { inspectionRoutes } from "@/features/inspection/inspection-routes";
import { VehicleForm } from "./vehicle-form";
import type { VehicleConfirmationInput } from "./vehicle-model";

export function VehicleWorkflow({ inspectionId }: { inspectionId: string }) {
  const { repository, authorized } = useInspectionAccess(inspectionId);
  const cache = useQueryClient();
  const router = useRouter();
  const inspection = useQuery({ queryKey: ["inspection", inspectionId], queryFn: () => repository.getInspection(inspectionId), retry: false });
  const vehicle = useQuery({ queryKey: ["vehicle", inspectionId], queryFn: () => repository.getVehicle(inspectionId), retry: false });
  const save = useMutation({ mutationFn: (input: VehicleConfirmationInput) => repository.confirmVehicle(inspectionId, input), onSuccess: async () => {
    await cache.invalidateQueries({ queryKey: ["vehicle", inspectionId] });
    await cache.invalidateQueries({ queryKey: ["inspection", inspectionId] });
    router.push(inspectionRoutes.capture(inspectionId));
  } });
  if (vehicle.isPending || inspection.isPending) return <div className="vehicle-loading" role="status" aria-busy="true">در حال دریافت مشخصات خودرو…</div>;
  const loadError = vehicle.error ?? inspection.error;
  if (loadError) return <div className="identity-load-error"><InlineAlert tone="destructive">{loadError.message}</InlineAlert><SecondaryButton onClick={() => { void vehicle.refetch(); void inspection.refetch(); }}>تلاش دوباره</SecondaryButton></div>;
  if (!vehicle.data) return <InlineAlert>مشخصات خودرو در دسترس نیست. با نماینده شرکت بیمه هماهنگ کنید.</InlineAlert>;
  return <><VehicleCard vehicle={vehicle.data} /><VehicleForm vehicle={vehicle.data} onConfirm={(input) => save.mutate(input)} pending={save.isPending} error={save.error?.message} canConfirm={authorized && Boolean(inspection.data?.location)} /></>;
}
