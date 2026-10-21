# API contract review checklist

Date: 2026-10-22. Status: **review preparation, no backend implementation or finalized endpoint count**. Inputs: FRONTEND_API_REQUIREMENTS.md (63 unique capability IDs), API_CONTRACT.md, DATA_OWNERSHIP_AND_SECURITY.md, BROKERAGE_SSO_REQUIREMENTS.md and the completed pre-API readiness report. This is a focused contract review, not another frontend functionality audit.

Use API_IMPLEMENTATION_PRIORITY.md for dependency order and STATIC_DEPLOYMENT_DECISION.md for the proposed deployment boundary. All resource/DTO suggestions below require ASP.NET/product/security agreement. Existing mocks do not establish production authorization, storage guarantees or an SLA.

## Review disposition

The catalog is functionally broad enough to start design review, but **not ready for blind client generation**. It mixes reads, commands, local functions, transfer steps, server workers and aliases. Keep the original 63 capability IDs for traceability; agree a smaller/coherent resource model before fixing endpoint routes. No asserted final endpoint count is appropriate yet.

Confirmed overlap/duplication:

- **F05 = A02**: one published Site Settings read and one existing runtime provider.
- **F09 overlaps F06/F07**: reconcile legacy Admin branding writes into the same settings draft/publication resource. Do not create another config store.
- **G05 = projections of D04/E01/E02**: delivery status belongs to the same lifecycle/read model, not a second status authority.
- **C05 may be a projection of C04**: per-evidence processing/verification status can be obtained from evidence reads or an agreed status view. Separate polling endpoint only if justified.
- **D03 is recovery semantics for D02**: replay the same idempotent command or retrieve its result through a documented receipt/status query; capability does not imply another independent submission.
- **B02/B08/D01 and E01/E02/E10 overlap data, not permissions**: choose small projections/expansion where appropriate. Do not merge customer and staff DTOs and accidentally disclose notes or private histories.
- **D06 and C01/C03**: request-item candidate linkage can be part of generic evidence registration/confirmation. A separate replacement command must not register/upload the same binary twice.
- **A01 is a public static file**, C02 is binary transfer rather than necessarily another business endpoint, F07 visual reset is normally a local draft edit, and G01-G03 are server event/worker duties. Do not count them as customer HTTP endpoints.
- In API_CONTRACT.md, `GET inspection status` is described in multiple phase sections. Consolidate into one versioned schema with extensions, not multiple implementations.

## Logical resources and boundaries

| Resource / responsibility | Capabilities | Contract boundary |
|---|---|---|
| Deployment/public configuration | A01, A02, F05 | Static bootstrap + published public settings; tenant resolved by deployment; one provider |
| Identity/session/challenges | A03-A09 | Source customer handoff, staff SSO, session continuity/revocation, referral/OTP policy |
| Inspection/attempts/facts | B01-B04, B06-B10, D09 | Source-request association, current attempt, consent/location/vehicle/numeric odometer; immutable submitted snapshot |
| Templates/capture plans | B05, F01-F04 | Published pinned version vs editable Admin draft; config-derived requirements |
| Central maps | B11 | Shared authorized Neshan reverse service; independent of brokerage branding/SQL |
| Evidence/transfers/media | C01-C07 | One photo/video resource family, binary authorization/completion/revisions/secure retrieval |
| Summary/submission/status | D01-D04 | Derived readiness, formal submission receipt, recovery, customer-safe lifecycle |
| Correction requests/proposals | D05-D08, E05-E07 | Exact items/reasons/revisions and field proposals, request rounds, supplemental receipts |
| Staff case operations/audit | E01-E04, E08-E10 | Assigned queues, decisions distinct from assignment, internal notes/history, final decision |
| Settings/brand assets | F06-F09 | Validated draft/publication/history + separate public branding upload, no infrastructure secrets |
| Staff/policy administration | F10-F12 | Roles, safe policy/health metadata, allowlisted webhook configuration; unavailable functions stay explicit |
| Notification/delivery jobs | G01-G05 | Server events/outbox, destination acknowledgement, authorized retry and lifecycle projection |

This grouping is not an endpoint design. For example, one paginated case query can supply filters/counts, but binary upload, secure byte-range retrieval and legal decisions have distinct security/consistency requirements and must not be combined solely to reduce a number.

## Complete capability crosswalk

Every original operation appears once as a row below. Dependencies and resolution questions are deliberately explicit.

