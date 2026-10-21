import { z } from "zod";
import type { OperationsActor } from "@/features/review-operations/model";
export const staffPermissions = ["templates:read","templates:edit","settings:write","staff:manage","inspections:read","inspections:assign","evidence:decide","inspection:decide"] as const;
const authenticatedSession = z.object({state:z.literal("authenticated"),authority:z.enum(["mock","backend-session"]),tenantId:z.string().min(1),subjectId:z.string().min(1),role:z.enum(["platform-admin","reviewer","template-editor","viewer"]),permissions:z.array(z.enum(staffPermissions)),expiresAt:z.iso.datetime()}).strict();
export type AuthenticatedStaffSession = z.infer<typeof authenticatedSession>;
export type StaffSession = AuthenticatedStaffSession | {state:"anonymous"|"expired"};
/** Future implementation reads only a server-validated, brokerage-scoped session. No endpoints are invented here. */
export interface StaffSessionAdapter { resolve(signal?:AbortSignal):Promise<StaffSession> }
export function parseStaffSession(value:unknown,tenantId:string,now=Date.now()):StaffSession {
 const parsed=authenticatedSession.safeParse(value);
 return parsed.success&&parsed.data.tenantId===tenantId&&Date.parse(parsed.data.expiresAt)>now ? parsed.data : {state:"expired"};
}
export function permitsStaff(session:StaffSession,tenantId:string,permission:typeof staffPermissions[number],now=Date.now()) {
 return session.state==="authenticated"&&session.tenantId===tenantId&&Date.parse(session.expiresAt)>now&&session.permissions.includes(permission);
}
export function staffDestination(session:StaffSession,tenantId:string,now=Date.now()) {
 if(session.state!=="authenticated"||session.tenantId!==tenantId||Date.parse(session.expiresAt)<=now)return null;
 return session.role==="reviewer" ? permitsStaff(session,tenantId,"inspections:read",now)?"/reviewer":null : permitsStaff(session,tenantId,"templates:read",now)?"/admin":null;
}
/** Explicit local sample actor, never parsed from URL claims or presented as production SSO. */
export function createMockStaffSession(actor:OperationsActor,tenantId:string,now=Date.now()):AuthenticatedStaffSession {
 const permissions:AuthenticatedStaffSession["permissions"] = actor.role==="platform-admin" ? ["templates:read","templates:edit","settings:write","staff:manage","inspections:read","inspections:assign"] : actor.role==="reviewer" ? ["inspections:read","evidence:decide","inspection:decide"] : actor.role==="template-editor" ? ["templates:read","templates:edit"] : ["templates:read"];
 return {state:"authenticated",authority:"mock",tenantId,subjectId:actor.id,role:actor.role,permissions,expiresAt:new Date(now+30*60_000).toISOString()};
}
