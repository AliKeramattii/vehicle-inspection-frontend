# Dependency-ordered API implementation plan

Date: 2026-10-22. **Planning only. No backend or production adapter is implemented by this task.** The frontend remains READY WITH DOCUMENTED BLOCKERS. The 63 capability IDs in FRONTEND_API_REQUIREMENTS.md describe business/technical duties, not 63 confirmed endpoints. Resource consolidation and unresolved K01-K14 decisions are in API_CONTRACT_REVIEW_CHECKLIST.md.

## Ordering principle

Resolve identity, tenant/resource authority, versioning and durable command/media identity before connecting mutations. Build vertical slices that replace existing adapters while retaining the same frontend domain models. Do not replace mock behavior with HTTP-shaped data directly inside components. Do not connect a production customer journey to a partially authorized backend just because its happy path works.

Recommended deployment architecture is finite Next static entry pages with query context and explicit compatibility redirects (STATIC_DEPLOYMENT_DECISION.md), **awaiting approval**. The application routing migration is a separate task. API contract design can proceed in parallel, but approved auth callbacks/origins and Node-free host tests gate end-to-end deployment.

```text
S0 contract / identity / hosting decisions
  -> S1 security, tenant binding, durable command/version foundation
     -> S2 published configuration + minimum immutable template seed
        -> S3 authorized inspection/attempt/facts + pinned plan
           -> S4 shared media transfer, retrieval and revision reconciliation
              -> S5 summary / submit / receipt / customer status
                 -> S6 assigned review / decisions / audit
                    -> S7 exact corrections / rereview / rejected restart
                    -> S9 final approval outbox / delivery / notifications
     -> S8 Admin authoring / roles / publication (after relevant S2/S3/S6 contracts)
All relevant slices + approved routing/hosting -> S10 two-brokerage release acceptance
```

S8 role primitives are seeded in S1 and published-template reads in S2: the customer slice does not wait for a complete Admin editor. Durable idempotency/audit/outbox foundations precede legal commands even though delivery workers are connected later. The existing development Neshan service is not rewritten under this plan.

## S0 — Resolve contract blockers and freeze the first contract version

**Priority:** P0, before backend implementation. **Owners:** backend lead, frontend lead, identity/security, product, deployment and brokerage integration.

Resolve K01-K03 and K07-K08 first: sourceRequest/attempt identities, customer/staff session policy, tenant resource isolation, version/CAS mechanism and idempotency recovery. Approve the static architecture/URL contract and hosting/auth callback responsibilities. Agree OpenAPI conventions and safe error shape.

Resolve K04-K06/K12 before media work: filesystem vs transfer-URL abstraction, bytes/MIME/size/duration/hash, remote revision mapping, secure streams/previews/ranges and retention policy. Resolve K09-K11 before review/Admin, K13 before real forwarding. K14 aligns estimates/state examples with current product copy instead of promoting old fixtures into a real SLA.

**Deliverable:** signed resource map and versioned OpenAPI draft with success/error examples, transition invariants and decision owners. No endpoint count target. Mark deferred capabilities explicitly; do not accept “TBD” for authorization or data-loss-critical behavior.

**Exit gate:** review checklist has accountable decisions for the slice to start; consumers agree fixtures generated from the same schema. Do not generate a final client from the current illustrative API_CONTRACT examples alone.

## S1 — Trusted identity, tenant isolation and durable command foundation

**Capabilities:** A03-A09; prerequisites for F10 and all protected resources. A01 deployment bootstrap contract is established here, not a new API operation.

1. Register the approved brokerage deployment/origins and source customer/staff trust boundary. Implement server validation, tenant/request/subject association and roles/assignment permission primitives.
2. Define session read/renewal/logout/revocation and source-owned phone/challenge policy. Preserve the existing OTP user journey unless product explicitly changes it. Mock A4K9P2/12345 never becomes a production credential.
3. Establish durable command/idempotency records scoped to authorized tenant/resource/operation, canonical payload/revision checks, uncertain-response recovery and server actor/time/audit. Choose expectedVersion or ETag semantics once.
4. Establish structured errors/correlation and secret/PII-safe logs. Configure exact CORS/credential/CSRF policy only if separate origins require it; prefer the approved same-origin ASP.NET session boundary.