| ID | Review disposition / required clarification |
|---|---|
| A01 | Keep static bootstrap; agree schema/version, approved API/settings origins and cache policy. Not an authenticated tenant selector. |
| A02 | Canonical public settings projection; publication/version/asset URLs, validation and failure recovery; alias F05. |
| A03 | Define source ticket/session exchange and sourceRequest/vehicle ownership. Mobile/tracking/URL IDs cannot authenticate. |
| A04 | Agree staff OIDC/server-session or one-use ticket, issuer/audience/redirects/role mapping and revocation. |
| A05 | Define read/renewal/expiry responses and concurrent-tab behavior; depends on A03/A04 session choice. |
| A06 | Define local logout vs source logout/revocation, CSRF and failed logout recovery; no mock-only promise. |
| A07 | Agree whether referral remains necessary with source SSO; input/expiry/error/rate-limit DTO. |
| A08 | Define source-owned phone challenge/resend/expiry/attempt counts; no editable phone escalation. |
| A09 | Verify same challenge/source request, consume safely and return scoped session; replay/rate limits. |
| B01 | Stable creation key, server IDs/current-attempt uniqueness and template pin; depends on authorized source context. |
| B02 | Authorized inspection aggregate/read version; whitelist customer vs staff projection and not-found behavior. |
| B03 | Current attempt keyed by tenant + subject + sourceRequest; distinguish none/rejected/current, never auto-create on read. |
| B04 | Own tracking lookup vs staff search are separate scopes; define cursor/sort/filter/count semantics. |
| B05 | Read immutable pinned template incl. photos + separate odometer/video requirements; missing/withdrawn version policy. |
| B06 | Legal content/version, required facts, server acknowledgement time and idempotent acceptance. |
| B07 | Coordinate/accuracy ranges, editable Persian fields, confirmation version; no repeated GPS requirement. |
| B08 | Existing vehicle projection; masking policy, semantic plate and allowed technical identifiers; may compose B02. |
| B09 | Consolidate confirm/plate/discrepancy commands with expectedVersion and allowlist; submitted edits locked. |
| B10 | Read/save integer kilometers, zero valid, safe bound, linked accepted evidence ID; exclude from media count. |
| B11 | Central reverse boundary, authorized origins/quota/errors/manual address fallback; never return private service key. |
| C01 | Register stable clientUploadId/revision -> remote evidence ID, kind/requirement/request/replaces linkage and actual media metadata. |
| C02 | Decide same-origin streamed upload vs scoped transfer URL/session, method/headers/expiry/renewal/integrity; no Base64/video JSON. |
| C03 | Idempotent binary acknowledgement only after verified size/hash and durable file/metadata promotion; compensation on failure. |
| C04 | Current/historical evidence list with remote/local correlation, revision and separate upload/verification state; refresh reconciliation. |
| C05 | Prefer status projection of C04 unless justified; define processing terminal/error transitions and restrained refresh. |
| C06 | Authorized preview/full/range retrieval of exact current/historical revision; native video credentials, URL lifetime and thumbnail design. |
| C07 | Idempotent cancellation/obsolete marker, in-flight race outcome and cleanup lease; never delete good accepted evidence. |
| D01 | Versioned derived summary: facts, pinned requirements, numeric data, current media and blockers; not client readiness authority. |
| D02 | Atomic server readiness and submitted snapshot, stable command key, exact evidence/fact versions and receipt. |
| D03 | Resolve uncertain D02 response with same key/result; pending/not-committed/completed/conflict outcomes, retention. |
| D04 | Customer-safe lifecycle/receipt/requests/delivery read; agree enum mapping and estimates; alias G05 projection. |
| D05 | Active and historical requests/items with exact target/reason/original evidence/version, no unrelated unlock. |
| D06 | Candidate confirmation/linkage must reuse C01-C03 identities; exact request version and original preserved until success. |
| D07 | Supplemental submit uses remote acknowledged evidence IDs, complete current item set and stable key; no local job IDs as authority. |
| D08 | Typed requested-field proposal with task/proposal revision; separate numeric odometer permission from odometer-photo request. |
| D09 | One empty linked attempt after full rejection, same source request; idempotent creation and preserved rejected snapshot/history. |
| E01 | Tenant Admin counts/search vs assigned Reviewer queue; documented paging/count consistency and PII search controls. |
| E02 | Assigned case version/read with private-media references and separate staff projection; history access audited. |
| E03 | Assignment/reassignment is atomic with capacity/version; define conflict and concurrent Reviewer decision behavior. |
| E04 | Versioned assignment policy/capacity DTO, who may change it and calculation of actual workload. |
| E05 | Exact evidence revision decision, mandatory public correction reason, actor/time and idempotent decision; create request scope once. |
| E06 | Allowlisted field correction request with reason/version; source-owned identity is not generally editable. |
| E07 | Exact proposal revision approval; reopening policy unresolved, do not silently implement it as approved. |
| E08 | Staff-only immutable/audited note command, text bounds and permissions; never customer DTO leakage. |
| E09 | Whole-case approval/rejection separate from item decisions; transaction revalidates current revisions/fields/assignment. |
| E10 | Paginated immutable audit/revision access and redaction; decide if part of E02 expansion or separate history resource. |
| F01 | Split workspace projection into bounded/paged resources if needed; minimum published-template read is needed before B01. |
| F02 | Draft/template creation idempotency, source version copy and editor permission. |
| F03 | Draft save/CAS and schema validation; conflict never overwrites another editor; published version immutable. |
| F04 | Publish and archive are different transitions; pin existing inspections and define effective/default template selection. |
| F05 | Explicit alias A02; no additional settings provider/read implementation. |
| F06 | Draft read/save with expectedRevision, strict fields/contrast/approved assets and tenant-bound publication context. |
| F07 | Publish command/history and reset semantics; visual reset is a draft change, not immediate public publication. |
| F08 | Separate branding asset transfer/validation/public URL/versioning; do not put public logos into private evidence workflow. |
| F09 | Deprecate/reconcile legacy saveBranding through F06/F07, keep compatibility adapter if needed; no competing backend store. |
| F10 | Agree provisioning/deactivation/role scope, self-elevation safeguards and immediate session revocation policy. |
| F11 | Only approved webhook IDs/config, never arbitrary destinations/credentials in browser; actual delivery belongs to workers. |
| F12 | Distinguish safe health/policy reads from unimplemented policy writes; do not invent actions for unavailable UI. |
| G01 | Server notification event consumer with consent/template/recipient policy and provider acknowledgement; not client SMS send. |
| G02 | Durable outbox creation in final approval transaction; immutable approved snapshot and stable delivery identity. |
| G03 | Backend-only transfer with destination allowlist/credentials/ack schema; approval does not mean delivered. |
| G04 | Authorized retry existing delivery job with audit/expectedVersion; no new inspection or customer recapture. |
| G05 | Delivery read alias through D04/E01/E02; one lifecycle authority, no independent browser forwarding state. |

