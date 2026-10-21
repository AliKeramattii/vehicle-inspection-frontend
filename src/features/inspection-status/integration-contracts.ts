import type { InspectionLifecycle, VehicleCorrectionValue } from "./lifecycle-model";
/** Proposed payload categories only. ASP.NET endpoint URLs and DTOs remain unconfirmed. */
export type ForwardingProjection = {phase:"ready"|"sending"|"retrying"|"failed";acknowledgementId?:never;acknowledgedAt?:never} | {phase:"acknowledged";acknowledgementId:string;acknowledgedAt:string};
export type InspectionNotificationEvent = {id:string;tenantId:string;inspectionId:string;trackingCode:string;type:"submitted"|"changes-requested"|"rejected"|"review-approved"|"forwarded";at:string;customerReason?:string};
export type WholeInspectionDecisionCommand = {inspectionId:string;expectedVersion:string;idempotencyKey:string} & ({decision:"approved"}|{decision:"rejected";customerReason:string});
export type EvidenceDecisionCommand = {inspectionId:string;requirementId:string;revisionId:string;expectedVersion:string;idempotencyKey:string} & ({decision:"approved"}|{decision:"correction-requested";customerReason:string});
export type FieldCorrectionCommand = {inspectionId:string;taskId:string;expectedVersion:string;correction:VehicleCorrectionValue};
export type InspectionStatusEnvelope = {inspectionId:string;trackingCode:string;status:InspectionLifecycle;version:string;updatedAt:string;customerExplanation?:string;forwarding?:ForwardingProjection};
export type NewInspectionAttemptCommand = {rejectedInspectionId:string;expectedVersion:string;idempotencyKey:string};
