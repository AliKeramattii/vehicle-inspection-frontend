import { demoInvitationMobile } from "@/features/auth/config";

/** Only adapters may supply identity. Query strings are never an identity source. */
export type CustomerSourceContext = {
  authority: "mock" | "brokerage-session";
  tenantId: string; subjectId: string; mobile: string;
};
export interface CustomerSourceAdapter { resolve(signal?: AbortSignal): Promise<CustomerSourceContext> }
export function createMockCustomerSource(tenantId: string): CustomerSourceAdapter {
  return { async resolve() { return { authority: "mock", tenantId, subjectId: "customer-demo", mobile: demoInvitationMobile }; } };
}
export const sourceOwnerKey = (scope: CustomerSourceContext) => JSON.stringify([scope.tenantId, scope.subjectId]);
export const mockInitialInspectionId = (tenantId: string) => tenantId === "demo" ? "insp_demo" : `insp_mock_${tenantId}`;
export const tenantWorkspaceKey = (tenantId: string) => tenantId === "demo" ? "current" : `tenant:${tenantId}`;

/** Local test session only, created after the existing mock OTP succeeds. Never production auth. */
export type MockVerifiedCustomerSession = { mode: "mock"; tenantId: string; subjectId: string; mobile: string; inspectionId: string; expiresAt: number };
const sessionKey = (scope: CustomerSourceContext) => "inspection-mock-session:" + sourceOwnerKey(scope);
export function readMockVerifiedSession(scope: CustomerSourceContext, now = Date.now()): MockVerifiedCustomerSession | undefined {
 if (scope.authority !== "mock" || typeof sessionStorage === "undefined") return;
 try { const value: MockVerifiedCustomerSession = JSON.parse(sessionStorage.getItem(sessionKey(scope)) ?? "null");
  if (value?.mode === "mock" && value.tenantId === scope.tenantId && value.subjectId === scope.subjectId && value.mobile === scope.mobile && typeof value.inspectionId === "string" && Number.isFinite(value.expiresAt) && value.expiresAt > now) return value;
 } catch { /* Malformed local mock session never grants access. */ }
}
export function saveMockVerifiedSession(scope: CustomerSourceContext, inspectionId: string) {
 if (scope.authority !== "mock" || typeof sessionStorage === "undefined") return;
 const value: MockVerifiedCustomerSession = { mode: "mock", tenantId: scope.tenantId, subjectId: scope.subjectId, mobile: scope.mobile, inspectionId, expiresAt: Date.now() + 30 * 60_000 };
 try { sessionStorage.setItem(sessionKey(scope), JSON.stringify(value)); } catch { /* Session restoration unavailable; current verified workflow still works. */ }
}
