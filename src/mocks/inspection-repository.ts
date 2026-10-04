import { adaptInspection } from "@/lib/api/adapters/inspection";
import { RepositoryError, type InspectionRepository } from "@/lib/api/repositories";
import { capturePlanSchema } from "@/schemas/domain";
import { capturePlanFixture, inspectionFixture, mockInspectionId } from "./fixtures";
import { consentInputSchema, type ConsentReceipt } from "@/features/consent/consent-model";

export function createMockInspectionRepository(): InspectionRepository {
  const consents = new Map<string, ConsentReceipt>();
  function requireInspection(id: string) {
    if (id !== mockInspectionId) throw new RepositoryError("NOT_FOUND", "بازدید پیدا نشد.");
  }
  return {
    async getInspection(id) { requireInspection(id); return adaptInspection(structuredClone(inspectionFixture)); },
    async getCapturePlan(id) { requireInspection(id); return capturePlanSchema.parse(structuredClone(capturePlanFixture)); },
    async recordConsent(id, input) {
      requireInspection(id);
      const accepted = consentInputSchema.parse(input);
      const previous = consents.get(id);
      if (previous?.termsVersion === accepted.termsVersion) return structuredClone(previous);
      const receipt: ConsentReceipt = { inspectionId: id, ...accepted, acceptedAt: new Date().toISOString() };
      consents.set(id, receipt);
      return structuredClone(receipt);
    },
  };
}
