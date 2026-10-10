import { adaptInspection } from "@/lib/api/adapters/inspection";
import { RepositoryError, type InspectionRepository } from "@/lib/api/repositories";
import { capturePlanSchema, inspectionLocationSchema } from "@/schemas/domain";
import { inspectionFixture, mockInspectionId } from "./fixtures";
import { templateCapturePlan } from "@/features/photography/inspection-template";
import { consentInputSchema, type ConsentReceipt } from "@/features/consent/consent-model";
import { vehicleConfirmationSchema, type VehicleConfirmationReceipt } from "@/features/vehicle/vehicle-model";
import { assertInspectionEditable } from "@/features/submission/edit-policy";

export function createMockInspectionRepository(): InspectionRepository {
  const consents = new Map<string, ConsentReceipt>();
  const inspection = adaptInspection(structuredClone(inspectionFixture));
  let vehicleConfirmation: VehicleConfirmationReceipt | null = null;
  function requireInspection(id: string) {
    if (id !== mockInspectionId) throw new RepositoryError("NOT_FOUND", "بازدید پیدا نشد.");
  }
  return {
    async getInspection(id) { requireInspection(id); return structuredClone(inspection); },
    async getCapturePlan(id) { requireInspection(id); return capturePlanSchema.parse(structuredClone(templateCapturePlan())); },
    async recordConsent(id, input) {
      requireInspection(id);
      const accepted = consentInputSchema.parse(input);
      const previous = consents.get(id);
      if (previous?.termsVersion === accepted.termsVersion) return structuredClone(previous);
      const receipt: ConsentReceipt = { inspectionId: id, ...accepted, acceptedAt: new Date().toISOString() };
      consents.set(id, receipt);
      return structuredClone(receipt);
    },
    async saveLocation(id, input) {
      requireInspection(id);
      await assertInspectionEditable(id);
      if (!consents.has(id)) throw new RepositoryError("CONSENT_REQUIRED", "ابتدا شرایط بازدید را بپذیرید.");
      inspection.location = inspectionLocationSchema.parse(input);
      return structuredClone(inspection.location);
    },
    async getVehicle(id) { requireInspection(id); return structuredClone(inspection.vehicle); },
    async confirmVehicle(id, input) {
      requireInspection(id);
      await assertInspectionEditable(id);
      if (!inspection.location) throw new RepositoryError("LOCATION_REQUIRED", "ابتدا موقعیت بازدید را تأیید کنید.");
      if (!inspection.vehicle) throw new RepositoryError("NOT_FOUND", "مشخصات خودرو پیدا نشد.");
      const confirmation = vehicleConfirmationSchema.parse(input);
      if (vehicleConfirmation && JSON.stringify({ plate: vehicleConfirmation.plate, discrepancy: vehicleConfirmation.discrepancy }) === JSON.stringify(confirmation)) return structuredClone(vehicleConfirmation);
      inspection.vehicle.plate = structuredClone(confirmation.plate);
      const receipt: VehicleConfirmationReceipt = { inspectionId: id, ...confirmation, confirmedAt: new Date().toISOString() };
      vehicleConfirmation = structuredClone(receipt);
      return structuredClone(receipt);
    },
  };
}