**Frontend boundary:** CustomerSourceAdapter, AuthRepository and StaffSessionAdapter; public settings fetch remains credential-free. Do not rely on browser role switches/tab storage/URL IDs.

**Exit tests:** wrong tenant/issuer/audience/sourceRequest, expired/replayed handoff, same phone/different request, challenge replay/rate limits, revoke/logout, permission escalation, duplicate command and conflicting-key payload. Source data and private media must be denied without authority, independent of the route UI.

## S2 — Public configuration, pinned templates and shared maps

**Capabilities:** A01-A02/F05, B05 read contract, minimum F01/F04 published-version availability; B11 as an independent central-service integration.

1. Serve public bootstrap on each brokerage origin with approved API/settings references. Integrate the existing sole SiteSettingsProvider with published settings, not a new config store. Keep global Neshan policy separate from Admin visual edit authority.
2. Supply an immutable initial published template and stable photo requirement IDs, plus separate odometer/video capture requirements. The current 7 sections/12 photos remain configuration, not platform constants.
3. Integrate the authorized central ASP.NET reverse-geocoding service contract and domain-restricted public map policy. Keep private keys central/server-only and production independent of the local Node proxy. Do not change the working map picker or development proxy while merely planning this slice.

**Exit tests:** same static artifact loads two independent deployments; foreign tenant/API rebinding is rejected; public settings contain no secrets; malformed/unavailable bootstrap is recoverable; pinned old templates remain readable; reverse geocoding unavailable/rate-limit leaves manual address editing intact. Real authorized Neshan tests belong to the approved integration rollout, not this documentation task.

## S3 — Inspection ownership, returning attempts and confirmed facts

**Capabilities:** B01-B04, B06-B10; consumes B05. D09 restart semantics are specified now and connected after S7.

Implement creation/current-attempt lookup by tenant + subject + sourceRequest, server-generated inspection/attempt/tracking IDs, legal consent receipts, confirmed location, semantic vehicle plate/facts and integer odometer. Retain the original submitted snapshot independently from later correction proposals. Search/lookup returns only authorized records; a tracking number is not access authority.

**Frontend boundaries:** InspectionRepository, lifecycle current-attempt lookup, consent/facts adapters and CaptureDataStore. Do not duplicate server entities into Zustand or discard local captures during adapter initialization.

**Exit tests:** duplicate create returns the same attempt; independent source requests remain separate; resumed inspection uses pinned plan; consent version and fact CAS reject stale edits; plate segments/numeric odometer are typed; zero kilometers is valid; submitted facts are locked; no silent new attempt on read. Direct inspection IDs need ownership checks even when syntactically valid.

## S4 — One evidence resource and durable upload pipeline

**Capabilities:** C01-C07; foundation for D06/D07 and secure Reviewer media.

1. Persist stable clientUploadId/revision -> remote evidenceId correlation. Validate required kind/target/template/request/replaces IDs. Renew transfer authorization for the same evidence identity, not a new registration on each refresh.
2. Stream Blob/File to approved private staging without Base64/JSON media or extra large video copies. Decide transfer metadata/expiry/headers/hash from the agreed contract, not a hardcoded object-storage assumption.
3. Complete idempotently only after actual integrity and durable promotion. Reconcile SQL/file failures with explicit compensation/jobs; do not claim a transaction across arbitrary filesystem and SQL operations.
4. Expose separate binary-transfer and processing/verification state through listing/reconciliation; authorized thumbnail/full/history/video-range retrieval must work for both customer and staff permissions.
5. Honor obsolete revision cancellation and replacement races. Keep originals and accepted local evidence. Reconcile queue metadata after refresh without duplicating server evidence or overwriting a newer revision.

**Frontend boundaries:** existing shared UploadTransport/UploadCoordinator/queue and EvidencePreview; no independent video uploader. Odometer synchronizes as numeric data, never a queue file. Existing whole-file retry is acceptable unless a resumable protocol is explicitly agreed.

**Exit tests:** photo + large video, offline interruption/reconnect/refresh, duplicate register/complete, expired authorization renewal, transient retry/non-retryable failure, hash/size mismatch, missing Blob/recovery, cancellation during transfer, old/current revision races, unauthorized historical media, Range/206/416 and private caching. The current configured package yields 12 photo files + 1 video; tests also use a different template to prevent hardcoded totals.

