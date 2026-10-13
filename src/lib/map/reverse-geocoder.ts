
import { z } from "zod";
import { apiUrl, type SiteBootstrap } from "@/config/site-settings.schema";
import { MAX_LOCATION_ADDRESS_LENGTH, coordinatesSchema, type LocationSelection } from "./location-selection";

export type AddressResult = { formattedAddress: string; source: "api" | "mock" };
export interface ReverseGeocoder {
  address(point: Pick<LocationSelection, "latitude" | "longitude">, signal: AbortSignal): Promise<AddressResult>;
}
export const unavailableReverseGeocoder: ReverseGeocoder = {
  async address() { throw new Error("Address service is not configured."); },
};
/** Explicit fixture only; never presented as a verified provider address. */
export const mockReverseGeocoder: ReverseGeocoder = {
  async address(point, signal) {
    coordinatesSchema.parse(point); signal.throwIfAborted();
    return { formattedAddress: "آدرس آزمایشی: تهران، خیابان نمونه، محل بازدید خودرو", source: "mock" };
  },
};
const responseSchema = z.object({ formatted_address: z.string().trim().min(1).max(MAX_LOCATION_ADDRESS_LENGTH) });
export function firstPartyReverseGeocoder(bootstrap: SiteBootstrap, origin: string, fetcher: typeof fetch = fetch): ReverseGeocoder {
  const endpoint = apiUrl(bootstrap, origin, "/maps/reverse");
  return { async address(point, signal) {
    coordinatesSchema.parse(point);
    const url = new URL(endpoint);
    url.searchParams.set("lat", String(point.latitude)); url.searchParams.set("lng", String(point.longitude));
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 10000);
    const abort = () => timeout.abort(); signal.addEventListener("abort", abort, { once: true });
    try {
      signal.throwIfAborted();
      // Trusted deployment API only. Never call api.neshan.org or attach a service key.
      const response = await fetcher(url.href, { signal: timeout.signal, credentials: "include", cache: "no-store", redirect: "error", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Address lookup failed.");
      return { formattedAddress: responseSchema.parse(await response.json()).formatted_address, source: "api" };
    } finally { clearTimeout(timer); signal.removeEventListener("abort", abort); }
  } };
}
