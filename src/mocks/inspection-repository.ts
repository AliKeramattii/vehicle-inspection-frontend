import { adaptInspection } from "@/lib/api/adapters/inspection";
import { RepositoryError, type InspectionRepository } from "@/lib/api/repositories";
import { capturePlanSchema } from "@/schemas/domain";
import { capturePlanFixture, inspectionFixture, mockInspectionId } from "./fixtures";

export function createMockInspectionRepository(): InspectionRepository {
  function requireInspection(id: string) {
    if (id !== mockInspectionId) throw new RepositoryError("NOT_FOUND", "بازدید پیدا نشد.");
  }
  return {
    async getInspection(id) { requireInspection(id); return adaptInspection(structuredClone(inspectionFixture)); },
    async getCapturePlan(id) { requireInspection(id); return capturePlanSchema.parse(structuredClone(capturePlanFixture)); },
  };
}