## S5 — Authoritative summary, submit recovery and customer status

**Capabilities:** D01-D04, G05 customer projection. Requires S3 facts and S4 binary acknowledgements.

Server derives readiness and atomically freezes the current inspection/facts/template/evidence revision snapshot when submitting. Required photos, valid numeric odometer and accepted video are separate requirements. Uploaded/processing/verified may count as binary complete; processing never claims verification. Queued/uploading/local/failed required media blocks submit. Offline formal submission remains blocked in the current product behavior.

Persist one receipt/reference and recover it using the same idempotency identity after double activation, timeout or restart. Customer status is a safe projection of the business lifecycle, including future correction/final delivery statuses; do not expose internal notes. Submitted edits are denied at the API, not just by client guards.

**Frontend boundaries:** readInspectionSummary/deriveInspectionSummary, SubmissionService/Repository/Transport, InspectionStatusAdapter. The backend revalidates; frontend readiness is presentation, not a security check.

**Exit tests:** missing photo/odometer/video, each upload threshold, conflicting evidence revisions, duplicate submit, crash after commit/before response, replay returns same receipt, submitted-route edit denial, safe direct receipt before submit and persisted return. Exact estimate shape/copy is approved product metadata, not an invented 2-hour SLA.

## S6 — Assigned Reviewer case operations, decisions and immutable audit

**Capabilities:** E01-E10, with request/proposal commands E05-E07 sharing S7 resources; F10 role authorization prerequisites from S1. Requires S4 secure media and S5 immutable submission.

Implement paginated queues/counts/search, assignment/reassignment/capacity, case projections/private history and staff-only notes. Commit exact evidence revision decisions independently from whole-case decisions. A Reviewer is authorized only while assigned; Site Admin configuration permission does not automatically grant decision rights.

Whole-case approval must atomically recheck current required evidence/fields and assignment/version; reject requires complete customer-safe reason. Build the final-approval/outbox transaction contract now even if the delivery worker is not yet enabled. No FORWARDED state without destination acknowledgement.

**Frontend boundary:** ReviewRepository, ReviewerWorkspace and assigned command adapters; preserve newest acknowledged revision behavior and terminal-state guards.

**Exit tests:** tenant/assignment negative cases, reassignment between read and decision, two concurrent decisions/CAS conflict, obsolete evidence decision, staff-note leakage, item approval cannot finalize case, late mutations cannot reopen a terminal state, audit actor/time from server and actual dashboard metrics.

## S7 — Exact corrections, supplemental receipts and full-rejection restart

**Capabilities:** D05-D09, E05-E07. Depends on S3/S4/S5/S6; reuses generic evidence, never a second upload subsystem.

Define request rounds/items/reasons and exact field tasks. Allow only requested photo/video or typed field proposals. An odometer-photo retake does not grant permission to change numeric odometer unless explicitly requested. Accepted evidence/history remains valid during replacement; supplemental submit identifies remote acknowledged current candidates and complete active item scope.

After an acknowledged supplemental receipt, select only the newest valid revision per target. Old rounds, foreign candidates and unacknowledged local drafts cannot become Reviewer truth. Full rejection creates one explicitly requested, linked empty attempt under the same source request, retaining the rejected record and no copied evidence.

**Frontend boundaries:** RequestRepository/RequestService/ResubmitTransport, exact task adapters and existing lifecycle/revision helpers.

**Exit tests:** repeated rounds, mixed photo/video/field tasks, partial unrelated evidence lock, newest revision reconciliation after refresh, archived request replay, same-key supplemental retry, final-case lock, replacement failure preserves original, distinct odometer scopes and idempotent empty restart.

## S8 — Admin authoring, publication and operational policies

**Capabilities:** F01-F12 (F05 aliases A02, F09 converges on F06/F07); E03/E04 administrative policy where relevant. Can proceed after relevant S1/S2/S3 contracts, independently of most camera UI.

Implement template draft/version/publish/archive, single settings draft/publication/history and separate validated public brand assets. Keep inspection templates pinned and published versions immutable. Visual reset edits a draft; it does not publish automatically. Reconcile legacy branding writes through the same authority.

