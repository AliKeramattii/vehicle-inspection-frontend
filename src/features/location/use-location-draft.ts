
"use client";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { InspectionLocation } from "@/types/domain";
import { useOptionalRuntimeSite } from "@/config/site-settings.provider";
import { defaultLocationMap } from "@/config/site-settings.schema";
import { firstPartyReverseGeocoder, mockReverseGeocoder, unavailableReverseGeocoder, type ReverseGeocoder } from "@/lib/map/reverse-geocoder";
import { LocationController } from "./location-controller";

export function useLocationDraft(initial: InspectionLocation | null | undefined, provided?: ReverseGeocoder) {
  const runtime = useOptionalRuntimeSite();
  const bootstrap = runtime?.bootstrap, origin = runtime?.origin;
  const config = useMemo(() => runtime?.settings.application.locationMap ?? defaultLocationMap(), [runtime?.settings.application.locationMap]);
  const geocoder = useMemo(() => provided ?? (config.reverseGeocoding === "mock" ? mockReverseGeocoder :
    config.reverseGeocoding === "api" && bootstrap && origin ? firstPartyReverseGeocoder(bootstrap, origin) : unavailableReverseGeocoder),
    [provided, config.reverseGeocoding, bootstrap, origin]); // Trusted runtime API, never query-selected.
  const controller = useMemo(() => new LocationController(initial, geocoder), [initial, geocoder]);
  useEffect(() => () => controller.dispose(), [controller]);
  return { controller, config, draft: useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot) };
}