## Contract gaps to resolve before OpenAPI freeze

| Gap | Required decision / evidence | Owners |
|---|---|---|
| K01 identity/topology | Source customer and staff flows, exact deployment/callback origins, cookie/CSRF/CORS/logout/refresh, one-use replay and OTP role. | Identity + security + backend + deployment |
| K02 identity lineage | Relationship of logical inspection, sourceRequestId, attemptId, inspectionId, tracking, rejected restarts and unique current attempt. IDs server-owned. | Product + backend + frontend |
| K03 versioned requirements | Pinned template schema/version, stable requirement IDs vs historical shotCode, separate captureRequirements, unavailable template recovery. | Product + template/backend leads |
| K04 upload protocol | Private filesystem is the current storage requirement; older API_CONTRACT examples assume object-storage URLs. Choose a streaming endpoint or scoped URL abstraction compatible with that storage; do not treat object storage as confirmed. | Backend + infrastructure + security |
| K05 remote revision correlation | Stable local upload key maps to remote evidence/revision once. Resubmit mocks use local candidate job IDs, planned HTTP uses remote candidateEvidenceIds. Agree durable mapping, upload authorization renewal and stale revision rules. | Backend + frontend |
| K06 binary policy | Server MIME signature allowlist, size/duration limits, hash algorithm, streaming/range behavior, validation/quarantine failure and retry classification. Local 20 MiB photo/250 MiB video caps and 60s guidance are not agreed server policy. | Product + security + backend |
| K07 command recovery | Idempotency scope/retention/canonical payload, concurrent claim, receipt lookup, pending/in-doubt result and key-reuse conflict. Client lease is not a distributed lock. | Backend + frontend |
| K08 concurrency/legal state | expectedVersion vs ETag/If-Match choice, reassignment races, immutable submission/decision snapshots, correction rounds and terminal-state transitions. | Backend + Reviewer/product |
| K09 correction scope | Batched requests/items, creation/flush timing, per-item statuses, field proposal review/reopen policy, numeric odometer authorization and next-round semantics. | Product + Reviewer + backend |
| K10 projections/enums | Distinct capture/upload/verification/submission/business/forwarding DTO states and mapping; customer projection excludes notes and private paths. Decide query expansion/pagination. | Backend + frontend |
| K11 settings/publication | Sole settings authority, immutable asset/publication references, global Neshan overlay, read-only infrastructure fields, draft conflict and rollback policy. | Admin/product + backend + infrastructure |
| K12 media lifecycle | Private path containment, signed URL/cache/Range policy, server thumbnails, retention/legal holds/orphans/delete audit; no automatic cleanup on submit. | Security + operations + backend |
| K13 forwarding/notifications | Destination payload/ack/idempotency/timeouts/retry/escalation, event ordering/consent and approved copy; test “approval is not delivery”. | Brokerage integration + backend + product |
| K14 delivery/platform alignment | Decide static URL/hosting architecture and auth callback path before integration. Update old `estimatedReviewMinutes:120` example to an agreed estimate shape matching current UI “۳ تا ۵ روز کاری”; neither is a real SLA. | Product + deployment + frontend/backend |

