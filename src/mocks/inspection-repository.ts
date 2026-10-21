import { createMockCustomerSource, mockInitialInspectionId } from "@/features/identity/source-context";
import { lifecycleRepository } from "@/features/inspection-status/lifecycle-repository";
import { readFacts, saveFacts } from "@/lib/media/inspection-facts-store";
import { vehicleColors } from "@/features/vehicle/vehicle-colors";
import { adaptInspection } from "@/lib/api/adapters/inspection";
import { RepositoryError, type InspectionRepository } from "@/lib/api/repositories";
import { capturePlanSchema, inspectionLocationSchema } from "@/schemas/domain";
import { inspectionFixture, mockInspectionReference } from "./fixtures";
import { templateCapturePlan } from "@/features/photography/inspection-template";
import { consentInputSchema, type ConsentReceipt } from "@/features/consent/consent-model";
import { vehicleConfirmationSchema, type VehicleConfirmationReceipt } from "@/features/vehicle/vehicle-model";
import { assertInspectionEditable } from "@/features/submission/edit-policy";

export function createMockInspectionRepository(tenantId = "demo"): InspectionRepository {
  const consents = new Map<string, ConsentReceipt>();
  const inspections = new Map<string, ReturnType<typeof adaptInspection>>();
  const confirmations = new Map<string, VehicleConfirmationReceipt>();
  async function requireInspection(id: string) {
    if (id !== mockInitialInspectionId(tenantId) && (typeof indexedDB === "undefined" || !await lifecycleRepository.read(await createMockCustomerSource(tenantId).resolve(), id))) throw new RepositoryError("NOT_FOUND", "بازدید پیدا نشد.");
    if (!inspections.has(id)) inspections.set(id, adaptInspection({...structuredClone(inspectionFixture), inspectionId: id}));
    const inspection = inspections.get(id)!;
    const facts = await readFacts(id); if (facts?.location) inspection.location = facts.location; if (facts?.vehicle) inspection.vehicle = facts.vehicle;
    return inspection;
  }
  return {
    async getTrackingCode(id) { await requireInspection(id); const record = typeof indexedDB !== "undefined" ? await lifecycleRepository.read(await createMockCustomerSource(tenantId).resolve(), id) : undefined; return record?.trackingCode ?? (tenantId === "demo" ? mockInspectionReference : `MOCK-${tenantId.toUpperCase()}`); },
    async getInspection(id) { const inspection = await requireInspection(id); const facts=await readFacts(id); if(facts?.location)inspection.location=facts.location;if(facts?.vehicle)inspection.vehicle=facts.vehicle; return structuredClone(inspection); },
    async getCapturePlan(id) { await requireInspection(id); return capturePlanSchema.parse(structuredClone(templateCapturePlan())); },
    async recordConsent(id, input) {
      await requireInspection(id);
      const accepted = consentInputSchema.parse(input);
      const previous = consents.get(id) ?? (await readFacts(id))?.consent;
      if (previous?.termsVersion === accepted.termsVersion) return structuredClone(previous);
      const receipt: ConsentReceipt = { inspectionId: id, ...accepted, acceptedAt: new Date().toISOString() };
      consents.set(id, receipt);
      await saveFacts(id, {consent:receipt});
      return structuredClone(receipt);
    },
    async saveLocation(id, input) {
      const inspection = await requireInspection(id);
      await assertInspectionEditable(id);
      if (!consents.has(id) && !(await readFacts(id))?.consent && !(await readFacts(id))?.location) throw new RepositoryError("CONSENT_REQUIRED", "ابتدا شرایط بازدید را بپذیرید.");
      const location = inspectionLocationSchema.parse(input);
      await saveFacts(id,{location});
      inspection.location = location;
      return structuredClone(inspection.location);
    },
    async getVehicle(id) { const inspection = await requireInspection(id);const facts=await readFacts(id);if(facts?.vehicle)inspection.vehicle=facts.vehicle; return structuredClone(inspection.vehicle); },
    async confirmVehicle(id, input) {
      const inspection = await requireInspection(id);
      await assertInspectionEditable(id);
      if (!inspection.location) throw new RepositoryError("LOCATION_REQUIRED", "ابتدا موقعیت بازدید را تأیید کنید.");
      if (!inspection.vehicle) throw new RepositoryError("NOT_FOUND", "مشخصات خودرو پیدا نشد.");
      const confirmation = vehicleConfirmationSchema.parse(input);
      const vehicleConfirmation = confirmations.get(id);
      if (vehicleConfirmation && JSON.stringify({ plate: vehicleConfirmation.plate, colorId: vehicleConfirmation.colorId, discrepancy: vehicleConfirmation.discrepancy }) === JSON.stringify(confirmation)) return structuredClone(vehicleConfirmation);
      const nextVehicle = {...inspection.vehicle,plate:structuredClone(confirmation.plate)};
      const color = vehicleColors.find(c=>c.id===confirmation.colorId);
      if (color) { nextVehicle.colorName = color.label; nextVehicle.colorHex = color.hex; }
      const receipt: VehicleConfirmationReceipt = { inspectionId: id, ...confirmation, confirmedAt: new Date().toISOString() };
      await saveFacts(id,{vehicle:nextVehicle});
      inspection.vehicle=nextVehicle;
      confirmations.set(id, structuredClone(receipt));
      return structuredClone(receipt);
    },
  };
}
