# Route Map

Implemented through phase 02: `/`, `/verify`, `/readiness`, and `/consent`. The other product
routes below remain planned. Internal bootstrap routes: `/foundation` and `/foundation/preview`.
Consent completes on `/consent` with a confirmation; no location scaffold or Phase-03 route
exists yet. Direct consent viewing is supported, but recording requires the verified mock workflow.

## Customer

- `/` — partner/referral landing
- `/verify` — OTP
- `/readiness`
- `/consent`
- `/inspection/[inspectionId]/location`
- `/inspection/[inspectionId]/vehicle`
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
