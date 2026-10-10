# Route Map

Implemented through phase 04: `/`, `/verify`, `/readiness`, `/consent`, and the location/vehicle/capture
inspection routes below. Other product routes remain planned. Internal bootstrap routes:
`/foundation` and `/foundation/preview`. Successful consent enters location; saved location enters
vehicle. Vehicle confirmation enters image-guided photography. Direct
viewing is supported, but submissions require the verified mock workflow and repository prerequisites.

## Customer

- `/` — partner/referral landing
- `/verify` — OTP
- `/readiness`
- `/consent`
- `/inspection/[inspectionId]/location` — implemented with a deterministic map/location adapter
- `/inspection/[inspectionId]/vehicle` — implemented with semantic plate confirmation/editing
- `/inspection/[inspectionId]/capture` — implemented image-guided overview
- `/inspection/[inspectionId]/capture/section/[sectionId]` — large photo requirements
- `/inspection/[inspectionId]/capture/photo/[requirementId]/guide` — sample and guidance
- `/inspection/[inspectionId]/capture/photo/[requirementId]/camera` — explicit live/native capture
- `/inspection/[inspectionId]/capture/photo/[requirementId]/review` — comparison and confirmation
- `/inspection/[inspectionId]/capture/review` — local completion review, no remote submission
- `/inspection/[inspectionId]/upload` — durable local upload queue and mocked Upload Center
- `/inspection/[inspectionId]/review` — final summary, readiness/recovery and mock submit
- `/inspection/[inspectionId]/submitted` — durable receipt/status; submitted edits redirect here
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
