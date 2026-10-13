
import type { InspectionLocation } from "@/types/domain";
import { MAX_LOCATION_ADDRESS_LENGTH, samePoint, savedSelection, selectionSchema, type LocationSelection } from "@/lib/map/location-selection";
import type { AddressResult, ReverseGeocoder } from "@/lib/map/reverse-geocoder";

export type LocationDraft = {
  point: LocationSelection | null; address: string; addressCurrent: boolean;
  addressStatus: "idle" | "loading" | "suggested" | "manual" | "failed" | "stale";
  addressSource?: AddressResult["source"]; suggestion?: string;
};
export class LocationController {
  private state: LocationDraft;
  private listeners = new Set<() => void>();
  private timer?: ReturnType<typeof setTimeout>;
  private request?: AbortController;
  private revision = 0;
  private editRevision = 0;
  private focused = false;
  private edited = false;
  private cache = new Map<string, AddressResult>();
  constructor(initial: InspectionLocation | null | undefined, private geocoder: ReverseGeocoder, private delay = 400) {
    const point = savedSelection(initial);
    this.state = { point, address: initial?.formattedAddress ?? "", addressCurrent: Boolean(point),
      addressStatus: point ? "manual" : "idle" };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(patch: Partial<LocationDraft>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(listener => listener()); }
  private cancel() { clearTimeout(this.timer); this.request?.abort(); this.request = undefined; this.revision++; }
  dispose() { this.cancel(); }
  focusAddress(focused: boolean) { this.focused = focused; }
  editAddress(address: string) {
    this.edited = true; this.editRevision++;
    this.update({ address, addressCurrent: Boolean(this.state.point && address.trim()), addressStatus: "manual", addressSource: undefined });
  }
  useAddressForPoint() {
    if (!this.state.point || !this.state.address.trim()) return;
    this.edited = true; this.editRevision++;
    this.update({ addressCurrent: true, addressStatus: "manual", addressSource: undefined });
  }
  useSuggestion() {
    if (!this.state.suggestion) return;
    this.editAddress(this.state.suggestion);
  }
  select(value: LocationSelection) {
    const point = selectionSchema.parse(value);
    if (this.state.point && samePoint(point, this.state.point)) {
      this.update({ point }); return; // Zoom / repeated GPS do not reset edits or duplicate requests.
    }
    this.cancel();
    this.update({ point, addressCurrent: false, addressStatus: this.state.address ? "stale" : "loading", suggestion: undefined, addressSource: undefined });
    const revision = this.revision;
    this.timer = setTimeout(() => { void this.lookup(point, revision); }, this.delay);
  }
  retryAddress() {
    if (!this.state.point) return;
    this.cancel(); void this.lookup(this.state.point, this.revision);
  }
  private async lookup(point: LocationSelection, revision: number) {
    const request = new AbortController(); this.request = request;
    const editRevision = this.editRevision;
    this.update({ addressStatus: this.state.addressCurrent ? this.state.addressStatus : "loading" });
    try {
      const key = point.latitude.toFixed(6) + "," + point.longitude.toFixed(6);
      const result = this.cache.get(key) ?? await this.geocoder.address(point, request.signal);
      if (request.signal.aborted || revision !== this.revision) return;
      if (!result.formattedAddress.trim()) throw new Error("Empty address.");
      this.cache.set(key, result); if (this.cache.size > 30) this.cache.delete(this.cache.keys().next().value!);
      if (this.focused || this.edited || editRevision !== this.editRevision) {
        this.update({ suggestion: result.formattedAddress, addressStatus: this.state.addressCurrent ? "manual" : "stale" }); return;
      }
      this.update({ address: result.formattedAddress, addressCurrent: true, addressStatus: "suggested", addressSource: result.source });
    } catch {
      if (!request.signal.aborted && revision === this.revision)
        this.update({ addressStatus: this.state.addressCurrent ? "manual" : "failed" });
    } finally { if (this.request === request) this.request = undefined; }
  }
  get canConfirm() { return Boolean(this.state.point && this.state.addressCurrent && this.state.address.trim() && this.state.address.trim().length <= MAX_LOCATION_ADDRESS_LENGTH); }
  confirmed(fields: Pick<InspectionLocation, "buildingNumber" | "unitFloor" | "parkingDescription">, now = () => new Date().toISOString()): InspectionLocation {
    if (!this.canConfirm || !this.state.point) throw new Error("Explicit point and current address required.");
    return { ...fields, ...this.state.point, formattedAddress: this.state.address.trim(), recordedAt: now() };
  }
}
