# ASP.NET team handoff: isolated brokerage installation

## Verification status
No live backend endpoint is verified by this repository. All business endpoints are planned; typed frontend mocks exist. Public Site Settings HTTP loading is implemented as a boundary, exercised with deterministic intercepted responses, not proof of deployed ASP.NET. Production integration is blocked until backend capabilities/authorization/storage are supplied. No existing-but-needs-change API is asserted without an OpenAPI audit.

## Common rules for all endpoints
Authenticated requests use brokerage browser session (planned HttpOnly/Secure cookie; final method requires backend agreement). Never expose private OTP/service/signing keys. Tenant is resolved from validated installation/session, never trusted from submitted tenantId. Authorize customer inspection ownership and reviewer/Admin roles per operation. Same-origin preferred; separate origin uses exact CORS/cookie/CSRF/Origin policy. Rate-limit OTP/public fetch/mutations/upload by authenticated context, audit consequential changes, return correlation ID without stack/SQL/root leakage.
Responses use domain DTOs adapted by frontend, UTC timestamps and structured field errors. 400/422 malformed/validation; 401 session; 403 scope/permission; 404 absent; 409 revision/state conflict; 413 media size; 415 signature/type; 429 limit; 5xx transient. Retry only retryable failures with stable keys; no blind duplication. Metadata/idempotency rows must be durable, scoped by tenant/inspection/version. File/media retrieval always authorized and retention-aware.

## Settings/admin endpoints (all planned, blocked pending ASP.NET)
| Endpoint | Purpose/auth | Request -> response | Idempotency/concurrency | MSSQL/filesystem/retention |
|---|---|---|---|---|
| GET /api/public/site-settings | Public allowlisted settings for server-resolved installation | No arbitrary tenant query -> strict schema 1/version/identity/theme/images/application | no-store; publication version; no credentials/private fields | Published config only; public sanitized brand asset references, no private roots |
| GET /api/admin/site-settings | Authenticated authorized Admin | -> published/draft/revision/history | ETag/expectedRevision | Tenant config/publication/audit metadata; no evidence bytes |
| PUT /api/admin/site-settings/draft | Admin edit permission | validated settings + expectedRevision -> saved draft/revision | 409 stale; repeated same draft safely accepted | Config only; validate permitted assets/published template; no old inspection mutation |
| POST /api/admin/site-settings/publish | Admin publish permission | revision + stable idempotencyKey -> immutable publication | stable key returns same result; one audit event | Published config snapshot/history; assets retained while referenced |
| POST /api/admin/branding-assets | Authorized scoped asset upload | binary + asset role -> ID/public versioned reference/MIME/size/dimensions | registration key/revision; bounded transfer | Sanitize/reencode/check signature/limits; backend public branding storage distinct from private evidence; cleanup only unreferenced approved |
| GET /api/admin/system/health | Authorized operations view | -> nonsecret API/storage availability, checkedAt, safe diagnostic codes, authorized retention summary | No mutation; restrained fetch | Never connection strings, physical root or filesystem listing; failure must not look healthy |

Existing planned /api/admin/capture-templates operations remain separate; publication selects future inspection snapshot only. Existing permissions/users/webhook contracts still require real server enforcement.

