# Frontend to backend handoff

## Status of this document

These are **proposed contract categories**, not confirmed API URLs or implemented ASP.NET behavior. Existing planned upload/submission endpoints remain documented in API_CONTRACT.md. Agree actual routes, DTOs, OpenAPI generation and authentication with the backend team before integration. UI consumes domain models/adapters, never transport DTOs.

## Proposed categories and payloads

| Category | Input / result | Ownership |
| --- | --- | --- |
| Trusted customer source/session | Tenant/subject/source-owned mobile, expiry/verification policy | Brokerage authentication + ASP.NET |
| Staff session/permissions | `StaffSession` backend-session projection | Brokerage authentication + ASP.NET |
| Current authorized inspection | Existing ID/tracking/lifecycle/version; safe current attempt | Tenant/subject scoped server query |
| Customer status | `InspectionStatusEnvelope` plus exact correction tasks; no internal notes | Server-authoritative after submission |
| Staff case search | Tracking, phone, plate, lifecycle + pagination; assigned/tenant visibility | Authorized server query |
| Individual evidence decision | `EvidenceDecisionCommand`: requirementId, revisionId, decision, optional required public reason, expectedVersion, idempotencyKey | Assigned Reviewer; server adds actor/time |
| Whole-inspection decision | `WholeInspectionDecisionCommand`: separate approved/rejected, reason for rejection | Assigned Reviewer; validate all required evidence/current revisions |
| Internal notes | Case/version/text; actor/time in staff response only | Authorized staff, never customer projection |
| Vehicle correction task | Field plate/color/modelYear, public reason; exact `FieldCorrectionCommand` proposal | Server allowlist + assignment validation |
| Rejected-attempt restart | `NewInspectionAttemptCommand`, linked new ID/tracking and pinned template | One transactional idempotent new empty attempt |
| Forwarding status | `ForwardingProjection` with acknowledgement ID/time only after delivery | Tenant-controlled backend transport/outbox |
| Notifications | `InspectionNotificationEvent` safe reason/status metadata | Optional server SMS/event delivery |
| Public Site Settings | Existing provider/schema, optional accent/halo color/intensity | Brokerage branding; central map values read-only |

Types live in `features/identity/` and `features/inspection-status/integration-contracts.ts`. Existing persisted submission/upload enums remain intact; the lifecycle is an adapter/view. Tracking codes must be server-issued, unique and linked to inspection/customer/vehicle/evidence/revisions/history/decisions/forwarding, never an access credential.

## Security and versioning

Every query/mutation/media URL must enforce verified session, tenant and subject/role/assignment. A browser tenant field is only context; server derives effective authority. Reject cross-tenant IDs even when valid elsewhere. Public settings must contain no private Neshan service key, SSO secret, storage credential or forwarding token. Source mobile cannot be edited through ordinary inspection updates.

Use optimistic concurrency for evidence revisions and whole-case decisions. Return explicit field errors for invalid correction proposals, 401 authentication, 403 permission, 404 invisible/missing resource, 409 stale/conflicting version, 422 illegal transition, 429 retry guidance and recoverable server/network failures. Stable idempotency keys must recover uncertain submission/restart/decision/delivery without creating duplicates.

## Evidence and forwarding

Keep photo/video durable Blob references and one shared queue. Preserve accepted revisions until a replacement is persisted/confirmed. Partial corrections retain original inspection ID; full rejection starts new namespaces without copying old evidence. Secure Reviewer old/current retrieval must preserve revision access/audit and may use authorized short-lived media URLs.

Brokerage destination and credentials are deployment/tenant controlled. Browser never uploads private evidence to arbitrary entered URLs. Backend owns allowlists, authorization, retries/backoff, durable outbox, payload integrity, idempotency, audit and acknowledged delivery. REVIEW_APPROVED is not FORWARDED; retries/failure do not require customer recapture. Retain local evidence until a separately approved lifecycle cleanup policy exists.

## Current verification limits

The browser implementation tests mock source context/OTP, tenant-keyed IndexedDB workspaces, exact requests, status projections, public reasons/private notes, final decision separation and halo publication. It does not prove server authentication, SMS delivery, multi-user transactional safety or brokerage receipt. Neshan remains the existing real authorized map/service boundary; no map redesign or key migration belongs to this phase.