Implement agreed staff provisioning/role/deactivation and allowed webhook toggle/health metadata. Do not create arbitrary endpoint/secret editors or policy write APIs for existing unavailable/read-only controls. Global Neshan, SQL, SSO and forwarding credentials remain infrastructure-owned.

**Exit tests:** editor/viewer/admin roles, stale draft save/publish, publication idempotency, old inspection template retained, two-tenant isolation, sanitized asset MIME/dimensions, no private evidence made public, no self-elevation, revocation consistency, global read-only settings cannot be overwritten and cross-device publication reaches the same provider.

## S9 — Backend notification and final forwarding workers

**Capabilities:** G01-G05, authorized retry G04; depends on S6 final decision and S1 durable command/audit foundation. F11 provides allowlisted event policy, not a browser network sender.

Persist delivery intent in the approval transaction. Workers use approved snapshot/references, private media, stable delivery/event IDs and configured server-side destinations/credentials. Apply finite retry/backoff, classified permanent failures, timeout/escalation and replay-safe acknowledgement reconciliation. Notification failure must not erase a valid status or imply inspection failure.

Only an authenticated, validated destination acknowledgement marks FORWARDED. FORWARD_FAILED remains operational delivery recovery; it does not require customer recapture. Expose safe status through existing D04/E01/E02 projections rather than another lifecycle store.

**Exit tests:** approval/outbox atomicity, crash before/after external send, duplicate destination ACK, slow/uncertain response, failed/retry then success, permanent failure escalation, unauthorized retry, tenant destination isolation and recipient/consent/no-secret logging. Do not connect an unapproved actual insurer destination merely to exercise this plan.

## S10 — Integration and release gates

- Approve and execute routing migration separately; test actual Node-free release on intended ASP.NET/IIS/Nginx host, two brokerage subdomains, new runtime IDs, refresh/back/deep links and auth callbacks. Address the observed Next 16.3.8 Windows segment-prefetch artifact gate before release.
- Generate/adapt TypeScript DTOs only from agreed OpenAPI; preserve domain types and frontend validation. Version the contract and support current persisted drafts/queues without destructive namespace changes.
- Test real session expiry/revocation, resource authorization, request lineage, private media, uncertain receipts, queue/revision replay and delivery ACKs. Contract tests are not replaced by mock unit tests.
- Preserve approved mobile AppViewport/100dvh, 2D photography/interactive markers, controls below artwork, automatic continuation, Persian RTL/LTR technical IDs, odometer/video/IDB durability, offline recovery, accessibility and existing baselines. Test Android Chrome/iPhone Safari media/storage behavior explicitly.
- Keep authorized live Neshan and isolated optional 3D behavior unchanged. Restricted noncommercial GLBs remain excluded unless rights are separately cleared. Do not include env/test evidence/reference art in static release output.
- PWA manifest/SW/cold-offline behavior is a separate unresolved release decision; IndexedDB retry alone is not installability. Document supported browsers, HTTPS/media permissions, monitoring/backup/retention and rollout/rollback.

## Practical review milestones

| Milestone | Demonstration required before next rollout |
|---|---|
| Contract-ready | K01-K14 owners/decisions, OpenAPI draft, resource map, URL/auth topology approval; no backend claims based on mocks |
| Authorized setup slice | Two tenant/source-request contexts, current attempt + pinned plan + fact saves, denied foreign resource, no identity editable by URL |
| Durable media slice | Photo/video across interruption and restart, one server identity, private playback/ranges, safe replacement and numeric odometer separate |
| Formal submission slice | Server summary/blockers, atomic submit, persisted same receipt after uncertain response and ordinary edit lock |
| Review/correction slice | Assigned exact decisions, new request round and scoped revisions, immutable original, final approval gated |
| Publication/operations slice | Versioned settings/template publication, staff revocation and safe cross-device read, single config authority |
| Delivery slice | Durable outbox + idempotent destination acknowledgement, failure/retry, truthful customer status |
| Production candidate | Approved static migration/intended-host proof, security tests, physical media QA and unchanged local recovery; no production Node process |

No backend development, authentication integration, routing migration or next product phase begins automatically. The immediate next step is architecture approval and a contract-review meeting using these documents, not endpoint implementation.
