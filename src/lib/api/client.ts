import type { AuthRepository, InspectionRepository } from "./repositories";
import { createMockAuthRepository } from "@/mocks/auth-repository";
import { createMockInspectionRepository } from "@/mocks/inspection-repository";

export interface Repositories { auth: AuthRepository; inspection: InspectionRepository }
// Explicit mock composition point. Future HTTP repositories implement these same interfaces.
export function createRepositories(): Repositories {
  return { auth: createMockAuthRepository(), inspection: createMockInspectionRepository() };
}