## Evidence/customer endpoints (all planned, existing frontend boundary)
| Endpoint | Purpose/auth | Request -> response | Idempotency/retry | MSSQL/filesystem/retention |
|---|---|---|---|---|
| POST /api/referrals/validate | Public rate-limited invitation lookup | code -> safe partner/invitation result | Read-like retry; no key/token exposure | Tenant invitation metadata; no media |
| POST /api/auth/otp/request | Rate-limited allowed mobile/referral | -> challenge expiry/cooldown/attempt metadata | Stable request policy prevents SMS floods | Private OTP/provider state; no client secret |
| POST /api/auth/otp/verify; GET /api/me | Verify challenge / read browser session | -> authenticated inspection/user scope | Consumed challenge; secure session recovery | Ownership/session audit; cookie/CSRF policy backend |
| POST /api/inspections; GET /api/inspections/{id}/capture-plan | Create/pin or retrieve authorized inspection | -> stable ID/pinned templateVersion/seven sections/current requirements | Idempotent create; immutable snapshot per inspection | SQL relationships; no directories until authorized evidence transfer |
| PUT /api/inspections/{id}/odometer | Customer editable/request-authorized numeric reading | integer kilometers,evidenceId? -> saved reading/version | revision/idempotent value; submitted edit lock | Separate numeric data, never Blob/file denominator |
| POST /api/inspections/{id}/evidence | Register photo or video-360 revision | kind,requirementId?,mimeType,size,local stable key,request linkage? -> evidenceId/revision/upload metadata | Stable job key; no new evidence on restart; 409 stale/request conflict | Evidence metadata, pending stage manifest; authorize requirement/replacement |
| Binary upload URL from registration | Customer authorized bounded transfer | streamed Blob -> transferred result | Restart file acceptable unless ranges negotiated | Private staging, validate signature/size, safe INSPECTION_{InspectionId} folder; no Base64 or SQL BLOB |
| POST /api/evidence/{evidenceId}/complete | Finalize authorized transfer | revision/key -> uploaded/processing/verified explicitly | Repeated same revision returns same result | Safe file publish plus SQL path/metadata; compensation/reconciliation across failure |
| GET /api/inspections/{id}/evidence | Authorized media status list | -> revisions/status/MIME/size/processing/reviewer reason | Read; retry transient safely | Only current/historical authorized metadata; deleted/retained flags |
| GET /api/inspections/{id}/evidence/{evidenceId}/file | Authorized bytes for selected permitted revision | server resolves ID, optional authorized revision -> stream/content type/length | GET and range resume for video | Resolve private relative path; no caller path; 404/410 if absent/deleted, no public browsing |
| GET /api/inspections/{id}/summary | Authorized derived facts/gates | -> capture/upload/location/vehicle/odometer/video/pinned version | Read | Metadata aggregation; no eager binaries |
| POST /api/inspections/{id}/submit | Authorized complete inspection | stable submission key -> receipt/reference/status | Durable idempotency including uncertain response; no duplicate submit | Submission snapshot/lock/audit; do not delete local/server media |
| GET /api/inspections/{id}/status | Customer current receipt/review state | -> current state/ETA estimate/request metadata | Restrained read, no fabricated review completion | Status metadata/retention boundary |
| GET /api/inspections/{id}/evidence-requests | Authorized additional evidence request | -> immutable original receipt/pinned allowed replacements/reasons | Read; stable request ID/revision | Request references retained original evidence |
| POST /api/evidence-requests/{requestId}/replacement | Request-scoped new revision registration | requirement/video linkage + key -> upload contract | Same generic queue, stable revision/request key | Keep accepted original; separate revision filenames |
| POST /api/inspections/{id}/resubmit | Authorized requested replacements uploaded | request/revision/idempotency key -> request receipt | Atomic request-state transition; retry safe | Preserve original submission; audit replacement pointers |
| Retention/deletion service (no public mutation endpoint proposed) | Server-only approved lifecycle | approved policy/holds -> eligible deletion/audit metadata | Reconcile partial/missing-file failures | RetentionUntil/DeletedAt; never delete active/referenced media |

Consent, confirmed location/vehicle/plate endpoints retain their existing contracts and owner/terms/submission guards. Backend adapters handle brokerage legacy MSSQL/business API differences; React does not contain brokerage SQL logic.

## Storage contract and tests
BROKERAGE_STORAGE_SPEC is authoritative: INSPECTION_{InspectionId} directly below private root; no CustomerId paths; MSSQL metadata/relative paths only. Filesystem and SQL are not automatically one atomic transaction. Implement staged streaming, reconciliation/compensation and exclusive revision names. All ID-to-path mapping is server-owned, canonical and containment-checked.
Integration tests must cover tenant/owner denial, traversal/reparse escape, MIME/signature/limits, crash between filesystem/SQL steps, idempotent restart, revisions preserving originals, authorized range playback, denied root browsing, retention holds and cleanup reconciliation. Frontend path tests do not prove these controls.

## Deployment gate
Supply reviewed OpenAPI, environment/session/CORS/CSRF/auth contracts, brokerage database migration, private storage ACL/root, health diagnostics, metadata/file transfer and retention approval. Then replace explicit mock adapters incrementally with contract tests. Static frontend route/image/PWA migration also remains required before Node-free commercial release.