Older `queuedForReview`, `retakeRequired`, `mediaType:image`, CAP-style shot examples and the business lifecycle enums are not interchangeable. Retain compatibility mapping only deliberately. DTO names, casing, date/time format (UTC ISO 8601), numeric bounds/nullability, schema version and unknown-enum recovery must be agreed. Do not repair these ambiguities by silently changing the application's current domain model in this documentation phase.

## Meeting sign-off checklist

### Shared contract and security

- [ ] Every capability ID has an owner, resource/command/read mapping and explicit implemented/planned/deferred classification; agree routes in OpenAPI rather than treating semantic names as URLs.
- [ ] Public bootstrap/published settings contain no private keys, sessions, filesystem paths or infrastructure secrets. Public Web Map key restrictions are deployment-approved; service key stays central/server-only.
- [ ] Server resolves tenant/subject/source request and staff permission/assignment on every query, mutation and media range. Test valid-looking foreign IDs, same phone/different request and assignment revoked during decision.
- [ ] Agree session credentials, expiry/revocation and source callbacks. Existing `readJson` uses `credentials: omit` for public configuration; authenticated business clients need an explicit separate policy, not a global change that leaks credentials to public endpoints.
- [ ] Define common error DTO: safe code, message, field errors, correlation ID and retry guidance. Decide ProblemDetails compatibility. Document 400/422, 401/403/safe404, 409 (and 412 if If-Match), 413/415, 429 Retry-After, timeout/5xx. No raw internals or blind replay after auth/validation failure.
- [ ] Agree opaque identifiers, field lengths, Unicode normalization, plate segments, integer odometer bounds/zero, optional vs null fields, UTC server timestamps, cursor/sort/count consistency and schema/version compatibility.
- [ ] Commands use stable idempotency identity plus payload/version validation. Same key/same payload returns same receipt; same key/different payload conflicts; uncertain responses recover before a new key is attempted. Reads never create attempts or decisions.

### Media, decisions and corrections

- [ ] Same photo/video registration/transfer/completion pipeline; numeric odometer never a Blob/file/photo requirement. Derive file/photo counts from template, not 13/14 constants.
- [ ] Validate ownership and actual bytes/content; do not accept browser private path/destination. Define checksum, durable binary receipt and independent asynchronous processing/verification.
- [ ] For native `<video>`/image playback, agree authenticated cookie stream or short-lived scoped URL (elements cannot simply attach an arbitrary Authorization header). Support video Range/206 and safe 416, correct content type, request expiry/refresh, download policy and private caching.
- [ ] Preview strategy avoids eagerly loading every full-resolution Blob/server video. Authorized lightweight derivatives require their own evidence/revision linkage and access policy.
- [ ] SQL metadata + filesystem promotion needs explicit staging/reconciliation/compensation; do not claim a cross-resource ACID transaction. Old accepted files remain valid during replacement; obsolete queued jobs cannot become current after cancellation races.
- [ ] Server summary/submit atomically requires current accepted photos, valid numeric odometer and video plus all required binary acknowledgements. Uploaded/processing/verified count as binary complete; processing does not imply verified.
- [ ] Exact correction item/task authorizes only its target/version. Preserve submitted history, accepted completion credit and current round. Supplemental receipt lists remote acknowledged revisions; archived/foreign/stale candidates cannot replay.
- [ ] Assigned Reviewer item decisions and whole-case decisions are separate; final approval rechecks every current revision/field and current assignment. Staff notes never enter customer DTOs.
- [ ] Full rejection produces one linked empty attempt on explicit restart; partial correction keeps the same inspection/tracking and unrelated evidence.

### Operations and acceptance

- [ ] Publish immutable settings/template versions; retain old versions needed by existing inspections. Legacy branding writes converge on one authority.
- [ ] Final approval commits durable delivery intent/outbox; transfer retries use the same delivery ID and only validated destination ACK marks FORWARDED. Customer never recaptures solely for delivery failure.
- [ ] Specify retention/legal holds/cleanup and disaster recovery; no local/server deletion solely because upload/submission succeeds.
- [ ] Run OpenAPI schema tests, tenant/role/assignment negative tests, idempotency/concurrency/uncertain-response tests, file integrity/range tests and two-deployment integration gates in API_IMPLEMENTATION_PRIORITY.md.

## Review outputs

Record named decision owners, selected DTO examples (success + structured errors), state transition table, command/version/idempotency rules and an agreed OpenAPI draft with a contract version. Mark unresolved items rather than fabricating backend guarantees. Only after sign-off should frontend adapters or backend endpoints be implemented; the existing 63-entry catalog stays the capability traceability source.
