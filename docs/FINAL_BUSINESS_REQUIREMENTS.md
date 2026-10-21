# Final inspection business requirements

## Implementation boundary

This canonical Next.js frontend has explicit local mock repositories, durable IndexedDB evidence/upload/submission state and runtime Site Settings. This phase adds source-owned identity, status-aware returns, assigned staff decisions and visual settings. No ASP.NET API, production authentication, SMS delivery or brokerage forwarding is implemented. Each brokerage is a separate deployment; the server must enforce its tenant boundary independently of browser routing.

## Customer identity and tracking

`CustomerSourceAdapter` supplies tenant, subject, sourceRequestId and mobile. The mock supplies the established sample number; URL phone/role/tenant parameters are never identity. OTP remains in use. The customer sees a masked, read-only phone; resend uses the same identity. A matching prior successful mock OTP session can be restored in that tab for 30 minutes; IndexedDB data alone never grants entry. Closing the tab or expiration requires the existing mock OTP again, followed by restoration of the same inspection. This is test convenience, not production authentication.

`LifecycleRepository` keeps a tenant/subject/sourceRequestId index (legacy default keys preserved) to the current inspection. It preserves `insp_demo` / `BDI-8F31K2` and issues explicitly `MOCK-` codes for local new attempts. Production tracking must be unique, backend-issued and searchable only by authorized staff. Receipt copy does not grant public access to records or media.

## Capture and corrections

The configurable current template remains seven sections, twelve photographs, one integer odometer reading and one walk-around video. Odometer is not a file; video is not a photograph. Capture/upload/submission rules continue to use their existing derived helpers. The production photography default stays 2D; the optional viewer stays isolated and unchanged.

Partial media corrections retain the same inspection and canonical requirement IDs, request namespaces, accepted originals and revisions. Only explicitly requested items are editable. Vehicle corrections are separate tasks for plate, body color or model year, with public reason, submitted proposal and assigned Reviewer approval. Other submitted fields remain locked. Staff notes never enter the customer projection.

Full rejection requires a complete customer-visible reason. The rejected record and local evidence survive. An explicit confirmed start-over creates one new linked mock attempt with new media namespace, no copied photographs/video/odometer or consent. Double activation returns the same new attempt. Production creates this link transactionally through the backend.

## Staff operations

Only a Site Admin assigns/reassigns cases or changes capacities. Only the assigned Reviewer decides evidence, requests fields, writes notes, approves field proposals and makes a separate whole-inspection decision. Whole approval requires current required evidence individually approved and outstanding field corrections resolved. There is no bulk approval. Final rejection requires a public reason; actor and time are retained. Whole approval does not imply forwarding or verification of binary uploads.

Admin metrics derive from the actual local case repository. Their links filter the existing operational list; search supports tracking, phone, plate and lifecycle. Reviewer search remains limited to assigned cases. Sample role switches remain visibly local, with typed future staff-session adapter contracts. Production must replace mock actors and enforce roles/assignment on every request.

## Brokerage configuration

The existing Site Settings provider remains authoritative. Primary/secondary, optional accent and customer halo color/intensity, images, draft/publication and live preview share one validated schema/repository. Visual reset changes only theme fields. Old publications/history remain intact; optional fields are backward compatible. Blue/cyan Admin/Reviewer surfaces remain independent of customer themes.

Neshan configuration is centrally owned across brokerages. Site Admin sees configured/unconfigured status, not an editable API-key field. Repository guards reject changes to the map configuration through visual-settings save. Deployment/API infrastructure and private SSO/service credentials are not ordinary branding settings. The existing development-only Neshan proxy and production static frontend boundary are unchanged.

## Forwarding and notifications

Approval, delivery pending, delivery failure and acknowledged delivery are distinct. Only backend-confirmed acknowledgement ID and time may justify `FORWARDED`. The frontend never transfers private media to arbitrary brokerage URLs. Backend owns destination allowlists, credentials, idempotency, retries and delivery audit. Optional notification events carry customer-safe information; status remains available through authorized entry without depending on SMS. No notification gateway runs in this frontend.

Current pre-API consolidation: see [FRONTEND_API_REQUIREMENTS.md](FRONTEND_API_REQUIREMENTS.md), [INSPECTION_STATE_MACHINE.md](INSPECTION_STATE_MACHINE.md) and [PRE_API_FINAL_READINESS_REPORT.md](PRE_API_FINAL_READINESS_REPORT.md). These supplement the existing mock boundaries; they do not implement production services.
