# Product requirements before API integration

Status: frontend/mock behavior implemented; ASP.NET Core, brokerage MSSQL/private media, production SSO and delivery remain future integrations. This document consolidates confirmed decisions; it does not supersede approved visual references or legal copy.

## Product and roles
A Persian RTL mobile-first self-inspection application, independently deployed for each insurance brokerage. Customers capture their own vehicle evidence; assigned Reviewers decide individual revisions and the whole inspection; Site Admins configure branding/templates/staff and assignments. Viewer/template-editor roles retain their narrower existing permissions. Approved blue/cyan operations styling and the application logo remain independent of brokerage identity.

## Customer journey
Source brokerage identity → referral/OTP → readiness → consent → confirmed location → vehicle/plate → 2D photography → local package review → shared Upload Center → final summary → submit → tracking receipt/status. Existing route URLs and default 2D interaction remain. Optional licensed 3D is loopback development only, not a production requirement.

Current package is **12 required photos + 1 integer odometer reading + 1 walk-around video**. Video is not a photo; odometer is not a file. Derived media denominator is required photos plus required video. Template IDs/version are pinned; changes to the template do not retroactively alter existing inspections.

| Section | Canonical required photo IDs |
|---|---|
| نمای راست | front-45-right, back-45-right |
| نمای چپ | front-45-left, back-45-left |
| جلو | front-plate |
| عقب | rear-plate |
| کابین | odometer-on, driver-interior |
| موتور و مشخصات | engine-bay, spec-plate, chassis-number |
| سقف | car-roof |

Camera-only still capture and live walk-around recording remain. Four VIN/spec suggestions change guidance only, never requirement identity. No manual quality checklist, fabricated AI success, coverage tracking or default GLB download. Markers/cards/CTA share selection; vehicle controls remain below the image. Numeric kilometers accept Persian/Arabic-Indic/Latin input, safe grouping and zero, persisted as an integer. A replacement retains accepted evidence until durable confirmation.

## Identity and attempts
Tenant identifies the deployment; subject identifies the customer; sourceRequestId identifies one authorized brokerage insurance request. A customer may have multiple such requests/vehicles. Each local inspectionId identifies a particular attempt; previousAttemptId links a new attempt to a rejected one. The future backend must explicitly agree logical inspection versus attempt IDs; the current implementation does not invent another alias entity. Tracking is a separate staff-search/customer-reference identifier, not authentication.

The typed mock source now includes sourceRequestId. The default request retains legacy demo keys/IDs and old valid tab sessions; a different request receives a separate current index/session and cannot read another request's records. Phone remains source-owned and read-only. Prior unexpired correctly scoped mock OTP sessions may restore; stored evidence alone cannot authenticate. Production trusted request/subject/tenant must come from server authority, not query strings or editable settings.

Draft returns resume a safe saved step; locally complete packages return to upload; submitted/review states return to receipt/status. Exact requests expose only affected media/fields. Expired or mismatched sessions require existing mock verification; private links do not grant access. Full rejection shows a reason and requires explicit confirmation to create a linked empty attempt; previous records/media/history remain and are not copied as valid new evidence.

## Review and delivery
Individual evidence approval is separate from whole-case approval. Only the assigned Reviewer may decide; complete approval requires current required evidence individually accepted and requested field proposals resolved. Corrections require clear public reasons; internal notes remain staff-only. Actor/time are recorded locally and must be server-issued in production. Repeated synchronization uses acknowledged request rounds and never rolls back to archived revisions or mutates finalized evidence.

Submission, review approval, forwarding pending/failure and confirmed delivery remain distinct. Only a delivery acknowledgement can justify successful brokerage delivery. Failure to forward never requires recapturing valid evidence. The receipt estimate remains «۳ تا ۵ روز کاری», explicitly an estimate. Real forwarding, operational retry/outbox and optional SMS are server-owned, not browser delivery.

## Admin and White-Label
Existing lifecycle cards link to actual filtered case lists; authorized search supports tracking/phone/plate/status. Assignment and capacity are Site Admin functions; assigned-review permissions are distinct. No invented metrics or unsafe bulk approval.

One Site Settings provider owns images/logo/contact/content, primary/secondary/accent and halo color/intensity, visual reset, mobile preview, draft/published history and tenant scoping. Reset must not reset infrastructure or delete images/history. Central Neshan configuration is read-only to brokerage Admin. Deployment API/SSO metadata and private secrets are outside ordinary visual settings.

## Confirmed versus undecided
Confirmed: current package/IDs, camera-only flow, exact retakes, atomic replacement, linked new attempts, source-owned phone, no false delivery, separate deployment/data per brokerage, shared central Neshan, existing URL/legal/brand preservation.

Requires product/backend approval: production OTP role, source/attempt ID contract, binding media MIME/size/duration policy, retention/deletion, actual review SLA, signed media delivery protocol, SSO/session/cookie topology, static route migration/hosting rules, forwarding timeout/retry/ack schema and commercial asset clearance. Existing client safety caps are documented implementation guards, not newly approved server policy.

See INSPECTION_STATE_MACHINE, DATA_OWNERSHIP_AND_SECURITY, FRONTEND_API_REQUIREMENTS and PRE_API_ACCEPTANCE_MATRIX for precise boundaries and evidence.
