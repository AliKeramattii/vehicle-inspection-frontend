# Route Map

Implemented through phase 03: `/`, `/verify`, `/readiness`, `/consent`, and the location/vehicle
inspection routes below. Other product routes remain planned. Internal bootstrap routes:
`/foundation` and `/foundation/preview`. Successful consent enters location; saved location enters
vehicle. Vehicle confirmation ends on the vehicle route; no capture scaffold is created. Direct
viewing is supported, but submissions require the verified mock workflow and repository prerequisites.

## Customer

- `/` — partner/referral landing
- `/verify` — OTP
- `/readiness`
- `/consent`
- `/inspection/[inspectionId]/location` — implemented with a deterministic map/location adapter
- `/inspection/[inspectionId]/vehicle` — implemented with semantic plate confirmation/editing
- `/inspection/[inspectionId]/capture`
- `/inspection/[inspectionId]/upload`
- `/inspection/[inspectionId]/review`
- `/inspection/[inspectionId]/submitted`
- `/inspection/[inspectionId]/additional-evidence`

## Reviewer

- `/reviewer/queue`
- `/reviewer/cases/[caseId]`

## Admin

- `/admin/branding`
- `/admin/policies`
- `/admin/templates`
- `/admin/templates/[templateId]`
- `/admin/webhooks`
- `/admin/users`
- `/admin/permissions`
